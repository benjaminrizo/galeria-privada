import { Inject, Injectable, Logger } from '@nestjs/common';
import FormData from 'form-data';
import { BusDeEventos } from '../../comun/bus-eventos.service';
import { ErrorDeNegocio } from '../../comun/errores';
import { Eventos } from '../../comun/tipos';
import { ClienteDeServicio } from '../../servicios/cliente-http';
import { AUTH, GALERIAS, MEDIA, SELECCION } from '../../servicios/servicios.module';
import { CrearGaleriaDto, DefinirPrecioDto, EditarGaleriaDto } from './dto';

interface ArchivoSubido {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

/**
 * Orquestación de los flujos del fotógrafo (SEQ-02 a SEQ-06 y SEQ-11).
 * Se mantiene separada de los flujos del cliente para que el gateway no se
 * convierta en un solo bloque de lógica (hotspot H-15).
 */
@Injectable()
export class GaleriasFlujo {
  private readonly log = new Logger('FlujoGalerias');

  constructor(
    @Inject(AUTH) private readonly auth: ClienteDeServicio,
    @Inject(GALERIAS) private readonly galerias: ClienteDeServicio,
    @Inject(MEDIA) private readonly media: ClienteDeServicio,
    @Inject(SELECCION) private readonly seleccion: ClienteDeServicio,
    private readonly bus: BusDeEventos,
  ) {}

  /** G-03 · Listar mis galerías */
  listar(fotografoId: string) {
    return this.galerias.get('/galerias', { fotografoId });
  }

  /**
   * G-04 · Crear galería (SEQ-02, orquestación con compensación).
   *
   * 1. Crea la galería en borrador.
   * 2. Genera el enlace de acceso.
   * Si el paso 2 falla, se elimina la galería recién creada para no dejar una
   * galería sin enlace, y se devuelve el error.
   */
  async crear(fotografoId: string, datos: CrearGaleriaDto) {
    const { galeriaId } = await this.galerias.post<{ galeriaId: string }>('/galerias', {
      fotografoId,
      ...datos,
    });

    try {
      const { codigo } = await this.auth.post<{ codigo: string }>('/accesos', { galeriaId });
      const galeria = await this.galerias.get(`/galerias/${galeriaId}`, { fotografoId });

      this.log.log(`Galería ${galeriaId} creada con su enlace`);
      return { galeria, codigoAcceso: codigo, enlace: this.enlacePublico(codigo) };
    } catch (error: any) {
      // Compensación: la galería no puede quedarse sin forma de acceder a ella.
      this.log.warn(`Falló el enlace de ${galeriaId}; se deshace la creación.`);
      try {
        await this.galerias.borrar(`/galerias/${galeriaId}`, { fotografoId });
      } catch (fallo: any) {
        this.log.error(`No se pudo deshacer la galería ${galeriaId}: ${fallo.message}`);
      }
      throw error;
    }
  }

  /** G-05 · Ver detalle de galería (composición de consultas) */
  async detalle(fotografoId: string, galeriaId: string) {
    const galeria = await this.galerias.get<any>(`/galerias/${galeriaId}`, { fotografoId });

    // El enlace y las fotos son datos de otros servicios; si alguno falla, el
    // detalle sigue siendo útil, así que se consultan sin romper la respuesta.
    const [acceso, fotos] = await Promise.all([
      this.auth.get<{ codigo: string }>('/accesos', { galeriaId }).catch(() => null),
      this.media.get<any>(`/galerias/${galeriaId}/fotos`).catch(() => ({ fotos: [], total: 0 })),
    ]);

    return {
      galeria,
      codigoAcceso: acceso?.codigo ?? null,
      enlace: acceso ? this.enlacePublico(acceso.codigo) : null,
      fotos: fotos.fotos,
      totalFotos: fotos.total,
    };
  }

  /**
   * G-06 · Editar galería (SEQ-03, orquestación).
   * Antes de cambiar el límite se consulta cuántas fotos lleva marcadas el
   * cliente, porque el límite nuevo no puede quedar por debajo (HU-05).
   */
  async editar(fotografoId: string, galeriaId: string, datos: EditarGaleriaDto) {
    let cantidadMarcadas = 0;

    if (datos.limiteIncluido !== undefined) {
      const seleccion = await this.seleccion
        .get<{ cantidad: number }>(`/galerias/${galeriaId}/seleccion`)
        .catch(() => ({ cantidad: 0 }));
      cantidadMarcadas = seleccion.cantidad;
    }

    return this.galerias.patch(`/galerias/${galeriaId}`, { fotografoId, ...datos, cantidadMarcadas });
  }

  /**
   * G-07 · Eliminar galería (SEQ-04, publicación y suscripción).
   * ms-galerias publica `GaleriaEliminada` y cada servicio limpia lo suyo por
   * su cuenta (consistencia eventual, ADR 0008).
   */
  async eliminar(fotografoId: string, galeriaId: string) {
    await this.galerias.borrar(`/galerias/${galeriaId}`, { fotografoId });
  }

  /**
   * G-08 · Subir fotos (SEQ-05).
   * Primero se comprueba que la galería sea de este fotógrafo; después se
   * reenvían los archivos a ms-media, que responde sin esperar las miniaturas.
   */
  async subirFotos(fotografoId: string, galeriaId: string, archivos: ArchivoSubido[]) {
    if (!archivos?.length) {
      throw ErrorDeNegocio.datosInvalidos('No se recibió ninguna imagen.');
    }

    await this.galerias.get(`/galerias/${galeriaId}`, { fotografoId });

    const formulario = new FormData();
    for (const archivo of archivos) {
      formulario.append('archivos', archivo.buffer, {
        filename: archivo.originalname,
        contentType: archivo.mimetype,
      });
    }

    return this.media.enviarFormulario(`/galerias/${galeriaId}/fotos`, formulario);
  }

  /**
   * G-09 · Publicar galería (SEQ-06, orquestación y publicación).
   *
   * 1. Cuenta las fotos en ms-media.
   * 2. Publica la galería en ms-galerias, que rechaza si viene vacía o si el
   *    estado no es borrador.
   * 3. Consulta el enlace de acceso.
   * 4. Publica `GaleriaPublicada` con los datos completos (ADR 0007).
   *
   * La publicación queda hecha aunque el correo falle (HU-17).
   */
  async publicar(fotografoId: string, galeriaId: string) {
    const { total } = await this.media.get<{ total: number }>(`/galerias/${galeriaId}/fotos/total`);

    const publicada = await this.galerias.post<{
      galeriaId: string;
      nombre: string;
      clienteNombre: string;
      clienteCorreo: string;
    }>(`/galerias/${galeriaId}/publicacion`, { fotografoId, cantidadFotos: total });

    const { codigo } = await this.auth.get<{ codigo: string }>('/accesos', { galeriaId });

    // Si el broker estuviera caído, la galería ya está publicada: el aviso se
    // pierde pero la acción principal no se deshace.
    try {
      await this.bus.publicar(Eventos.GaleriaPublicada, {
        galeriaId,
        nombreGaleria: publicada.nombre,
        clienteNombre: publicada.clienteNombre,
        clienteCorreo: publicada.clienteCorreo,
        enlace: this.enlacePublico(codigo),
      });
    } catch (error: any) {
      this.log.error(`Galería ${galeriaId} publicada, pero no se pudo avisar: ${error.message}`);
    }

    return { galeriaId, estado: 'publicada', enlace: this.enlacePublico(codigo), totalFotos: total };
  }

  /**
   * G-10 · Ver selección enviada (SEQ-11, composición de consultas).
   * Combina la galería, las fotos elegidas con su comentario y los datos de
   * cada foto, incluida la URL temporal del original (solo para el fotógrafo).
   */
  async verSeleccion(fotografoId: string, galeriaId: string) {
    const galeria = await this.galerias.get<any>(`/galerias/${galeriaId}`, { fotografoId });
    const seleccion = await this.seleccion.get<any>(`/galerias/${galeriaId}/seleccion`);

    if (!seleccion.fotos.length) {
      return { galeria, estado: seleccion.estado, enviadaEn: seleccion.enviadaEn, cantidad: 0, fotos: [] };
    }

    const ids = seleccion.fotos.map((f: any) => f.fotoId);
    const detalles = await this.media.get<any[]>('/fotos', { ids: ids.join(',') });
    const porId = new Map(detalles.map((d) => [d.id, d]));

    return {
      galeria,
      estado: seleccion.estado,
      enviadaEn: seleccion.enviadaEn,
      cantidad: seleccion.cantidad,
      fotos: seleccion.fotos.map((elegida: any) => ({
        fotoId: elegida.fotoId,
        comentario: elegida.comentario,
        nombreArchivo: porId.get(elegida.fotoId)?.nombreArchivo ?? null,
        urlMiniatura: porId.get(elegida.fotoId)?.urlMiniatura ?? null,
        urlOriginal: porId.get(elegida.fotoId)?.urlOriginal ?? null,
      })),
    };
  }

  /** G-11 · Definir precio de foto extra (SEQ-12, extra) */
  definirPrecio(fotografoId: string, galeriaId: string, datos: DefinirPrecioDto) {
    return this.galerias.put(`/galerias/${galeriaId}/precio-foto-extra`, {
      fotografoId,
      precio: datos.precio,
    });
  }

  private enlacePublico(codigo: string): string {
    const base = (process.env.URL_PUBLICA || 'http://localhost:9080').replace(/\/+$/, '');
    return `${base}/c/${codigo}`;
  }
}
