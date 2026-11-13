import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Column, Entity, PrimaryColumn, Repository } from 'typeorm';

/**
 * Registro de los mensajes ya procesados por este servicio.
 * Sostiene la regla de idempotencia de docs/EventStorming/07-patrones-de-interaccion.md:
 * recibir el mismo evento dos veces tiene el mismo efecto que recibirlo una vez.
 */
@Entity('eventos_procesados')
export class EventoProcesado {
  /** `id` del mensaje que trae el sobre del evento. */
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  evento: string;

  @Column({ name: 'procesado_en', type: 'timestamptz', default: () => 'now()' })
  procesadoEn: Date;
}

@Injectable()
export class Idempotencia {
  private readonly log = new Logger('Idempotencia');

  constructor(
    @InjectRepository(EventoProcesado)
    private readonly repositorio: Repository<EventoProcesado>,
  ) {}

  /**
   * Ejecuta `trabajo` solo si este mensaje no se había procesado antes.
   * Devuelve `false` cuando el mensaje era un duplicado.
   */
  async unaSolaVez(id: string, evento: string, trabajo: () => Promise<void>): Promise<boolean> {
    if (await this.repositorio.existsBy({ id })) {
      this.log.log(`${evento} (${id}) ya estaba procesado; se ignora.`);
      return false;
    }

    await trabajo();

    // Se marca después del trabajo: si el trabajo falla, el mensaje se reintenta.
    // Si el trabajo se completó pero la marca no alcanzó a guardarse, el propio
    // trabajo vuelve a ejecutarse, y por eso cada manejador es idempotente en sí mismo.
    await this.repositorio.save({ id, evento });
    return true;
  }
}
