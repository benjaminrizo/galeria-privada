import { Global, Module } from '@nestjs/common';
import { BusDeEventos } from './bus-eventos.service';

/** Solo el bus de eventos. Lo usa el gateway, que no tiene base de datos propia. */
@Global()
@Module({
  providers: [BusDeEventos],
  exports: [BusDeEventos],
})
export class BusModule {}
