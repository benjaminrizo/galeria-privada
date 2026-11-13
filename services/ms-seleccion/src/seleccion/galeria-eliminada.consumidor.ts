import { Injectable, OnModuleInit } from '@nestjs/common';
import { BusDeEventos } from '../comun/bus-eventos.service';
import { Idempotencia } from '../comun/idempotencia';
import { DatosGaleriaEliminada, Eventos } from '../comun/tipos';
import { SeleccionService } from './seleccion.service';

/** Suscripción a `GaleriaEliminada`: borra la selección y sus comentarios. */
@Injectable()
export class GaleriaEliminadaConsumidor implements OnModuleInit {
  constructor(
    private readonly bus: BusDeEventos,
    private readonly idempotencia: Idempotencia,
    private readonly seleccion: SeleccionService,
  ) {}

  async onModuleInit() {
    await this.bus.suscribir<DatosGaleriaEliminada>(
      'ms-seleccion.galeria-eliminada',
      Eventos.GaleriaEliminada,
      async (datos, mensaje) => {
        await this.idempotencia.unaSolaVez(mensaje.id, mensaje.evento, () =>
          this.seleccion.borrarPorGaleria(datos.galeriaId),
        );
      },
    );
  }
}
