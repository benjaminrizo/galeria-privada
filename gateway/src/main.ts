import 'reflect-metadata';
import { AppModule } from './app.module';
import { arrancar } from './comun/arranque';

arrancar(AppModule, {
  nombre: 'api-gateway',
  descripcion:
    'API pública de Galería Privada: la que usa el frontend. ' +
    'Contrato: docs/QueriesYActions/gateway.md',
  puerto: Number(process.env.PORT || 3000),
  conToken: true,
});
