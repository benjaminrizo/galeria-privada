import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import sharp from 'sharp';
import { Repository } from 'typeorm';
import { AlmacenamientoService, BUCKET_MINIATURAS, BUCKET_ORIGINALES } from '../almacenamiento/almacenamiento.service';
import { BusDeEventos } from '../comun/bus-eventos.service';
import { DatosFotoSubida, Eventos } from '../comun/tipos';
import { EstadoDeProcesamiento, Foto } from './foto.entity';

/** La miniatura es lo único que ve el cliente, así que debe verse bien sin pesar. */
const ANCHO_MAXIMO = 1200;
const CALIDAD_JPEG = 78;

/**
 * A-MED-02 · GenerarMiniatura (HU-08, HT-06).
 *
 * Funciona como cola de trabajo: `ms-media` publica `FotoSubida` y se suscribe
 * a su propio evento, de modo que la subida responde enseguida y el
 * procesamiento ocurre aparte (RNF-08).
 */
@Injectable()
export class MiniaturasService implements OnModuleInit {
  private readonly log = new Logger('Miniaturas');

  constructor(
    @InjectRepository(Foto)
    private readonly repositorio: Repository<Foto>,
    private readonly almacenamiento: AlmacenamientoService,
    private readonly bus: BusDeEventos,
  ) {}

  async onModuleInit() {
    await this.bus.suscribir<DatosFotoSubida>(
      'ms-media.foto-subida',
      Eventos.FotoSubida,
      async (datos) => this.generar(datos.fotoId),
    );
  }

  async generar(fotoId: string): Promise<void> {
    const foto = await this.repositorio.findOneBy({ id: fotoId });

    // La foto pudo borrarse (por ejemplo, con la galería) antes de procesarse.
    if (!foto) {
      this.log.warn(`La foto ${fotoId} ya no existe; no hay miniatura que generar.`);
      return;
    }

    // Si ya está lista, el mensaje era un duplicado.
    if (foto.estadoProcesamiento === EstadoDeProcesamiento.Lista && foto.claveMiniatura) return;

    await this.repositorio.update({ id: foto.id }, { estadoProcesamiento: EstadoDeProcesamiento.Procesando });

    try {
      const original = await this.almacenamiento.leer(BUCKET_ORIGINALES, foto.claveOriginal);

      const miniatura = await sharp(original)
        .rotate() // respeta la orientación de la cámara
        .resize({ width: ANCHO_MAXIMO, withoutEnlargement: true })
        .jpeg({ quality: CALIDAD_JPEG, progressive: true })
        .toBuffer();

      const claveMiniatura = `${foto.galeriaId}/${foto.id}.jpg`;
      await this.almacenamiento.guardar(BUCKET_MINIATURAS, claveMiniatura, miniatura, 'image/jpeg');

      await this.repositorio.update(
        { id: foto.id },
        { claveMiniatura, estadoProcesamiento: EstadoDeProcesamiento.Lista },
      );

      // EV-10: MiniaturaGenerada
      this.log.log(`Miniatura lista para ${foto.id}`);
    } catch (error: any) {
      // EV-11: la foto queda marcada con error y las demás no se ven afectadas (HU-08).
      this.log.error(`Falló la miniatura de ${foto.id}: ${error.message}`);
      await this.repositorio.update({ id: foto.id }, { estadoProcesamiento: EstadoDeProcesamiento.Error });
    }
  }
}
