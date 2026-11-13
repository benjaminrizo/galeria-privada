import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccesoGaleria } from './accesos/acceso.entity';
import { AccesosController } from './accesos/accesos.controller';
import { AccesosService } from './accesos/accesos.service';
import { GaleriaEliminadaConsumidor } from './accesos/galeria-eliminada.consumidor';
import { configuracionDeBaseDeDatos } from './comun/base-datos';
import { ComunModule } from './comun/comun.module';
import { EventoProcesado } from './comun/idempotencia';
import { Fotografo } from './fotografos/fotografo.entity';
import { FotografosController } from './fotografos/fotografos.controller';
import { FotografosService } from './fotografos/fotografos.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configuracionDeBaseDeDatos([Fotografo, AccesoGaleria, EventoProcesado])),
    TypeOrmModule.forFeature([Fotografo, AccesoGaleria]),
    ComunModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secreto-de-desarrollo',
      signOptions: { expiresIn: process.env.JWT_EXPIRA_EN || '12h' },
    }),
  ],
  controllers: [FotografosController, AccesosController],
  providers: [FotografosService, AccesosService, GaleriaEliminadaConsumidor],
})
export class AppModule {}
