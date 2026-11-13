import 'reflect-metadata';
import { AppModule } from './app.module';
import { arrancar } from './comun/arranque';

arrancar(AppModule, {
  nombre: 'ms-galerias',
  descripcion:
    'Gestión de Galerías: sesiones, datos del cliente, límite y estado. ' +
    'Contrato: docs/QueriesYActions/ms-galerias.md',
  puerto: Number(process.env.PORT || 3002),
});
