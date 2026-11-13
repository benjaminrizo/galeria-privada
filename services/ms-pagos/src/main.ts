import 'reflect-metadata';
import { AppModule } from './app.module';
import { arrancar } from './comun/arranque';

arrancar(AppModule, {
  nombre: 'ms-pagos',
  descripcion:
    'Pagos (extra): pedidos de fotos adicionales con pago simulado. ' +
    'Contrato: docs/QueriesYActions/ms-pagos.md',
  puerto: Number(process.env.PORT || 3006),
});
