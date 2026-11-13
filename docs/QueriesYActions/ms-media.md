# ms-media: Medios

Datos propios: `fotos` y los archivos en el almacenamiento privado. Los originales nunca se entregan al cliente (RNF-04); el cliente solo recibe URLs de miniaturas.

## Actions

| ID | Nombre | Entrada | Salida | Reglas y errores | Evento | Ruta | Historia |
|---|---|---|---|---|---|---|---|
| A-MED-01 | SubirFotos | galeriaId, archivos | aceptadas, rechazadas | `202`: el procesamiento es en segundo plano (RNF-08). Los formatos no permitidos se rechazan sin afectar al resto | EV-08, EV-09 (publica `FotoSubida`) | `POST /galerias/{galeriaId}/fotos` | HU-07 |
| A-MED-02 | GenerarMiniatura | fotoId | | Interna: la dispara `FotoSubida`. Marca la foto `lista` o `error` sin afectar a las demás | EV-10, EV-11 | (evento) | HU-08 |

## Queries

| ID | Nombre | Entrada | Salida | Reglas y errores | Ruta | Historia |
|---|---|---|---|---|---|---|
| Q-MED-01 | ContarFotos | galeriaId | total | | `GET /galerias/{galeriaId}/fotos/total` | HU-06 |
| Q-MED-02 | ListarFotos | galeriaId, pagina? | fotos con estado y URL de miniatura | Solo miniaturas. Las que están en procesamiento se marcan como tales | `GET /galerias/{galeriaId}/fotos` | HU-08, HU-09 |
| Q-MED-03 | VerificarFotoDeGaleria | galeriaId, fotoId | 200 | `404 FOTO_NO_ENCONTRADA` si no pertenece a esa galería | `GET /galerias/{galeriaId}/fotos/{fotoId}` | HU-10 |
| Q-MED-04 | ObtenerFotos | fotoIds | nombre de archivo, URL de miniatura, URL temporal del original | La URL del original expira (HT-07). Solo la usa el gateway en rutas del fotógrafo | `GET /fotos?ids={ids}` | HU-14, HU-16 |

## Eventos

| Evento | Rol | Reacción |
|---|---|---|
| `FotoSubida` | Publica y consume | Genera la miniatura en segundo plano |
| `GaleriaEliminada` | Consume | Borra las fotos y los archivos de esa galería (idempotente) |
