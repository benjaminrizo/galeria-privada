import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusDeEventos } from '../comun/bus-eventos.service';
import { ErrorDeNegocio } from '../comun/errores';
import { Eventos } from '../comun/tipos';
import {
  AumentarLimiteDto,
  CrearGaleriaDto,
  DefinirPrecioDto,
  EditarGaleriaDto,
  PublicarGaleriaDto,
} from './dto';
import { EstadoDeGaleria, Galeria, limiteVigente } from './galeria.entity';

@Injectable()
export class GaleriasService {
  private readonly log = new Logger('Galerias');

  constructor(
    @InjectRepository(Galeria)
    private readonly repositorio: Repository<Galeria>,
    private readonly bus: BusDeEventos,
  ) {}

  /** A-GAL-01 · CrearGaleria (HU-04). Nace en borrador. */
  async crear(datos: CrearGaleriaDto): Promise<{ galeriaId: string }> {
    const galeria = await this.repositorio.save(
      this.repositorio.create({
        fotografoId: datos.fotografoId,
        nombre: datos.nombre.trim(),
        clienteNombre: datos.clienteNombre.trim(),
        clienteCorreo: datos.clienteCorreo.trim().toLowerCase(),
        limiteIncluido: datos.limiteIncluido,
        limiteExtra: 0,
        estado: EstadoDeGaleria.Borrador,
      }),
    );

    // EV-04: GaleriaCreada
    this.log.log(`Galería creada: ${galeria.id}`);
    return { galeriaId: galeria.id };
  }

  /** Q-GAL-01 · ListarGaleriasDeFotografo (HU-04, HU-05) */
  async listar(fotografoId: string) {
    const galerias = await this.repositorio.find({
      where: { fotografoId },
      order: { creadoEn: 'DESC' },
    });

    return galerias.map((g) => this.resumen(g));
  }

  /**
   * Q-GAL-02 · ObtenerGaleria (HU-03, HU-11).
   * Con `fotografoId` comprueba la propiedad; sin él es la consulta del flujo
   * del cliente, que llega por enlace y no tiene cuenta (ADR 0001).
   */
  async obtener(id: string, fotografoId?: string) {
    const galeria = await this.buscar(id, fotografoId);
    return this.resumen(galeria);
  }

  /** A-GAL-02 · EditarGaleria (HU-05) */
  async editar(id: string, datos: EditarGaleriaDto) {
    const galeria = await this.buscar(id, datos.fotografoId);

    if (datos.nombre !== undefined) galeria.nombre = datos.nombre.trim();

    if (datos.limiteIncluido !== undefined) {
      const nuevoVigente = datos.limiteIncluido + galeria.limiteExtra;
      const marcadas = datos.cantidadMarcadas ?? 0;

      // No se puede dejar al cliente por encima del límite que ya usó.
      if (nuevoVigente < marcadas) {
        throw ErrorDeNegocio.conflicto(
          'LIMITE_MENOR_A_SELECCION',
          `El cliente ya marcó ${marcadas} foto(s); el límite no puede quedar por debajo.`,
        );
      }

      galeria.limiteIncluido = datos.limiteIncluido;
    }

    await this.repositorio.save(galeria);

    // EV-06: GaleriaEditada
    this.log.log(`Galería editada: ${galeria.id}`);
    return this.resumen(galeria);
  }

  /** A-GAL-03 · EliminarGaleria (HU-05). Publica `GaleriaEliminada`. */
  async eliminar(id: string, fotografoId: string): Promise<void> {
    const galeria = await this.buscar(id, fotografoId);
    await this.repositorio.delete({ id: galeria.id });

    // EV-07: los demás servicios limpian sus datos al recibir el evento (ADR 0008).
    // La galería ya está borrada, así que un fallo del broker no debe hacer
    // fracasar la operación: se registra para poder reenviar el evento a mano.
    try {
      await this.bus.publicar(Eventos.GaleriaEliminada, { galeriaId: galeria.id });
    } catch (error: any) {
      this.log.error(
        `Galería ${galeria.id} eliminada, pero no se pudo publicar GaleriaEliminada: ${error.message}. ` +
          'Quedan datos huérfanos en los otros servicios.',
      );
    }

    this.log.log(`Galería eliminada: ${galeria.id}`);
  }

  /** A-GAL-04 · PublicarGaleria (HU-06) */
  async publicar(id: string, datos: PublicarGaleriaDto) {
    const galeria = await this.buscar(id, datos.fotografoId);

    if (galeria.estado !== EstadoDeGaleria.Borrador) {
      throw ErrorDeNegocio.conflicto(
        'ESTADO_INVALIDO',
        `Solo se publica una galería en borrador; esta está en "${galeria.estado}".`,
      );
    }

    // Supuesto acordado con el equipo: una galería vacía no se publica (HU-06).
    if (datos.cantidadFotos <= 0) {
      throw ErrorDeNegocio.noProcesable('SIN_FOTOS', 'La galería no tiene fotos para publicar.');
    }

    galeria.estado = EstadoDeGaleria.Publicada;
    galeria.publicadaEn = new Date();
    await this.repositorio.save(galeria);

    // EV-12: GaleriaPublicada. El gateway compone el evento de integración con
    // el enlace de acceso y lo publica (ADR 0007).
    this.log.log(`Galería publicada: ${galeria.id}`);
    return {
      galeriaId: galeria.id,
      nombre: galeria.nombre,
      clienteNombre: galeria.clienteNombre,
      clienteCorreo: galeria.clienteCorreo,
    };
  }

  /**
   * A-GAL-05 · MarcarSeleccionEnviada (HU-06, HU-13).
   * Idempotente: si ya estaba enviada, responde igual, porque el gateway
   * reintenta este paso cuando falla (SEQ-10).
   */
  async marcarSeleccionEnviada(id: string) {
    const galeria = await this.buscar(id);

    if (galeria.estado === EstadoDeGaleria.Borrador) {
      throw ErrorDeNegocio.conflicto(
        'ESTADO_INVALIDO',
        'La galería sigue en borrador; no puede recibir una selección.',
      );
    }

    if (galeria.estado === EstadoDeGaleria.Publicada) {
      galeria.estado = EstadoDeGaleria.SeleccionEnviada;
      await this.repositorio.save(galeria);
      this.log.log(`Galería con selección enviada: ${galeria.id}`);
    }

    // EV-21
    return { galeriaId: galeria.id, nombre: galeria.nombre, fotografoId: galeria.fotografoId };
  }

  /** A-GAL-06 · DefinirPrecioFotoExtra (HU-19, extra) */
  async definirPrecio(id: string, datos: DefinirPrecioDto) {
    const galeria = await this.buscar(id, datos.fotografoId);
    galeria.precioFotoExtra = datos.precio;
    await this.repositorio.save(galeria);

    // EV-23
    return { galeriaId: galeria.id, precioFotoExtra: galeria.precioFotoExtra };
  }

  /** A-GAL-07 · AumentarLimite (HU-20, extra) */
  async aumentarLimite(id: string, datos: AumentarLimiteDto) {
    const galeria = await this.buscar(id);
    galeria.limiteExtra += datos.cantidad;
    await this.repositorio.save(galeria);

    // EV-26
    this.log.log(`Límite de ${galeria.id} aumentado en ${datos.cantidad}`);
    return { galeriaId: galeria.id, limiteVigente: limiteVigente(galeria) };
  }

  /**
   * Busca la galería y, si se indica el fotógrafo, comprueba que sea suya.
   * Una galería de otro fotógrafo responde igual que una inexistente, para no
   * confirmar que ese identificador existe.
   */
  private async buscar(id: string, fotografoId?: string): Promise<Galeria> {
    const galeria = await this.repositorio.findOneBy({ id });

    if (!galeria || (fotografoId && galeria.fotografoId !== fotografoId)) {
      throw ErrorDeNegocio.noEncontrado('GALERIA_NO_ENCONTRADA', 'No existe esa galería.');
    }

    return galeria;
  }

  private resumen(galeria: Galeria) {
    return {
      id: galeria.id,
      fotografoId: galeria.fotografoId,
      nombre: galeria.nombre,
      clienteNombre: galeria.clienteNombre,
      clienteCorreo: galeria.clienteCorreo,
      estado: galeria.estado,
      limiteIncluido: galeria.limiteIncluido,
      limiteExtra: galeria.limiteExtra,
      limiteVigente: limiteVigente(galeria),
      precioFotoExtra: galeria.precioFotoExtra,
      creadoEn: galeria.creadoEn,
      publicadaEn: galeria.publicadaEn,
    };
  }
}
