# ms-pagos: Pagos (extra)

Datos propios: `pedidos`. Implementa un **pago simulado**: confirma el pedido sin cobrar nada. No pide ni guarda datos de tarjeta (RNF-06).

## Actions

| ID | Nombre | Entrada | Salida | Reglas y errores | Evento | Ruta | Historia |
|---|---|---|---|---|---|---|---|
| A-PAG-01 | CrearPedido | galeriaId, cantidadFotos, precioUnitario | pedidoId, total | Cantidad y precio mayores que cero (`422 DATOS_INVALIDOS`). El total es cantidad por precio | EV-24 | `POST /pedidos` | HU-20 |
| A-PAG-02 | ConfirmarPagoSimulado | pedidoId | estado `confirmado` | `404 PEDIDO_NO_ENCONTRADO`. Idempotente si ya estaba confirmado | EV-25 | `POST /pedidos/{id}/pago-simulado` | HU-20 |

## Queries

| ID | Nombre | Entrada | Salida | Reglas y errores | Ruta | Historia |
|---|---|---|---|---|---|---|
| Q-PAG-01 | ObtenerPedido | pedidoId | galeriaId, cantidad, total, estado | `404 PEDIDO_NO_ENCONTRADO` | `GET /pedidos/{id}` | HU-20 |
