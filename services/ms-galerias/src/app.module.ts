import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuracionDeBaseDeDatos } from './comun/base-datos';
import { SaludController } from './comun/salud.controller';
import { EsquemaInicial1764288000000 } from './migraciones/1764288000000-esquema-inicial';
import { BusModule } from './comun/bus.module';
import { Galeria } from './galerias/galeria.entity';
import { GaleriasController } from './galerias/galerias.controller';
import { GaleriasService } from './galerias/galerias.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configuracionDeBaseDeDatos([Galeria], [EsquemaInicial1764288000000])),
    TypeOrmModule.forFeature([Galeria]),
    // Este servicio solo publica eventos; no consume ninguno, así que no
    // necesita la tabla de control de duplicados.
    BusModule,
  ],
  controllers: [GaleriasController, SaludController],
  providers: [GaleriasService],
})
export class AppModule {}
