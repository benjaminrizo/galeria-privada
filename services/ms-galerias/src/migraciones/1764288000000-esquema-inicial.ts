import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Esquema inicial de ms-galerias.
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
    await q.query(`CREATE TYPE "galerias_estado_enum" AS ENUM ('borrador', 'publicada', 'seleccion_enviada')`);

    await q.query(`
      CREATE TABLE "galerias" (
        "id"                uuid NOT NULL DEFAULT gen_random_uuid(),
        "fotografo_id"      uuid NOT NULL,
        "nombre"            text NOT NULL,
        "cliente_nombre"    text NOT NULL,
        "cliente_correo"    text NOT NULL,
        "limite_incluido"   integer NOT NULL,
        "limite_extra"      integer NOT NULL DEFAULT 0,
        "precio_foto_extra" numeric(12,2),
        "estado"            "galerias_estado_enum" NOT NULL DEFAULT 'borrador',
        "creado_en"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "publicada_en"      TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_galerias" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_galerias_limite_incluido" CHECK ("limite_incluido" > 0)
      )`);
    await q.query(`CREATE INDEX "IDX_galerias_fotografo_id" ON "galerias" ("fotografo_id")`);

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
    await q.query(`DROP INDEX "IDX_galerias_fotografo_id"`);
    await q.query(`DROP TABLE "galerias"`);
    await q.query(`DROP TYPE "galerias_estado_enum"`);
  }
}
