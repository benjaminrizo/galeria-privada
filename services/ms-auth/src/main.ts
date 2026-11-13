import 'reflect-metadata';
import { AppModule } from './app.module';
import { arrancar } from './comun/arranque';

arrancar(AppModule, {
  nombre: 'ms-auth',
  descripcion:
    'Identidad y Acceso: cuentas del fotógrafo y enlaces privados de galería. ' +
    'Contrato: docs/QueriesYActions/ms-auth.md',
  puerto: Number(process.env.PORT || 3001),
});
