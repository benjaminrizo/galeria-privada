import 'reflect-metadata';
import { AppModule } from './app.module';
import { arrancar } from './comun/arranque';

arrancar(AppModule, {
  nombre: 'ms-notificaciones',
  descripcion:
    'Notificaciones: correos de galería publicada y selección enviada, con reintentos. ' +
    'Contrato: docs/QueriesYActions/ms-notificaciones.md',
  puerto: Number(process.env.PORT || 3005),
});
