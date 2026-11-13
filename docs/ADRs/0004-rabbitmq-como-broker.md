# ADR 0004: RabbitMQ como broker de mensajes

- **Estado:** Propuesta
- **Fecha:** 4 de noviembre de 2026

## Contexto

Los procesos secundarios se desacoplan con eventos asíncronos (ADR 0002): generar miniaturas, enviar correos y limpiar datos al eliminar una galería. Estos procesos necesitan **colas con confirmación de recepción y reintentos**, para que un fallo de correo o de procesamiento no pierda trabajo. La descripción del proyecto dejó abierta la opción entre RabbitMQ y Redis.

## Decisión

Se usa **RabbitMQ**.

- Cola de trabajo para `FotoSubida` (varios procesadores podrían consumir).
- Un intercambio de eventos con una cola por servicio consumidor para `GaleriaEliminada`, `GaleriaPublicada` y `SeleccionEnviada`.
- Los consumidores confirman (`ack`) cada mensaje al terminar; si fallan, el mensaje se reintenta.

## Consecuencias

**A favor**
- Colas duraderas, confirmaciones y reintentos nativos.
- Permite que un servicio caído reciba sus mensajes al volver.
- Tiene interfaz web de administración para depurar.

**En contra**
- Es una pieza más que operar y levantar en `docker-compose`.
- Requiere definir bien nombres de colas e intercambios.

**Medidas**
- Los consumidores son idempotentes: cada mensaje lleva un `id` único.
- Se define una cola de mensajes fallidos (dead letter) para los que agoten los reintentos.

## Alternativas consideradas

- **Redis (listas o streams):** más simple de operar, pero los reintentos y las confirmaciones hay que programarlos a mano o con librerías adicionales.
- **Llamadas HTTP directas:** descartada por el ADR 0002.
