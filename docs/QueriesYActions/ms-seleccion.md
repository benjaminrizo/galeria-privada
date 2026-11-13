# ms-seleccion: Selección

Datos propios: `selecciones`, `fotos_seleccionadas`. **No conoce el límite**: lo recibe del gateway en cada marcado (HT-12). Una vez `enviada`, la selección no admite cambios.

## Actions

| ID | Nombre | Entrada | Salida | Reglas y errores | Evento | Ruta | Historia |
|---|---|---|---|---|---|---|---|
| A-SEL-01 | MarcarFoto | galeriaId, fotoId, limiteVigente | cantidad | `409 LIMITE_ALCANZADO` si ya hay `limiteVigente` fotos marcadas. `409 SELECCION_ENVIADA`. Es idempotente si ya estaba marcada. Crea la selección si no existe | EV-16, EV-18 | `PUT /galerias/{galeriaId}/seleccion/fotos/{fotoId}` | HU-10, HU-11, HU-12 |
| A-SEL-02 | DesmarcarFoto | galeriaId, fotoId | cantidad | `409 SELECCION_ENVIADA`. Se borra también su comentario | EV-17 | `DELETE /galerias/{galeriaId}/seleccion/fotos/{fotoId}` | HU-10 |
| A-SEL-03 | GuardarComentario | galeriaId, fotoId, comentario | 200 | `409 FOTO_NO_MARCADA`. `409 SELECCION_ENVIADA`. Reemplaza el comentario anterior | EV-19 | `PUT /galerias/{galeriaId}/seleccion/fotos/{fotoId}/comentario` | HU-15 |
| A-SEL-04 | EnviarSeleccion | galeriaId | cantidad | `422 SELECCION_VACIA` si no hay fotos. `409 SELECCION_ENVIADA` si ya se envió. Pasa a `enviada` y se bloquea | EV-20 | `POST /galerias/{galeriaId}/seleccion/envio` | HU-13 |

## Queries

| ID | Nombre | Entrada | Salida | Reglas y errores | Ruta | Historia |
|---|---|---|---|---|---|---|
| Q-SEL-01 | ObtenerSeleccion | galeriaId | estado, fotos [{fotoId, comentario}], cantidad | Si no existe, devuelve `en_curso` con cero fotos | `GET /galerias/{galeriaId}/seleccion` | HU-11, HU-12, HU-14, HU-16 |

## Eventos que consume

| Evento | Reacción |
|---|---|
| `GaleriaEliminada` | Borra la selección y sus comentarios (idempotente) |
