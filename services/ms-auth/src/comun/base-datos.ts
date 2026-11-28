import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Conexión a la base de datos propia del servicio (RNF-15, ADR 0003).
 * Cada servicio entra con sus propias credenciales y no ve las tablas de otro.
 */
export function configuracionDeBaseDeDatos(
  entidades: any[],
  migraciones: any[] = [],
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: entidades,
    migrations: migraciones,
    // El esquema se crea y evoluciona SOLO con migraciones versionadas
    // (capítulo 8, Guideline 7). `synchronize` queda desactivado a propósito:
    // deja que TypeORM altere las tablas por su cuenta, sin historial ni
    // reversión, y eso en producción no es aceptable.
    synchronize: false,
    // Se aplican al arrancar, de modo que `make start` deja la base lista.
    migrationsRun: true,
    retryAttempts: 20,
    retryDelay: 3000,
    logging: process.env.DB_LOGGING === 'true',
  };
}
