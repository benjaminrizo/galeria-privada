# ms-galerias: Gestión de Galerías

Datos propios: `galerias`. El **límite vigente** es `limite_incluido + limite_extra`. Toda operación que recibe `fotografoId` verifica que la galería le pertenezca; si no, responde `404 GALERIA_NO_ENCONTRADA`.

## Actions

| ID | Nombre | Entrada | Salida | Reglas y errores | Evento | Ruta | Historia |
|---|---|---|---|---|---|---|---|
| A-GAL-01 | CrearGaleria | fotografoId, nombre, clienteNombre, clienteCorreo, limiteIncluido | galeriaId | Límite mayor que cero y nombre no vacío (`422 DATOS_INVALIDOS`). Nace en estado `borrador` | EV-04 | `POST /galerias` | HU-04 |
| A-GAL-02 | EditarGaleria | id, fotografoId, nombre?, limiteIncluido?, cantidadMarcadas? | galería | `409 LIMITE_MENOR_A_SELECCION` si el nuevo límite vigente es menor que `cantidadMarcadas`. `422 DATOS_INVALIDOS` | EV-06 | `PATCH /galerias/{id}` | HU-05 |
| A-GAL-03 | EliminarGaleria | id, fotografoId | 204 | Borra la galería | EV-07 (publica `GaleriaEliminada`) | `DELETE /galerias/{id}` | HU-05 |
| A-GAL-04 | PublicarGaleria | id, fotografoId, cantidadFotos | nombre, clienteNombre, clienteCorreo | `409 ESTADO_INVALIDO` si no está en `borrador`. `422 SIN_FOTOS` si `cantidadFotos` es cero | EV-12 | `POST /galerias/{id}/publicacion` | HU-06 |
| A-GAL-05 | MarcarSeleccionEnviada | id | nombre, fotografoId | Solo desde `publicada`. Idempotente si ya está en `seleccion_enviada` | EV-21 | `POST /galerias/{id}/seleccion-enviada` | HU-06, HU-13 |
| A-GAL-06 | DefinirPrecioFotoExtra (extra) | id, fotografoId, precio | 200 | Precio mayor que cero (`422 DATOS_INVALIDOS`) | EV-23 | `PUT /galerias/{id}/precio-foto-extra` | HU-19 |
| A-GAL-07 | AumentarLimite (extra) | id, cantidad | limiteVigente | Cantidad mayor que cero. Suma a `limite_extra` | EV-26 | `POST /galerias/{id}/limite-extra` | HU-20 |

## Queries

| ID | Nombre | Entrada | Salida | Reglas y errores | Ruta | Historia |
|---|---|---|---|---|---|---|
| Q-GAL-01 | ListarGaleriasDeFotografo | fotografoId | lista de galerías con estado | | `GET /galerias?fotografoId={id}` | HU-04, HU-05 |
| Q-GAL-02 | ObtenerGaleria | id, fotografoId? | nombre, cliente, estado, limiteVigente, precioFotoExtra | Si recibe `fotografoId`, verifica propiedad (el fotógrafo). Sin él, es la consulta del flujo del cliente | `GET /galerias/{id}` | HU-03, HU-11 |

## Eventos que publica

| Evento | Cuándo |
|---|---|
| `GaleriaEliminada` | Después de borrar una galería |
