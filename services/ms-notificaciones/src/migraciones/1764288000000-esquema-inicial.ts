import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Esquema inicial de ms-notificaciones.
 *
 * El esquema se crea y evoluciona solo con migraciones versionadas
 * (capítulo 8, Guideline 7). Antes se usaba `synchronize: true`, que deja que
 * TypeORM altere las tablas solo: cómodo al principio, pero nadie sabe qué
 * cambió ni cuándo, y en producción es inaceptable.
 *
 * Se ejecutan solas al arrancar el servicio (`migrationsRun`), así que
 * `make start` deja la base lista sin pasos manuales.
 */
export class EsquemaInicial1764288000000 implements MigrationInterface {
  name = 'EsquemaInicial1764288000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TYPE "notificaciones_tipo_enum" AS ENUM ('galeria_publicada', 'seleccion_enviada')`);
    await q.query(`CREATE TYPE "notificaciones_estado_enum" AS ENUM ('pendiente', 'enviada', 'fallida')`);

    await q.query(`
      CREATE TABLE "notificaciones" (
        "id"                  uuid NOT NULL DEFAULT gen_random_uuid(),
        "evento_id"           uuid NOT NULL,
        "tipo"                "notificaciones_tipo_enum" NOT NULL,
        "destinatario_correo" text NOT NULL,
        "contenido"           jsonb NOT NULL,
        "estado"              "notificaciones_estado_enum" NOT NULL DEFAULT 'pendiente',
        "intentos"            integer NOT NULL DEFAULT 0,
        "ultimo_error"        text,
        "creado_en"           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "enviado_en"          TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_notificaciones" PRIMARY KEY ("id")
      )`);
    // Un evento genera un solo correo por mucho que se reentregue el mensaje.
    await q.query(`CREATE UNIQUE INDEX "IDX_notificaciones_evento_id" ON "notificaciones" ("evento_id")`);

    await q.query(`
      CREATE TABLE "eventos_procesados" (
        "id"           uuid NOT NULL,
        "evento"       text NOT NULL,
        "procesado_en" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_eventos_procesados" PRIMARY KEY ("id")
      )`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "eventos_procesados"`);
    await q.query(`DROP INDEX "IDX_notificaciones_evento_id"`);
    await q.query(`DROP TABLE "notificaciones"`);
    await q.query(`DROP TYPE "notificaciones_estado_enum"`);
    await q.query(`DROP TYPE "notificaciones_tipo_enum"`);
  }
}
