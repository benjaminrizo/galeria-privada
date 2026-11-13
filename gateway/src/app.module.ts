import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FotografoGuard } from './autenticacion/fotografo.guard';
import { BusModule } from './comun/bus.module';
import { AutenticacionController } from './flujos/autenticacion/autenticacion.controller';
import { ClienteController } from './flujos/cliente/cliente.controller';
import { ClienteFlujo } from './flujos/cliente/cliente.flujo';
import { GaleriasController } from './flujos/galerias/galerias.controller';
import { GaleriasFlujo } from './flujos/galerias/galerias.flujo';
import { SaludController } from './salud.controller';
import { ServiciosModule } from './servicios/servicios.module';

/**
 * API Gateway: único punto de entrada (ADR 0002). No tiene base de datos
 * propia; orquesta a los servicios y publica los eventos compuestos (ADR 0007).
 */
@Module({
  imports: [
    ServiciosModule,
    BusModule,
    JwtModule.register({
      // El mismo secreto que firma ms-auth, para poder validar aquí el token.
      secret: process.env.JWT_SECRET || 'secreto-de-desarrollo',
    }),
  ],
  controllers: [AutenticacionController, GaleriasController, ClienteController, SaludController],
  providers: [GaleriasFlujo, ClienteFlujo, FotografoGuard],
})
export class AppModule {}
