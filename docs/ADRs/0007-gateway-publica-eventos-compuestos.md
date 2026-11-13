# ADR 0007: El gateway publica los eventos que combinan datos de varios servicios

- **Estado:** Propuesta
- **Fecha:** 4 de noviembre de 2026

## Contexto

Los correos necesitan datos que viven en servicios distintos. Por ejemplo, el correo al cliente cuando se publica su galería necesita su nombre y correo (en `ms-galerias`) y el enlace de acceso (en `ms-auth`). El correo al fotógrafo necesita su correo (`ms-auth`) y el nombre de la galería (`ms-galerias`).

Según el ADR 0002, los servicios no se llaman entre sí. Si `ms-notificaciones` tuviera que pedir esos datos, estaría llamando a otros servicios; y si un servicio publicara un evento incompleto, el consumidor no podría actuar.

## Decisión

Se aplica esta regla:

- **Un servicio publica un evento cuando su contenido depende solo de sus propios datos.** Ejemplos: `FotoSubida` (`ms-media`) y `GaleriaEliminada` (`ms-galerias`).
- **Cuando el evento necesita datos de varios servicios, lo compone y lo publica el API Gateway**, una vez que terminó de orquestar la operación. Ejemplos: `GaleriaPublicada` y `SeleccionEnviada`.

Estos eventos llevan todos los datos que el consumidor necesita, de modo que `ms-notificaciones` no consulta a nadie.

## Consecuencias

**A favor**
- Ningún servicio llama a otro para armar un correo, en línea con el ADR 0002.
- `ms-notificaciones` queda simple y fácil de probar: recibe un evento completo y envía el correo.

**En contra**
- El gateway acumula una responsabilidad más (ya reconocida como consecuencia del ADR 0002).
- Si el gateway cae después de completar la operación y antes de publicar el evento, el correo no se envía.

**Medidas**
- La publicación del evento es el último paso de la orquestación; la operación de negocio no depende de que el correo salga.
- Mantener esta lógica en módulos separados por flujo dentro del gateway.

## Alternativas consideradas

- **Que cada servicio publique su propio evento y `ms-notificaciones` junte los datos:** exigiría que ese servicio mantenga copias de datos ajenos o los consulte.
- **Que `ms-notificaciones` consulte a los demás servicios:** rompe el ADR 0002.
