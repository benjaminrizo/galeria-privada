import { Global, Module } from '@nestjs/common';
import { ClienteDeServicio } from './cliente-http';

/**
 * Un cliente por microservicio. Las direcciones llegan por variables de
 * entorno, de modo que el mismo código sirve en local y en docker-compose.
 */
export const AUTH = 'CLIENTE_AUTH';
export const GALERIAS = 'CLIENTE_GALERIAS';
export const MEDIA = 'CLIENTE_MEDIA';
export const SELECCION = 'CLIENTE_SELECCION';
export const PAGOS = 'CLIENTE_PAGOS';

const clientes = [
  { provide: AUTH, nombre: 'ms-auth', variable: 'MS_AUTH_URL', puerto: 3001 },
  { provide: GALERIAS, nombre: 'ms-galerias', variable: 'MS_GALERIAS_URL', puerto: 3002 },
  { provide: MEDIA, nombre: 'ms-media', variable: 'MS_MEDIA_URL', puerto: 3003 },
  { provide: SELECCION, nombre: 'ms-seleccion', variable: 'MS_SELECCION_URL', puerto: 3004 },
  { provide: PAGOS, nombre: 'ms-pagos', variable: 'MS_PAGOS_URL', puerto: 3006 },
];

@Global()
@Module({
  providers: clientes.map(({ provide, nombre, variable, puerto }) => ({
    provide,
    useFactory: () =>
      new ClienteDeServicio(nombre, process.env[variable] || `http://localhost:${puerto}`),
  })),
  exports: clientes.map((c) => c.provide),
})
export class ServiciosModule {}
