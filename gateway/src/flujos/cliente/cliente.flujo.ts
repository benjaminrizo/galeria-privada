import { Inject, Injectable, Logger } from '@nestjs/common';
import { BusDeEventos } from '../../comun/bus-eventos.service';
import { ErrorDeNegocio } from '../../comun/errores';
import { reintentar } from '../../comun/reintentos';
import { Eventos } from '../../comun/tipos';
import { ClienteDeServicio } from '../../servicios/cliente-http';
import { AUTH, GALERIAS, MEDIA, PAGOS, SELECCION } from '../../servicios/servicios.module';
import { PedirFotosExtraDto } from './dto';

interface Galeria {
  id: string;
  nombre: string;
  clienteNombre: string;
  estado: 'borrador' | 'publicada' | 'seleccion_enviada';
  limiteIncluido: number;
  limiteExtra: number;
  limiteVigente: number;
  precioFotoExtra: number | null;
}

/**
 * Orquestación de los flujos del cliente (SEQ-07 a SEQ-10 y SEQ-12).
 *
 * El cliente no tiene cuenta: se identifica con el código del enlace (ADR
 * 0001), así que cada operación empieza resolviendo ese código.
 */
@Injectable()
export class ClienteFlujo {
  private readonly log = new Logger('FlujoCliente');

  constructor(
    @Inject(AUTH) private readonly auth: ClienteDeServicio,
    @Inject(GALERIAS) private readonly galerias: ClienteDeServicio,
    @Inject(MEDIA) private readonly media: ClienteDeServicio,
    @Inject(SELECCION) private readonly seleccion: ClienteDeServicio,
    @Inject(PAGOS) private readonly pagos: ClienteDeServicio,
    private readonly bus: BusDeEventos,
  ) {}

  /**
   * G-12 · Abrir galería (SEQ-07, composición de consultas).
   * Devuelve la galería, las miniaturas, lo que ya tenía marcado y el contador,
   * todo en una sola respuesta para que la página cargue de una vez.
   */
  async abrir(codigo: string, pagina = 1) {
    const galeria = await this.galeriaDisponible(codigo);

    const [fotos, seleccion] = await Promise.all([
      this.media.get<any>(`/galerias/${galeria.id}/fotos`, { pagina }),
      this.seleccion.get<any>(`/galerias/${galeria.id}/seleccion`),
    ]);

    const marcadas = new Map<string, string | null>(
      seleccion.fotos.map((f: any) => [f.fotoId, f.comentario]),
    );

    return {
      galeria: this.vistaDelCliente(galeria),
      seleccion: {
        estado: seleccion.estado,
        cantidad: seleccion.cantidad,
        limiteVigente: galeria.limiteVigente,
        enviadaEn: seleccion.enviadaEn,
      },
      pagina: fotos.pagina,
      porPagina: fotos.porPagina,
      totalFotos: fotos.total,
      // Solo miniaturas: el cliente nunca recibe la URL del original (RNF-04).
      fotos: fotos.fotos.map((foto: any) => ({
        id: foto.id,
        estado: foto.estado,
        urlMiniatura: foto.urlMiniatura,
        marcada: marcadas.has(foto.id),
        comentario: marcadas.get(foto.id) ?? null,
      })),
    };
  }

  /**
   * G-13 · Marcar foto (SEQ-08, orquestación).
   *
   * 1. Resuelve el enlace.
   * 2. Comprueba que la galería esté publicada y toma el límite vigente.
   * 3. Verifica con ms-media que la foto sea de esa galería, para que nadie
   *    marque identificadores ajenos.
   * 4. Manda el marcado a ms-seleccion con ese límite (HT-12).
   */
  async marcar(codigo: string, fotoId: string) {
    const galeria = await this.galeriaParaSeleccionar(codigo);

    await this.media.get(`/galerias/${galeria.id}/fotos/${fotoId}`);

    const resultado = await this.seleccion.put<{ cantidad: number }>(
      `/galerias/${galeria.id}/seleccion/fotos/${fotoId}`,
      { limiteVigente: galeria.limiteVigente },
    );

    return { ...resultado, limiteVigente: galeria.limiteVigente };
  }

  /** G-14 · Desmarcar foto (SEQ-08) */
  async desmarcar(codigo: string, fotoId: string) {
    const galeria = await this.galeriaParaSeleccionar(codigo);

    const resultado = await this.seleccion.borrar<{ cantidad: number }>(
      `/galerias/${galeria.id}/seleccion/fotos/${fotoId}`,
    );

    return { ...resultado, limiteVigente: galeria.limiteVigente };
  }

  /** G-15 · Guardar comentario de retoque (SEQ-09) */
  async guardarComentario(codigo: string, fotoId: string, comentario: string) {
    const galeria = await this.galeriaParaSeleccionar(codigo);

    return this.seleccion.put(`/galerias/${galeria.id}/seleccion/fotos/${fotoId}/comentario`, {
      comentario,
    });
  }

  /**
   * G-16 · Enviar selección (SEQ-10, orquestación y publicación).
   *
   * 1. Bloquea la selección en ms-seleccion.
   * 2. Pasa la galería a `seleccion_enviada`; si falla, se reintenta, y
   *    mientras no se logre la selección queda igualmente bloqueada.
   * 3. Consulta el correo del fotógrafo.
   * 4. Publica `SeleccionEnviada` con los datos completos (ADR 0007).
   */
  async enviarSeleccion(codigo: string) {
    const galeria = await this.galeriaDisponible(codigo);

    const enviada = await this.seleccion.post<{ cantidad: number }>(
      `/galerias/${galeria.id}/seleccion/envio`,
    );

    const marcada = await reintentar(`marcar ${galeria.id} como selección enviada`, () =>
      this.galerias.post<{ nombre: string; fotografoId: string }>(
        `/galerias/${galeria.id}/seleccion-enviada`,
      ),
    );

    try {
      const fotografo = await this.auth.get<{ correo: string }>(`/fotografos/${marcada.fotografoId}`);

      await this.bus.publicar(Eventos.SeleccionEnviada, {
        galeriaId: galeria.id,
        nombreGaleria: marcada.nombre,
        fotografoCorreo: fotografo.correo,
        cantidad: enviada.cantidad,
      });
    } catch (error: any) {
      // El envío ya está hecho; el aviso es secundario (HU-18).
      this.log.error(`Selección de ${galeria.id} enviada, pero no se pudo avisar: ${error.message}`);
    }

    return { galeriaId: galeria.id, cantidad: enviada.cantidad, estado: 'enviada' };
  }

  /**
   * G-17 · Pedir fotos extra con pago simulado (SEQ-12, orquestación, extra).
   *
   * 1. Resuelve el enlace y consulta el precio por foto extra.
   * 2. Crea el pedido y lo confirma con el pago simulado.
   * 3. Aumenta el límite de la galería; si este paso falla se reintenta, porque
   *    el pedido ya quedó confirmado.
   */
  async pedirFotosExtra(codigo: string, datos: PedirFotosExtraDto) {
    const galeria = await this.galeriaParaSeleccionar(codigo);

    if (galeria.precioFotoExtra === null || galeria.precioFotoExtra === undefined) {
      throw ErrorDeNegocio.conflicto(
        'PRECIO_NO_DEFINIDO',
        'El fotógrafo todavía no definió el precio de las fotos extra.',
      );
    }

    const pedido = await this.pagos.post<{ pedidoId: string; total: number }>('/pedidos', {
      galeriaId: galeria.id,
      cantidadFotos: datos.cantidad,
      precioUnitario: galeria.precioFotoExtra,
    });

    await this.pagos.post(`/pedidos/${pedido.pedidoId}/pago-simulado`);

    const limite = await reintentar(`aumentar el límite de ${galeria.id}`, () =>
      this.galerias.post<{ limiteVigente: number }>(`/galerias/${galeria.id}/limite-extra`, {
        cantidad: datos.cantidad,
      }),
    );

    return {
      pedidoId: pedido.pedidoId,
      cantidad: datos.cantidad,
      total: pedido.total,
      estado: 'confirmado',
      limiteVigente: limite.limiteVigente,
    };
  }

  /** Resuelve el código del enlace y devuelve la galería, si está disponible. */
  private async galeriaDisponible(codigo: string): Promise<Galeria> {
    let galeriaId: string;

    try {
      const acceso = await this.auth.get<{ galeriaId: string }>(`/accesos/${encodeURIComponent(codigo)}`);
      galeriaId = acceso.galeriaId;
    } catch (error: any) {
      // Un enlace inexistente o revocado se responde como galería no encontrada
      // (gateway.md), sin revelar nada más.
      const estado = typeof error?.getStatus === 'function' ? error.getStatus() : 500;
      if (estado === 404) {
        throw ErrorDeNegocio.noEncontrado('GALERIA_NO_ENCONTRADA', 'Este enlace no es válido.');
      }
      throw error;
    }

    const galeria = await this.galerias.get<Galeria>(`/galerias/${galeriaId}`);

    // Mientras siga en borrador, el cliente no debe ver nada.
    if (galeria.estado === 'borrador') {
      throw ErrorDeNegocio.prohibido(
        'GALERIA_NO_DISPONIBLE',
        'La galería todavía no está lista. El fotógrafo te avisará cuando la publique.',
      );
    }

    return galeria;
  }

  /** Igual que la anterior, pero además exige que la selección siga abierta. */
  private async galeriaParaSeleccionar(codigo: string): Promise<Galeria> {
    const galeria = await this.galeriaDisponible(codigo);

    if (galeria.estado === 'seleccion_enviada') {
      throw ErrorDeNegocio.conflicto(
        'SELECCION_ENVIADA',
        'Ya enviaste tu selección, así que no admite más cambios.',
      );
    }

    return galeria;
  }

  /** Proyección de la galería para el cliente: sin datos internos. */
  private vistaDelCliente(galeria: Galeria) {
    return {
      nombre: galeria.nombre,
      clienteNombre: galeria.clienteNombre,
      estado: galeria.estado,
      limiteIncluido: galeria.limiteIncluido,
      limiteExtra: galeria.limiteExtra,
      limiteVigente: galeria.limiteVigente,
      precioFotoExtra: galeria.precioFotoExtra,
    };
  }
}
