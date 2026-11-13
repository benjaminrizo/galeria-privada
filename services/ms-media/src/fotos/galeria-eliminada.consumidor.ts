import { Injectable, OnModuleInit } from '@nestjs/common';
import { BusDeEventos } from '../comun/bus-eventos.service';
import { Idempotencia } from '../comun/idempotencia';
import { DatosGaleriaEliminada, Eventos } from '../comun/tipos';
import { FotosService } from './fotos.service';

/**
 * Suscripción a `GaleriaEliminada`: borra las fotos y los archivos de esa
 * galería (ADR 0008, borrado en cascada por consistencia eventual).
 */
@Injectable()
export class GaleriaEliminadaConsumidor implements OnModuleInit {
  constructor(
    private readonly bus: BusDeEventos,
    private readonly idempotencia: Idempotencia,
    private readonly fotos: FotosService,
  ) {}

  async onModuleInit() {
    await this.bus.suscribir<DatosGaleriaEliminada>(
      'ms-media.galeria-eliminada',
      Eventos.GaleriaEliminada,
      async (datos, mensaje) => {
        await this.idempotencia.unaSolaVez(mensaje.id, mensaje.evento, () =>
          this.fotos.borrarPorGaleria(datos.galeriaId),
        );
      },
    );
  }
}
