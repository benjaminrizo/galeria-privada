import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuracionDeBaseDeDatos } from './comun/base-datos';
import { EsquemaInicial1764288000000 } from './migraciones/1764288000000-esquema-inicial';
import { ComunModule } from './comun/comun.module';
import { SaludController } from './comun/salud.controller';
import { EventoProcesado } from './comun/idempotencia';
import { GaleriaEliminadaConsumidor } from './seleccion/galeria-eliminada.consumidor';
import { FotoSeleccionada, Seleccion } from './seleccion/seleccion.entity';
import { SeleccionController } from './seleccion/seleccion.controller';
import { SeleccionService } from './seleccion/seleccion.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configuracionDeBaseDeDatos([Seleccion, FotoSeleccionada, EventoProcesado], [EsquemaInicial1764288000000])),
    TypeOrmModule.forFeature([Seleccion, FotoSeleccionada]),
    ComunModule,
  ],
  controllers: [SeleccionController, SaludController],
  providers: [SeleccionService, GaleriaEliminadaConsumidor],
})
export class AppModule {}
