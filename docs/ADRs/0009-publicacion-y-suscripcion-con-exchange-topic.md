# ADR 0009: Publicación y suscripción con un exchange `topic` de RabbitMQ

- **Estado:** Propuesta
- **Fecha:** 13 de noviembre de 2026

## Contexto

El ADR 0004 decidió RabbitMQ como broker y el ADR 0006 planteó integrarlo con el soporte de microservicios de NestJS. Al implementar los eventos del [catálogo](../QueriesYActions/eventos.md) apareció un detalle que ese planteamiento no cubre: `GaleriaEliminada` lo consumen **tres** servicios a la vez (`ms-media`, `ms-seleccion` y `ms-auth`), y cada uno tiene que recibir su propia copia del mensaje.

El transporte RMQ de NestJS está pensado para enviar un mensaje a **una** cola, que reparte entre sus consumidores. Con ese modelo, los tres servicios compitiendo por la misma cola harían que cada evento lo procesara solo uno, y los otros dos nunca limpiarían sus datos.

## Decisión

Los eventos de integración viajan por un **exchange de tipo `topic`** llamado `galeria.eventos`, declarado con `amqplib` en un módulo común (`src/comun/bus-eventos.service.ts`) que comparten todos los servicios que publican o consumen eventos. `ms-pagos` no participa en el bus: el gateway lo llama directamente y es él quien publica el evento resultante (ADR 0007).

- La **clave de enrutamiento** es el nombre del evento (`GaleriaEliminada`, `FotoSubida`, …).
- Cada consumidor declara su **propia cola duradera**, con el nombre `<servicio>.<evento>`, y la enlaza al exchange con la clave que le interesa.
- Cada cola tiene una **cola de fallidos** asociada (`<servicio>.<evento>.fallidos`) a la que van los mensajes que fallan dos veces, en lugar de dar vueltas sin fin.
- El sobre del mensaje lleva un `id` único, y cada consumidor lo registra en su tabla `eventos_procesados` para no repetir el trabajo (idempotencia).

Las llamadas HTTP entre el gateway y los servicios se mantienen como están: esta decisión solo afecta a los mensajes.

## Consecuencias

**A favor**
- Un evento llega a todos los servicios interesados, que es lo que pide el diseño del paso 7 del event storming.
- Si un servicio está caído, sus mensajes lo esperan en su cola y los procesa al volver.
- Añadir un consumidor nuevo no obliga a tocar al que publica.

**En contra**
- Se usa `amqplib` directamente en lugar del envoltorio de NestJS, así que el bus es código propio del equipo (unas 150 líneas) y hay que mantenerlo.
- Las colas y los enlaces se declaran en el arranque de cada servicio; si alguien se equivoca en el nombre, el consumidor queda escuchando en silencio.

**Medidas**
- Los nombres de los eventos y del exchange están en un único archivo (`src/comun/tipos.ts`), que se copia igual en todos los servicios.
- El panel de RabbitMQ (`http://localhost:15672`) permite ver las colas, sus enlaces y los mensajes fallidos.

## Alternativas consideradas

- **Transporte RMQ de NestJS tal como planteaba el ADR 0006:** más corto de escribir, pero no reparte un mismo evento a varios servicios, que es justo lo que hace falta.
- **Una cola por servicio con un `fanout` por evento:** funciona, pero obliga a un exchange por evento; con `topic` basta uno y la clave de enrutamiento distingue.
- **Emitir los eventos por HTTP desde el gateway a cada servicio:** rompe el desacoplamiento que buscan los ADR 0002 y 0008, y deja al gateway esperando a los procesos secundarios.
