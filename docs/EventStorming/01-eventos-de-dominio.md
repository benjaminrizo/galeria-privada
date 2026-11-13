# Paso 1: Eventos de dominio

Se listan los eventos de negocio en **orden cronológico**, escritos en pasado. Cada uno se relaciona con las historias de usuario del [backlog](../Backlog/BACKLOG.md). Prioridad: `MVP`, `Después` o `Extra`.

## Fase A: Cuenta del fotógrafo

| ID | Evento | Actor | Historia | Prioridad |
|---|---|---|---|---|
| EV-01 | Fotógrafo Registrado | Fotógrafo | HU-01 | MVP |
| EV-02 | Fotógrafo Autenticado | Fotógrafo | HU-01 | MVP |
| EV-03 | Autenticación del Fotógrafo Fallida | Fotógrafo | HU-01 | MVP |

## Fase B: Preparación de la galería

| ID | Evento | Actor | Historia | Prioridad |
|---|---|---|---|---|
| EV-04 | Galería Creada | Fotógrafo | HU-04 | MVP |
| EV-05 | Enlace de Acceso Generado | Sistema | HU-02 | MVP |
| EV-06 | Galería Editada | Fotógrafo | HU-05 | MVP |
| EV-07 | Galería Eliminada | Fotógrafo | HU-05 | MVP |
| EV-08 | Foto Subida | Fotógrafo | HU-07 | MVP |
| EV-09 | Foto Rechazada por Formato | Sistema | HU-07 | MVP |
| EV-10 | Miniatura Generada | Sistema | HU-08 | MVP |
| EV-11 | Procesamiento de Foto Fallido | Sistema | HU-08 | MVP |
| EV-12 | Galería Publicada | Fotógrafo | HU-06 | MVP |
| EV-13 | Correo de Galería Publicada Enviado | Sistema | HU-17 | Después |

## Fase C: Acceso del cliente

| ID | Evento | Actor | Historia | Prioridad |
|---|---|---|---|---|
| EV-14 | Acceso a Galería Concedido | Cliente | HU-03 | MVP |
| EV-15 | Acceso a Galería Denegado | Cliente | HU-03 | MVP |

## Fase D: Selección del cliente

| ID | Evento | Actor | Historia | Prioridad |
|---|---|---|---|---|
| EV-16 | Foto Marcada | Cliente | HU-10, HU-12 | MVP |
| EV-17 | Foto Desmarcada | Cliente | HU-10, HU-12 | MVP |
| EV-18 | Marcado de Foto Rechazado por Límite | Sistema | HU-11 | MVP |
| EV-19 | Comentario de Retoque Guardado | Cliente | HU-15 | Después |
| EV-20 | Selección Enviada | Cliente | HU-13 | MVP |
| EV-21 | Galería Marcada con Selección Enviada | Sistema | HU-06 | MVP |
| EV-22 | Correo de Selección Enviada al Fotógrafo | Sistema | HU-18 | Después |

## Fase E: Fotos extra (extra)

| ID | Evento | Actor | Historia | Prioridad |
|---|---|---|---|---|
| EV-23 | Precio de Foto Extra Definido | Fotógrafo | HU-19 | Extra |
| EV-24 | Pedido de Fotos Extra Creado | Cliente | HU-20 | Extra |
| EV-25 | Pago Simulado Confirmado | Cliente | HU-20 | Extra |
| EV-26 | Límite de Selección Aumentado | Sistema | HU-20 | Extra |

## Eventos de los otros extras

Solo se modelan si sobra tiempo; no entran en los pasos siguientes.

- Enlace de Acceso Revocado / Regenerado (ADR 0001, "si el tiempo lo permite")
- PIN de Galería Configurado
- Galería Expirada
- Selección Reabierta
- Fotos Finales Descargadas

## Puntos críticos (hotspots)

| ID | Duda | Resolución propuesta |
|---|---|---|
| H-01 | ¿Sesión y galería son conceptos distintos? | No: son uno solo. Un único agregado **Galería** (ver glosario). |
| H-02 | ¿Dónde viven el nombre y el correo del cliente, si no tiene cuenta (ADR 0001)? | Dentro de la **Galería**, en `ms-galerias`. |
| H-03 | Al eliminar una galería, ¿qué pasa con sus fotos, su selección y su enlace? | Deben borrarse. Se resuelve en el paso 7 con un evento de limpieza (ADR 0008). |
| H-04 | ¿Quién decide si se puede publicar sin fotos (HU-06)? Las fotos viven en otro contexto que la galería. | El gateway consulta a Medios antes de publicar (paso 7). |
