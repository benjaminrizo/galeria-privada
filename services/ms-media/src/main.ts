import 'reflect-metadata';
import { AppModule } from './app.module';
import { arrancar } from './comun/arranque';

arrancar(AppModule, {
  nombre: 'ms-media',
  descripcion:
    'Medios: subida de fotos, miniaturas en segundo plano y entrega protegida. ' +
    'Contrato: docs/QueriesYActions/ms-media.md',
  puerto: Number(process.env.PORT || 3003),
});
