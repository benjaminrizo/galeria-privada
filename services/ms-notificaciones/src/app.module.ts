import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuracionDeBaseDeDatos } from './comun/base-datos';
import { SaludController } from './comun/salud.controller';
import { EsquemaInicial1764288000000 } from './migraciones/1764288000000-esquema-inicial';
import { BusModule } from './comun/bus.module';
import { CorreoService } from './notificaciones/correo.service';
import { Notificacion } from './notificaciones/notificacion.entity';
import { NotificacionesController } from './notificaciones/notificaciones.controller';
import { NotificacionesService } from './notificaciones/notificaciones.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configuracionDeBaseDeDatos([Notificacion], [EsquemaInicial1764288000000])),
    TypeOrmModule.forFeature([Notificacion]),
    // El control de duplicados lo da el índice único de `evento_id` en la
    // propia notificación, así que aquí no hace falta la tabla genérica.
    BusModule,
  ],
  controllers: [NotificacionesController, SaludController],
  providers: [NotificacionesService, CorreoService],
})
export class AppModule {}
