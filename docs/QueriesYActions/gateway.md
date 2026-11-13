# API Gateway: API pública

Es la única API que usa el frontend. Cada operación indica a qué servicios llama. El fotógrafo se identifica con un **token** (cabecera `Authorization`); el cliente se identifica con el **código** que va en la ruta (ADR 0001).

## Fotógrafo

| ID | Nombre | Tipo | Entrada | Salida | Ruta | Orquesta | Diagrama |
|---|---|---|---|---|---|---|---|
| G-01 | Registrar fotógrafo | Action | nombre, correo, password | 201 | `POST /api/auth/registro` | `ms-auth` | SEQ-01 |
| G-02 | Iniciar sesión | Action | correo, password | token | `POST /api/auth/login` | `ms-auth` | SEQ-01 |
| G-03 | Listar mis galerías | Query | | lista de galerías con estado | `GET /api/galerias` | `ms-galerias` | |
| G-04 | Crear galería | Action | nombre, clienteNombre, clienteCorreo, limiteIncluido | galería y enlace | `POST /api/galerias` | `ms-galerias`, `ms-auth` | SEQ-02 |
| G-05 | Ver detalle de galería | Query | id | galería, enlace y fotos con estado de procesamiento | `GET /api/galerias/{id}` | `ms-galerias`, `ms-auth`, `ms-media` | |
| G-06 | Editar galería | Action | id, nombre?, limiteIncluido? | galería | `PATCH /api/galerias/{id}` | `ms-seleccion`, `ms-galerias` | SEQ-03 |
| G-07 | Eliminar galería | Action | id | 204 | `DELETE /api/galerias/{id}` | `ms-galerias` | SEQ-04 |
| G-08 | Subir fotos | Action | id, imágenes | aceptadas y rechazadas | `POST /api/galerias/{id}/fotos` | `ms-galerias`, `ms-media` | SEQ-05 |
| G-09 | Publicar galería | Action | id | 200 | `POST /api/galerias/{id}/publicacion` | `ms-media`, `ms-galerias`, `ms-auth` | SEQ-06 |
| G-10 | Ver selección enviada | Query | id | galería y fotos con comentario | `GET /api/galerias/{id}/seleccion` | `ms-galerias`, `ms-seleccion`, `ms-media` | SEQ-11 |
| G-11 | Definir precio de foto extra (extra) | Action | id, precio | 200 | `PUT /api/galerias/{id}/precio-foto-extra` | `ms-galerias` | SEQ-12 |

Todas las rutas del fotógrafo, excepto G-01 y G-02, requieren token válido (`401` si falta o no es válido).

## Cliente

`{codigo}` es el código aleatorio del enlace privado.

| ID | Nombre | Tipo | Entrada | Salida | Ruta | Orquesta | Diagrama |
|---|---|---|---|---|---|---|---|
| G-12 | Abrir galería | Query | codigo | galería, miniaturas, fotos marcadas y contador | `GET /api/c/{codigo}` | `ms-auth`, `ms-galerias`, `ms-media`, `ms-seleccion` | SEQ-07 |
| G-13 | Marcar foto | Action | codigo, fotoId | cantidad y límite vigente | `PUT /api/c/{codigo}/seleccion/fotos/{fotoId}` | `ms-auth`, `ms-galerias`, `ms-media`, `ms-seleccion` | SEQ-08 |
| G-14 | Desmarcar foto | Action | codigo, fotoId | cantidad | `DELETE /api/c/{codigo}/seleccion/fotos/{fotoId}` | `ms-auth`, `ms-seleccion` | SEQ-08 |
| G-15 | Guardar comentario de retoque | Action | codigo, fotoId, comentario | 200 | `PUT /api/c/{codigo}/seleccion/fotos/{fotoId}/comentario` | `ms-auth`, `ms-seleccion` | SEQ-09 |
| G-16 | Enviar selección | Action | codigo | 200 | `POST /api/c/{codigo}/seleccion/envio` | `ms-auth`, `ms-seleccion`, `ms-galerias` | SEQ-10 |
| G-17 | Pedir fotos extra (extra) | Action | codigo, cantidad | pedido y límite vigente | `POST /api/c/{codigo}/pedidos` | `ms-auth`, `ms-galerias`, `ms-pagos` | SEQ-12 |

## Errores comunes del cliente

| Código HTTP | Código de error | Cuándo |
|---|---|---|
| 404 | `GALERIA_NO_ENCONTRADA` | El código no existe |
| 403 | `GALERIA_NO_DISPONIBLE` | La galería sigue en borrador |
| 409 | `LIMITE_ALCANZADO` | Marcar una foto cuando ya se llegó al límite |
| 409 | `SELECCION_ENVIADA` | Cualquier cambio después del envío |
