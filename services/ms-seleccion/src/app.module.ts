import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuracionDeBaseDeDatos } from './comun/base-datos';
import { ComunModule } from './comun/comun.module';
import { EventoProcesado } from './comun/idempotencia';
import { GaleriaEliminadaConsumidor } from './seleccion/galeria-eliminada.consumidor';
import { FotoSeleccionada, Seleccion } from './seleccion/seleccion.entity';
import { SeleccionController } from './seleccion/seleccion.controller';
import { SeleccionService } from './seleccion/seleccion.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configuracionDeBaseDeDatos([Seleccion, FotoSeleccionada, EventoProcesado])),
    TypeOrmModule.forFeature([Seleccion, FotoSeleccionada]),
    ComunModule,
  ],
  controllers: [SeleccionController],
  providers: [SeleccionService, GaleriaEliminadaConsumidor],
})
export class AppModule {}
