# ms-notificaciones: Notificaciones

Este servicio **no expone operaciones HTTP de negocio**: reacciona a eventos. Datos propios: `notificaciones`.

## Actions (disparadas por eventos)

| ID | Nombre | Entrada (evento) | Reglas y errores | Evento resultante | Historia |
|---|---|---|---|---|---|
| A-NOT-01 | EnviarCorreoGaleriaPublicada | `GaleriaPublicada` | Registra la notificación y envía el correo al cliente con el enlace. Si falla, queda `pendiente` y se reintenta | EV-13 | HU-17 |
| A-NOT-02 | EnviarCorreoSeleccionEnviada | `SeleccionEnviada` | Registra la notificación y envía el correo al fotógrafo. Si falla, queda `pendiente` y se reintenta | EV-22 | HU-18 |

Los consumidores son idempotentes: recibir el mismo evento dos veces no genera dos correos (se identifica la notificación por el evento).

## Queries

| ID | Nombre | Entrada | Salida | Ruta |
|---|---|---|---|---|
| Q-NOT-01 | ConsultarEstadoDeNotificacion | id | estado, intentos | `GET /notificaciones/{id}` (uso interno y de diagnóstico) |

## Eventos que consume

`GaleriaPublicada`, `SeleccionEnviada` (ver [eventos.md](eventos.md)).
