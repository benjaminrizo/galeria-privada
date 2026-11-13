import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { In, Repository } from 'typeorm';
import { AlmacenamientoService, BUCKET_MINIATURAS, BUCKET_ORIGINALES } from '../almacenamiento/almacenamiento.service';
import { BusDeEventos } from '../comun/bus-eventos.service';
import { ErrorDeNegocio } from '../comun/errores';
import { Eventos } from '../comun/tipos';
import { EstadoDeProcesamiento, Foto } from './foto.entity';

/** Formatos que se aceptan al subir (el resto se rechaza sin afectar al lote). */
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const FOTOS_POR_PAGINA = 60;

export interface ArchivoSubido {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class FotosService {
  private readonly log = new Logger('Fotos');

  constructor(
    @InjectRepository(Foto)
    private readonly repositorio: Repository<Foto>,
    private readonly almacenamiento: AlmacenamientoService,
    private readonly bus: BusDeEventos,
  ) {}

  /**
   * A-MED-01 · SubirFotos (HU-07).
   * Responde 202: el original queda guardado y la miniatura se genera después,
   * para no dejar al fotógrafo esperando (RNF-08).
   */
  async subir(galeriaId: string, archivos: ArchivoSubido[]) {
    if (!archivos?.length) {
      throw ErrorDeNegocio.datosInvalidos('No se recibió ninguna imagen.');
    }

    const aceptadas: { id: string; nombreArchivo: string }[] = [];
    const rechazadas: { nombreArchivo: string; motivo: string }[] = [];

    for (const archivo of archivos) {
      if (!TIPOS_PERMITIDOS.includes(archivo.mimetype)) {
        rechazadas.push({
          nombreArchivo: archivo.originalname,
          motivo: `Formato no permitido (${archivo.mimetype}). Se aceptan JPG, PNG y WebP.`,
        });
        continue;
      }

      try {
        const claveOriginal = `${galeriaId}/${randomUUID()}-${limpiarNombre(archivo.originalname)}`;
        await this.almacenamiento.guardar(
          BUCKET_ORIGINALES,
          claveOriginal,
          archivo.buffer,
          archivo.mimetype,
        );

        const foto = await this.repositorio.save(
          this.repositorio.create({
            galeriaId,
            nombreArchivo: archivo.originalname,
            claveOriginal,
            claveMiniatura: '',
            estadoProcesamiento: EstadoDeProcesamiento.Pendiente,
          }),
        );

        aceptadas.push({ id: foto.id, nombreArchivo: foto.nombreArchivo });

        // EV-08: FotoSubida. El propio servicio lo consume como cola de trabajo
        // para generar la miniatura (HT-06). La foto ya está guardada: si el
        // broker falla, queda en `pendiente` y su miniatura se genera después.
        try {
          await this.bus.publicar(Eventos.FotoSubida, { fotoId: foto.id, galeriaId });
        } catch (error: any) {
          this.log.error(`Foto ${foto.id} guardada sin aviso de procesamiento: ${error.message}`);
        }
      } catch (error: any) {
        // EV-09: el fallo de una foto no tumba el resto del lote.
        this.log.error(`No se pudo guardar ${archivo.originalname}: ${error.message}`);
        rechazadas.push({ nombreArchivo: archivo.originalname, motivo: 'No se pudo guardar el archivo.' });
      }
    }

    this.log.log(`Galería ${galeriaId}: ${aceptadas.length} aceptadas, ${rechazadas.length} rechazadas`);
    return { aceptadas, rechazadas };
  }

  /** Q-MED-01 · ContarFotos (HU-06) */
  async contar(galeriaId: string): Promise<{ total: number }> {
    return { total: await this.repositorio.countBy({ galeriaId }) };
  }

  /**
   * Q-MED-02 · ListarFotos (HU-08, HU-09).
   * Devuelve únicamente URLs de miniatura: el cliente nunca recibe el original (RNF-04).
   */
  async listar(galeriaId: string, pagina = 1) {
    const paginaValida = Math.max(1, Math.trunc(pagina) || 1);

    const [fotos, total] = await this.repositorio.findAndCount({
      where: { galeriaId },
      order: { creadoEn: 'ASC' },
      skip: (paginaValida - 1) * FOTOS_POR_PAGINA,
      take: FOTOS_POR_PAGINA,
    });

    return {
      pagina: paginaValida,
      porPagina: FOTOS_POR_PAGINA,
      total,
      fotos: await Promise.all(
        fotos.map(async (foto) => ({
          id: foto.id,
          nombreArchivo: foto.nombreArchivo,
          estado: foto.estadoProcesamiento,
          // Mientras la miniatura no está lista, el frontend muestra un marcador.
          urlMiniatura: foto.claveMiniatura
            ? await this.almacenamiento.urlDeMiniatura(foto.claveMiniatura)
            : null,
        })),
      ),
    };
  }

  /** Q-MED-03 · VerificarFotoDeGaleria (HU-10) */
  async verificar(galeriaId: string, fotoId: string) {
    const foto = await this.repositorio.findOneBy({ id: fotoId, galeriaId });

    // Impide que alguien marque identificadores de otra galería.
    if (!foto) {
      throw ErrorDeNegocio.noEncontrado('FOTO_NO_ENCONTRADA', 'Esa foto no pertenece a la galería.');
    }

    return { id: foto.id, galeriaId: foto.galeriaId, estado: foto.estadoProcesamiento };
  }

  /**
   * Q-MED-04 · ObtenerFotos (HU-14, HU-16).
   * Incluye la URL temporal del original, así que el gateway solo la usa en las
   * rutas del fotógrafo.
   */
  async porIds(ids: string[]) {
    if (!ids.length) return [];

    const fotos = await this.repositorio.findBy({ id: In(ids) });

    return Promise.all(
      fotos.map(async (foto) => ({
        id: foto.id,
        nombreArchivo: foto.nombreArchivo,
        estado: foto.estadoProcesamiento,
        urlMiniatura: foto.claveMiniatura
          ? await this.almacenamiento.urlDeMiniatura(foto.claveMiniatura)
          : null,
        urlOriginal: await this.almacenamiento.urlDeOriginal(foto.claveOriginal),
      })),
    );
  }

  /**
   * Reacción a `GaleriaEliminada`: borra los metadatos y los archivos de esa
   * galería. Es idempotente: si ya no hay nada, no es un error.
   */
  async borrarPorGaleria(galeriaId: string): Promise<void> {
    const fotos = await this.repositorio.findBy({ galeriaId });
    if (!fotos.length) return;

    await this.almacenamiento.borrar(BUCKET_ORIGINALES, fotos.map((f) => f.claveOriginal));
    await this.almacenamiento.borrar(
      BUCKET_MINIATURAS,
      fotos.map((f) => f.claveMiniatura).filter(Boolean),
    );
    await this.repositorio.delete({ galeriaId });

    this.log.log(`Borradas ${fotos.length} foto(s) de la galería ${galeriaId}`);
  }
}

/** Deja el nombre del archivo en algo seguro para usar como clave. */
function limpiarNombre(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(-80);
}
