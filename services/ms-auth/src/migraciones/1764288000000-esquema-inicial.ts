import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Esquema inicial de ms-auth.
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
    await q.query(`
      CREATE TABLE "fotografos" (
        "id"            uuid NOT NULL DEFAULT gen_random_uuid(),
        "nombre"        text NOT NULL,
        "correo"        text NOT NULL,
        "password_hash" text NOT NULL,
        "creado_en"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_fotografos_correo" UNIQUE ("correo"),
        CONSTRAINT "PK_fotografos" PRIMARY KEY ("id")
      )`);

    await q.query(`
      CREATE TABLE "accesos_galeria" (
        "id"         uuid NOT NULL DEFAULT gen_random_uuid(),
        "galeria_id" uuid NOT NULL,
        "codigo"     text NOT NULL,
        "activo"     boolean NOT NULL DEFAULT true,
        "creado_en"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_accesos_galeria_codigo" UNIQUE ("codigo"),
        CONSTRAINT "PK_accesos_galeria" PRIMARY KEY ("id")
      )`);
    await q.query(`CREATE INDEX "IDX_accesos_galeria_galeria_id" ON "accesos_galeria" ("galeria_id")`);

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
    await q.query(`DROP INDEX "IDX_accesos_galeria_galeria_id"`);
    await q.query(`DROP TABLE "accesos_galeria"`);
    await q.query(`DROP TABLE "fotografos"`);
  }
}
