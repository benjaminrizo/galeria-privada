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
 *
 * Las sentencias son idempotentes a propósito. Esta migración tiene que poder
 * correr sobre una base vacía y también sobre una que ya tenía las tablas de
 * cuando el esquema se creaba con `synchronize`, sin que el servicio se caiga
 * al arrancar. A partir de aquí, cada cambio de esquema es una migración nueva.
 */
export class EsquemaInicial1764288000000 implements MigrationInterface {
  name = 'EsquemaInicial1764288000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`DO $$ BEGIN CREATE TYPE "notificaciones_tipo_enum" AS ENUM ('galeria_publicada', 'seleccion_enviada'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    await q.query(`DO $$ BEGIN CREATE TYPE "notificaciones_estado_enum" AS ENUM ('pendiente', 'enviada', 'fallida'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    await q.query(`
      CREATE TABLE IF NOT EXISTS "notificaciones" (
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
    await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_notificaciones_evento_id" ON "notificaciones" ("evento_id")`);

  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS "IDX_notificaciones_evento_id"`);
    await q.query(`DROP TABLE IF EXISTS "notificaciones"`);
    await q.query(`DROP TYPE IF EXISTS "notificaciones_estado_enum"`);
    await q.query(`DROP TYPE IF EXISTS "notificaciones_tipo_enum"`);
  }
}
