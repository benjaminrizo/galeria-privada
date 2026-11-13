import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Conexión a la base de datos propia del servicio (RNF-15, ADR 0003).
 * Cada servicio entra con sus propias credenciales y no ve las tablas de otro.
 */
export function configuracionDeBaseDeDatos(entidades: any[]): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: entidades,
    // En el proyecto académico el esquema se crea solo al arrancar; en
    // producción se usarían migraciones.
    synchronize: true,
    retryAttempts: 20,
    retryDelay: 3000,
    logging: process.env.DB_LOGGING === 'true',
  };
}
