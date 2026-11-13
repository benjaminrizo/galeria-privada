import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenamientoService } from './almacenamiento/almacenamiento.service';
import { configuracionDeBaseDeDatos } from './comun/base-datos';
import { ComunModule } from './comun/comun.module';
import { EventoProcesado } from './comun/idempotencia';
import { Foto } from './fotos/foto.entity';
import { FotosController } from './fotos/fotos.controller';
import { FotosService } from './fotos/fotos.service';
import { GaleriaEliminadaConsumidor } from './fotos/galeria-eliminada.consumidor';
import { MiniaturasService } from './fotos/miniaturas.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configuracionDeBaseDeDatos([Foto, EventoProcesado])),
    TypeOrmModule.forFeature([Foto]),
    ComunModule,
  ],
  controllers: [FotosController],
  providers: [FotosService, MiniaturasService, AlmacenamientoService, GaleriaEliminadaConsumidor],
})
export class AppModule {}
