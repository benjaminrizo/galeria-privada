import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { BusDeEventos } from '../comun/bus-eventos.service';
import { ErrorDeNegocio } from '../comun/errores';
import {
  DatosGaleriaPublicada,
  DatosSeleccionEnviada,
  Eventos,
  Mensaje,
} from '../comun/tipos';
import { CorreoService } from './correo.service';
import { EstadoDeNotificacion, Notificacion, TipoDeNotificacion } from './notificacion.entity';

/** Tras estos intentos la notificación se deja en `fallida` para revisarla. */
const MAX_INTENTOS = 5;
const MINUTOS_ENTRE_REINTENTOS = 1;

@Injectable()
export class NotificacionesService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger('Notificaciones');
  private reloj: NodeJS.Timeout;

  constructor(
    @InjectRepository(Notificacion)
    private readonly repositorio: Repository<Notificacion>,
    private readonly correo: CorreoService,
    private readonly bus: BusDeEventos,
  ) {}

  async onModuleInit() {
    // A-NOT-01 · EnviarCorreoGaleriaPublicada (HU-17)
    await this.bus.suscribir<DatosGaleriaPublicada>(
      'ms-notificaciones.galeria-publicada',
      Eventos.GaleriaPublicada,
      (datos, mensaje) =>
        this.registrarYEnviar(mensaje, TipoDeNotificacion.GaleriaPublicada, datos.clienteCorreo, datos),
    );

    // A-NOT-02 · EnviarCorreoSeleccionEnviada (HU-18)
    await this.bus.suscribir<DatosSeleccionEnviada>(
      'ms-notificaciones.seleccion-enviada',
      Eventos.SeleccionEnviada,
      (datos, mensaje) =>
        this.registrarYEnviar(mensaje, TipoDeNotificacion.SeleccionEnviada, datos.fotografoCorreo, datos),
    );

    this.reloj = setInterval(() => void this.reintentarPendientes(), MINUTOS_ENTRE_REINTENTOS * 60_000);
  }

  onModuleDestroy() {
    clearInterval(this.reloj);
  }

  /** Q-NOT-01 · ConsultarEstadoDeNotificacion */
  async obtener(id: string) {
    const notificacion = await this.repositorio.findOneBy({ id });

    if (!notificacion) {
      throw ErrorDeNegocio.noEncontrado('NOTIFICACION_NO_ENCONTRADA', 'No existe esa notificación.');
    }

    return {
      id: notificacion.id,
      tipo: notificacion.tipo,
      estado: notificacion.estado,
      intentos: notificacion.intentos,
      destinatarioCorreo: notificacion.destinatarioCorreo,
      creadoEn: notificacion.creadoEn,
      enviadoEn: notificacion.enviadoEn,
      ultimoError: notificacion.ultimoError,
    };
  }

  /**
   * Registra la notificación y trata de enviarla.
   *
   * El registro se guarda primero: así, si el correo falla, el intento no se
   * pierde y el reloj lo retoma. Un fallo de correo nunca devuelve error al
   * broker, porque la acción de negocio ya se completó (HU-17).
   */
  private async registrarYEnviar(
    mensaje: Mensaje,
    tipo: TipoDeNotificacion,
    destinatario: string,
    contenido: Record<string, any>,
  ): Promise<void> {
    // ON CONFLICT DO NOTHING sobre `evento_id`: el mismo evento repetido no
    // genera una segunda notificación ni un segundo correo.
    const insercion = await this.repositorio
      .createQueryBuilder()
      .insert()
      .into(Notificacion)
      .values({
        eventoId: mensaje.id,
        tipo,
        destinatarioCorreo: destinatario,
        contenido,
        estado: EstadoDeNotificacion.Pendiente,
        intentos: 0,
      })
      .orIgnore()
      .execute();

    if (!insercion.identifiers?.[0]?.id) {
      this.log.log(`El evento ${mensaje.id} ya tenía notificación; no se repite el correo.`);
      return;
    }

    const notificacion = await this.repositorio.findOneBy({ eventoId: mensaje.id });
    await this.intentarEnvio(notificacion);
  }

  /** Reintenta lo que quedó pendiente, por ejemplo si el servidor de correo estaba caído. */
  private async reintentarPendientes(): Promise<void> {
    const pendientes = await this.repositorio.find({
      where: { estado: EstadoDeNotificacion.Pendiente, intentos: LessThan(MAX_INTENTOS) },
      order: { creadoEn: 'ASC' },
      take: 20,
    });

    for (const notificacion of pendientes) await this.intentarEnvio(notificacion);
  }

  private async intentarEnvio(notificacion: Notificacion): Promise<void> {
    if (!notificacion || notificacion.estado === EstadoDeNotificacion.Enviada) return;

    try {
      await this.correo.enviar(notificacion);
      await this.repositorio.update(
        { id: notificacion.id },
        {
          estado: EstadoDeNotificacion.Enviada,
          intentos: notificacion.intentos + 1,
          enviadoEn: new Date(),
          ultimoError: null,
        },
      );
      // EV-13 / EV-22: CorreoEnviado
    } catch (error: any) {
      const intentos = notificacion.intentos + 1;
      const agotado = intentos >= MAX_INTENTOS;

      await this.repositorio.update(
        { id: notificacion.id },
        {
          intentos,
          estado: agotado ? EstadoDeNotificacion.Fallida : EstadoDeNotificacion.Pendiente,
          ultimoError: String(error.message).slice(0, 500),
        },
      );

      this.log.warn(
        `No se pudo enviar la notificación ${notificacion.id} (intento ${intentos}): ${error.message}` +
          (agotado ? ' · queda como fallida' : ' · se reintentará'),
      );
    }
  }
}
