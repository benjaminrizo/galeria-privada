import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Esquema inicial de ms-media.
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
    await q.query(`DO $$ BEGIN CREATE TYPE "fotos_estado_procesamiento_enum" AS ENUM ('pendiente', 'procesando', 'lista', 'error'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    await q.query(`
      CREATE TABLE IF NOT EXISTS "fotos" (
        "id"                   uuid NOT NULL DEFAULT gen_random_uuid(),
        "galeria_id"           uuid NOT NULL,
        "nombre_archivo"       text NOT NULL,
        "clave_original"       text NOT NULL,
        "clave_miniatura"      text NOT NULL DEFAULT '',
        "estado_procesamiento" "fotos_estado_procesamiento_enum" NOT NULL DEFAULT 'pendiente',
        "creado_en"            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fotos" PRIMARY KEY ("id")
      )`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_fotos_galeria_id" ON "fotos" ("galeria_id")`);

    await q.query(`
      CREATE TABLE IF NOT EXISTS "eventos_procesados" (
        "id"           uuid NOT NULL,
        "evento"       text NOT NULL,
        "procesado_en" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_eventos_procesados" PRIMARY KEY ("id")
      )`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "eventos_procesados"`);
    await q.query(`DROP INDEX IF EXISTS "IDX_fotos_galeria_id"`);
    await q.query(`DROP TABLE IF EXISTS "fotos"`);
    await q.query(`DROP TYPE IF EXISTS "fotos_estado_procesamiento_enum"`);
  }
}
