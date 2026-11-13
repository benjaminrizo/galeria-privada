# Queries y Actions

Contrato de las operaciones de cada microservicio, en un formato estándar. Se derivan de los [diagramas de secuencia](../DiagramasSecuencia/README.md) y del [event storming](../EventStorming/README.md).

- **Query:** consulta que **no modifica** el estado del sistema. Es idempotente y se puede repetir sin efectos.
- **Action:** operación que **modifica** el estado. Corresponde a un comando del event storming y puede producir eventos.

## Formato de cada operación

| Campo | Significado |
|---|---|
| **ID** | `Q-` para queries y `A-` para actions, seguido del servicio y un número |
| **Nombre** | Nombre de la operación, en el lenguaje ubicuo |
| **Entrada** | Datos que recibe. `?` indica un dato opcional |
| **Salida** | Datos que devuelve cuando todo sale bien |
| **Reglas y errores** | Precondiciones y errores posibles (código HTTP y código de error) |
| **Evento** | Evento de dominio o de integración que produce (solo en actions) |
| **Ruta** | Método HTTP y ruta del servicio |
| **Historia** | Historia de usuario que la origina |

## Convenciones

- Los identificadores (`galeriaId`, `fotoId`, etc.) son UUID.
- Los errores devuelven `{ "codigo": "CODIGO_DE_ERROR", "mensaje": "texto legible" }`.
- Códigos HTTP: `200` correcto, `201` creado, `202` aceptado para procesar en segundo plano, `204` sin contenido, `401` no autenticado, `404` no encontrado, `409` conflicto con el estado actual, `422` datos inválidos, `503` servicio no disponible.
- Los servicios solo reciben llamadas del API Gateway (ADR 0002). El gateway valida el token del fotógrafo y entrega al servicio el `fotografoId`; los servicios confían en ese dato.
- Cada servicio documenta su contrato completo con OpenAPI (HT-04); estas tablas son su resumen.

## Contenido

| Archivo | Servicio |
|---|---|
| [gateway.md](gateway.md) | API pública (la que usa el frontend) |
| [ms-auth.md](ms-auth.md) | Identidad y Acceso |
| [ms-galerias.md](ms-galerias.md) | Gestión de Galerías |
| [ms-media.md](ms-media.md) | Medios |
| [ms-seleccion.md](ms-seleccion.md) | Selección |
| [ms-notificaciones.md](ms-notificaciones.md) | Notificaciones |
| [ms-pagos.md](ms-pagos.md) | Pagos (extra) |
| [eventos.md](eventos.md) | Catálogo de eventos de integración |
