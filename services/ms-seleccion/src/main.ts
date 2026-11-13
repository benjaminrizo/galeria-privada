import 'reflect-metadata';
import { AppModule } from './app.module';
import { arrancar } from './comun/arranque';

arrancar(AppModule, {
  nombre: 'ms-seleccion',
  descripcion:
    'Selección: fotos elegidas, comentarios de retoque y envío final. ' +
    'Contrato: docs/QueriesYActions/ms-seleccion.md',
  puerto: Number(process.env.PORT || 3004),
});
