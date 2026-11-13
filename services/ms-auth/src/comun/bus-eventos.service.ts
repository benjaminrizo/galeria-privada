import { Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { randomUUID } from 'crypto';
import {
  EXCHANGE_EVENTOS,
  EXCHANGE_FALLIDOS,
  Mensaje,
  NombreDeEvento,
} from './tipos';

type Manejador<T> = (datos: T, mensaje: Mensaje<T>) => Promise<void>;

interface Suscripcion {
  cola: string;
  evento: NombreDeEvento;
  manejador: Manejador<any>;
}

/**
 * Publicación y suscripción de eventos de integración sobre RabbitMQ (ADR 0004).
 *
 * Se usa un exchange de tipo `topic` porque un mismo evento puede interesarle a
 * varios servicios a la vez: `GaleriaEliminada` lo consumen ms-media,
 * ms-seleccion y ms-auth (docs/QueriesYActions/eventos.md). Cada consumidor
 * tiene su propia cola duradera, así que si un servicio está caído sus mensajes
 * lo esperan en el broker en lugar de perderse.
 */
@Injectable()
export class BusDeEventos implements OnModuleInit, OnApplicationShutdown {
  private readonly log = new Logger('BusDeEventos');
  // Se deduce del propio `connect` para no depender de cómo se llame el tipo
  // en cada versión de amqplib (`Connection` en 0.10, `ChannelModel` después).
  private conexion: Awaited<ReturnType<typeof amqp.connect>>;
  private canal: amqp.Channel;
  private readonly suscripciones: Suscripcion[] = [];
  private cerrando = false;

  /**
   * Se lee del entorno en el cuerpo, no como parámetro del constructor: Nest
   * intentaría inyectar cualquier parámetro y no sabría qué pasarle.
   */
  private readonly url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

  onModuleInit() {
    // La conexión arranca en segundo plano y no se espera: si el broker todavía
    // no está listo, el servicio igual atiende sus rutas HTTP y se conecta
    // cuando pueda. Un broker caído no debe dejar al servicio sin arrancar.
    void this.conectar();
  }

  async onApplicationShutdown() {
    this.cerrando = true;
    try {
      await this.canal?.close();
      await this.conexion?.close();
    } catch {
      /* el cierre no debe tumbar el apagado */
    }
  }

  /** Registra un consumidor. Puede llamarse antes de que exista la conexión. */
  async suscribir<T>(cola: string, evento: NombreDeEvento, manejador: Manejador<T>) {
    this.suscripciones.push({ cola, evento, manejador });
    if (this.canal) await this.declararConsumidor({ cola, evento, manejador });
  }

  /** Publica un evento. El `id` permite que los consumidores ignoren duplicados. */
  async publicar<T>(evento: NombreDeEvento, datos: T): Promise<string> {
    const mensaje: Mensaje<T> = {
      evento,
      id: randomUUID(),
      ocurrioEn: new Date().toISOString(),
      datos,
    };

    // Si la conexión aún no está lista se espera un momento, en lugar de
    // quedarse esperando sin final: quien publica necesita una respuesta.
    if (!this.canal) await this.esperarCanal();

    this.canal.publish(EXCHANGE_EVENTOS, evento, Buffer.from(JSON.stringify(mensaje)), {
      persistent: true,
      messageId: mensaje.id,
      contentType: 'application/json',
    });

    this.log.log(`Publicado ${evento} (${mensaje.id})`);
    return mensaje.id;
  }

  /** Espera a que la reconexión de fondo deje el canal listo. */
  private async esperarCanal(msMaximos = 5000): Promise<void> {
    const limite = Date.now() + msMaximos;

    while (!this.canal && Date.now() < limite) {
      await new Promise((r) => setTimeout(r, 200));
    }

    if (!this.canal) {
      throw new Error('No hay conexión con el broker de mensajes.');
    }
  }

  private async conectar(intento = 1): Promise<void> {
    try {
      this.conexion = await amqp.connect(this.url);
      this.canal = await this.conexion.createChannel();

      await this.canal.assertExchange(EXCHANGE_EVENTOS, 'topic', { durable: true });
      await this.canal.assertExchange(EXCHANGE_FALLIDOS, 'topic', { durable: true });
      await this.canal.prefetch(5);

      this.conexion.on('close', () => this.reconectar('cerrada'));
      this.conexion.on('error', (e) => this.log.error(`Conexión con error: ${e.message}`));

      for (const suscripcion of this.suscripciones) await this.declararConsumidor(suscripcion);

      this.log.log(`Conectado al broker (${this.suscripciones.length} suscripciones).`);
    } catch (error: any) {
      const espera = Math.min(intento * 2000, 10000);
      this.log.warn(`No se pudo conectar al broker (${error.message}); reintento en ${espera} ms.`);
      await new Promise((r) => setTimeout(r, espera));
      return this.conectar(intento + 1);
    }
  }

  private reconectar(motivo: string) {
    if (this.cerrando) return;
    this.canal = undefined;
    this.conexion = undefined;
    this.log.warn(`Conexión ${motivo}; reconectando.`);
    void this.conectar();
  }

  private async declararConsumidor({ cola, evento, manejador }: Suscripcion) {
    const colaFallidos = `${cola}.fallidos`;

    await this.canal.assertQueue(colaFallidos, { durable: true });
    await this.canal.bindQueue(colaFallidos, EXCHANGE_FALLIDOS, cola);

    await this.canal.assertQueue(cola, {
      durable: true,
      deadLetterExchange: EXCHANGE_FALLIDOS,
      deadLetterRoutingKey: cola,
    });
    await this.canal.bindQueue(cola, EXCHANGE_EVENTOS, evento);

    await this.canal.consume(cola, async (crudo) => {
      if (!crudo) return;
      let mensaje: Mensaje;

      try {
        mensaje = JSON.parse(crudo.content.toString());
      } catch {
        this.log.error(`Mensaje ilegible en ${cola}; se descarta.`);
        return this.canal.nack(crudo, false, false);
      }

      try {
        await manejador(mensaje.datos, mensaje);
        this.canal.ack(crudo);
      } catch (error: any) {
        // Un reintento inmediato cubre los fallos pasajeros; si vuelve a fallar,
        // el mensaje va a la cola de fallidos para revisarlo a mano.
        const yaReintentado = crudo.fields.redelivered;
        this.log.error(
          `Fallo al procesar ${mensaje.evento} (${mensaje.id}) en ${cola}: ${error.message}` +
            (yaReintentado ? ' · se envía a la cola de fallidos' : ' · se reintenta'),
        );
        this.canal.nack(crudo, false, !yaReintentado);
      }
    });
  }
}
