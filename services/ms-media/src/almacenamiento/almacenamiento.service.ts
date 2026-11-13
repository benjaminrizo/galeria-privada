import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  CreateBucketCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

export const BUCKET_ORIGINALES = process.env.ALMACEN_BUCKET_ORIGINALES || 'originales';
export const BUCKET_MINIATURAS = process.env.ALMACEN_BUCKET_MINIATURAS || 'miniaturas';

/**
 * Almacenamiento de archivos compatible con S3 (ADR 0005, ADR 0010).
 *
 * Los dos espacios son privados: nada se sirve en abierto. Para mostrar un
 * archivo se firma una URL con vencimiento corto, y al cliente solo se le
 * firman miniaturas (RNF-04, HT-07).
 *
 * El servidor concreto es intercambiable porque todo pasa por la API de S3:
 * el proyecto usa RustFS, y el mismo codigo sirve con cualquier otro.
 */
@Injectable()
export class AlmacenamientoService implements OnModuleInit {
  private readonly log = new Logger('Almacenamiento');

  /** Para subir y leer archivos: entra al almacén por la red interna. */
  private readonly cliente: S3Client;

  /**
   * Solo para firmar las URLs que abre el navegador.
   *
   * La firma de S3 incluye el nombre del servidor al que va dirigida la
   * petición. Dentro de docker-compose el almacén se llama `almacen`, pero el
   * navegador lo busca en `localhost`, así que una URL firmada con un nombre y
   * abierta con el otro se rechaza con `SignatureDoesNotMatch`. Por eso se
   * firma desde el principio con la dirección pública, en lugar de firmar con
   * la interna y cambiarle el nombre después.
   */
  private readonly clienteDeFirma: S3Client;

  /** Vencimiento de las URLs firmadas, en segundos. */
  private readonly vigenciaMiniatura = Number(process.env.URL_MINIATURA_SEGUNDOS || 3600);
  private readonly vigenciaOriginal = Number(process.env.URL_ORIGINAL_SEGUNDOS || 900);

  constructor() {
    const interno = process.env.ALMACEN_ENDPOINT || 'http://localhost:9000';
    const publico = process.env.ALMACEN_ENDPOINT_PUBLICO || interno;

    const comun = {
      region: process.env.ALMACEN_REGION || 'us-east-1',
      // El almacén usa rutas (`/bucket/clave`) en lugar de subdominios.
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.ALMACEN_ACCESS_KEY || 'galeriaprivada',
        secretAccessKey: process.env.ALMACEN_SECRET_KEY || 'galeriaprivada2026',
      },
    };

    this.cliente = new S3Client({ ...comun, endpoint: interno });
    this.clienteDeFirma = new S3Client({ ...comun, endpoint: publico });
  }

  async onModuleInit() {
    // El almacen puede tardar en arrancar dentro de docker-compose.
    for (const bucket of [BUCKET_ORIGINALES, BUCKET_MINIATURAS]) {
      await this.asegurarBucket(bucket);
    }
  }

  async guardar(bucket: string, clave: string, contenido: Buffer, tipo: string): Promise<void> {
    await this.cliente.send(
      new PutObjectCommand({ Bucket: bucket, Key: clave, Body: contenido, ContentType: tipo }),
    );
  }

  async leer(bucket: string, clave: string): Promise<Buffer> {
    const respuesta = await this.cliente.send(new GetObjectCommand({ Bucket: bucket, Key: clave }));
    const partes: Buffer[] = [];

    for await (const parte of respuesta.Body as Readable) {
      partes.push(Buffer.isBuffer(parte) ? parte : Buffer.from(parte));
    }

    return Buffer.concat(partes);
  }

  /** Borra en lote; las claves que ya no existen no son un error (idempotencia). */
  async borrar(bucket: string, claves: string[]): Promise<void> {
    if (!claves.length) return;

    // La API acepta hasta 1000 objetos por llamada.
    for (let i = 0; i < claves.length; i += 1000) {
      await this.cliente.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: claves.slice(i, i + 1000).map((Key) => ({ Key })) },
        }),
      );
    }
  }

  urlDeMiniatura(clave: string) {
    return this.firmar(BUCKET_MINIATURAS, clave, this.vigenciaMiniatura);
  }

  urlDeOriginal(clave: string) {
    return this.firmar(BUCKET_ORIGINALES, clave, this.vigenciaOriginal);
  }

  private firmar(bucket: string, clave: string, segundos: number): Promise<string> {
    // Firmada ya con la dirección pública: la URL sale lista para el navegador
    // y no hay que tocarla después.
    return getSignedUrl(
      this.clienteDeFirma,
      new GetObjectCommand({ Bucket: bucket, Key: clave }),
      { expiresIn: segundos },
    );
  }

  private async asegurarBucket(bucket: string, intento = 1): Promise<void> {
    try {
      await this.cliente.send(new CreateBucketCommand({ Bucket: bucket }));
      this.log.log(`Espacio creado: ${bucket}`);
    } catch (error: any) {
      const nombre = error?.name || '';

      if (nombre === 'BucketAlreadyOwnedByYou' || nombre === 'BucketAlreadyExists') {
        this.log.log(`Espacio disponible: ${bucket}`);
        return;
      }

      if (intento >= 10) {
        this.log.error(`No se pudo preparar el espacio ${bucket}: ${error.message}`);
        return;
      }

      await new Promise((r) => setTimeout(r, 3000));
      return this.asegurarBucket(bucket, intento + 1);
    }
  }
}
