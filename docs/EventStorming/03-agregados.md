# Paso 3: Agregados

Un **agregado** agrupa los datos que deben mantenerse consistentes entre sí y se modifica solo mediante sus comandos. Se agrupan los comandos y eventos de los pasos anteriores según qué dato protegen.

| ID | Agregado | Comandos | Eventos | Invariantes (reglas que siempre se cumplen) |
|---|---|---|---|---|
| AG-01 | **Fotógrafo** | CMD-01, CMD-02 | EV-01, EV-02, EV-03 | El correo es único. La contraseña se guarda como hash, nunca en texto plano (RNF-03). |
| AG-02 | **Acceso a Galería** | CMD-04, CMD-11 | EV-05, EV-14, EV-15 | El código es aleatorio, largo y único (RNF-02). Cada galería tiene un acceso activo. |
| AG-03 | **Galería** | CMD-03, CMD-05, CMD-06, CMD-09, CMD-16, CMD-18, CMD-21 | EV-04, EV-06, EV-07, EV-12, EV-21, EV-23, EV-26 | El límite incluido es mayor que cero. El estado solo avanza de borrador a publicada y de publicada a selección enviada. |
| AG-04 | **Foto** | CMD-07, CMD-08 | EV-08, EV-09, EV-10, EV-11 | Pertenece a una galería. Solo se admiten formatos de imagen permitidos. El original nunca se expone al cliente. |
| AG-05 | **Selección** | CMD-12, CMD-13, CMD-14, CMD-15 | EV-16 a EV-20 | Una selección por galería. Las fotos marcadas no superan el límite vigente. Los comentarios solo existen sobre fotos marcadas. No se modifica una vez enviada, ni se envía vacía. |
| AG-06 | **Pedido** (extra) | CMD-19, CMD-20 | EV-24, EV-25 | La cantidad es mayor que cero. El total es cantidad por precio unitario. Nunca se guardan datos de tarjeta (RNF-06). |
| AG-07 | **Notificación** | CMD-10, CMD-17 | EV-13, EV-22 | Registra tipo, destinatario, estado e intentos, para poder reintentar si el correo falla (HU-17). |

## Entidades internas

- **Selección** contiene la lista de *fotos seleccionadas* (identificador de foto y comentario opcional). Se mantiene dentro del agregado porque el comentario depende de que la foto esté marcada.
- **Galería** contiene los *datos del cliente* (nombre y correo), el *límite incluido*, el *límite extra* y, como extra, el *precio de la foto extra*.

## Reglas que cruzan agregados

Hay reglas que necesitan datos de dos agregados que viven en servicios distintos. Como los servicios no se llaman entre sí (ADR 0002), las coordina el API Gateway.

| Regla | Agregados involucrados | Cómo se resuelve |
|---|---|---|
| Las fotos marcadas no superan el límite (HU-11) | Selección (fotos marcadas) y Galería (límite) | El gateway consulta el límite vigente a Galería y lo envía junto con el comando de marcado a Selección (HT-12). |
| No publicar una galería sin fotos (HU-06) | Galería y Foto | El gateway verifica la cantidad de fotos en Medios antes de publicar. |
| No bajar el límite por debajo de lo ya seleccionado (HU-05) | Galería y Selección | El gateway consulta la cantidad de fotos marcadas a Selección antes de editar. |
| Al eliminar una galería se borran sus datos asociados (H-03) | Galería, Foto, Selección y Acceso | Evento de limpieza con consistencia eventual (paso 7). |

## Puntos críticos (hotspots)

| ID | Duda | Resolución propuesta |
|---|---|---|
| H-07 | Cada foto podría ser parte del agregado Galería, pero una galería tiene cientos de fotos. | **Foto** es un agregado propio que referencia a la galería por su identificador. |
| H-08 | El límite lo tiene Galería, pero lo hace cumplir Selección. | Selección valida contra el límite que el gateway le entrega en cada comando. |
