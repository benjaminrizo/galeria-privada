import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Esquema inicial de ms-seleccion.
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
    await q.query(`DO $$ BEGIN CREATE TYPE "selecciones_estado_enum" AS ENUM ('en_curso', 'enviada'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    await q.query(`
      CREATE TABLE IF NOT EXISTS "selecciones" (
        "id"         uuid NOT NULL DEFAULT gen_random_uuid(),
        "galeria_id" uuid NOT NULL,
        "estado"     "selecciones_estado_enum" NOT NULL DEFAULT 'en_curso',
        "enviada_en" TIMESTAMP WITH TIME ZONE,
        "creado_en"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_selecciones" PRIMARY KEY ("id")
      )`);
    // Una sola selección por galería: es la invariante del agregado AG-05.
    await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_selecciones_galeria_id" ON "selecciones" ("galeria_id")`);

    await q.query(`
      CREATE TABLE IF NOT EXISTS "fotos_seleccionadas" (
        "seleccion_id" uuid NOT NULL,
        "foto_id"      uuid NOT NULL,
        "comentario"   text,
        "marcada_en"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fotos_seleccionadas" PRIMARY KEY ("seleccion_id", "foto_id"),
        CONSTRAINT "FK_fotos_seleccionadas_seleccion"
          FOREIGN KEY ("seleccion_id") REFERENCES "selecciones" ("id") ON DELETE CASCADE
      )`);

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
    await q.query(`DROP TABLE IF EXISTS "fotos_seleccionadas"`);
    await q.query(`DROP INDEX IF EXISTS "IDX_selecciones_galeria_id"`);
    await q.query(`DROP TABLE IF EXISTS "selecciones"`);
    await q.query(`DROP TYPE IF EXISTS "selecciones_estado_enum"`);
  }
}
