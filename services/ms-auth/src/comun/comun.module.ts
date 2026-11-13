import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusDeEventos } from './bus-eventos.service';
import { EventoProcesado, Idempotencia } from './idempotencia';

/**
 * Bus + control de duplicados. Lo importan los servicios que consumen eventos
 * y que, por tanto, necesitan la tabla `eventos_procesados`.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([EventoProcesado])],
  providers: [BusDeEventos, Idempotencia],
  exports: [BusDeEventos, Idempotencia],
})
export class ComunModule {}
