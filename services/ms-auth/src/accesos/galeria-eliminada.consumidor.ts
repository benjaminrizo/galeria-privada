import { Injectable, OnModuleInit } from '@nestjs/common';
import { BusDeEventos } from '../comun/bus-eventos.service';
import { Idempotencia } from '../comun/idempotencia';
import { DatosGaleriaEliminada, Eventos } from '../comun/tipos';
import { AccesosService } from './accesos.service';

/**
 * Suscripción a `GaleriaEliminada`: cuando ms-galerias borra una galería, este
 * servicio borra su enlace de acceso (docs/QueriesYActions/eventos.md).
 */
@Injectable()
export class GaleriaEliminadaConsumidor implements OnModuleInit {
  constructor(
    private readonly bus: BusDeEventos,
    private readonly idempotencia: Idempotencia,
    private readonly accesos: AccesosService,
  ) {}

  async onModuleInit() {
    await this.bus.suscribir<DatosGaleriaEliminada>(
      'ms-auth.galeria-eliminada',
      Eventos.GaleriaEliminada,
      async (datos, mensaje) => {
        await this.idempotencia.unaSolaVez(mensaje.id, mensaje.evento, () =>
          this.accesos.borrarPorGaleria(datos.galeriaId),
        );
      },
    );
  }
}
