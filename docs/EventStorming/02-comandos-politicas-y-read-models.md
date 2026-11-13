# Paso 2: Comandos, políticas y read models

Para cada evento se identifica qué **comando** lo provoca y quién lo ejecuta. Las **políticas** son reglas automáticas del tipo "cuando ocurre X, entonces hacer Y"; los **read models** son la información que una persona necesita ver para decidir.

## Comandos

| ID | Comando | Actor o disparador | Agregado | Evento(s) resultante(s) |
|---|---|---|---|---|
| CMD-01 | Registrar Fotógrafo | Fotógrafo | Fotógrafo | EV-01 |
| CMD-02 | Iniciar Sesión | Fotógrafo | Fotógrafo | EV-02, EV-03 |
| CMD-03 | Crear Galería | Fotógrafo | Galería | EV-04 |
| CMD-04 | Generar Enlace de Acceso | Política POL-01 | Acceso a Galería | EV-05 |
| CMD-05 | Editar Galería | Fotógrafo | Galería | EV-06 |
| CMD-06 | Eliminar Galería | Fotógrafo | Galería | EV-07 |
| CMD-07 | Subir Fotos | Fotógrafo | Foto | EV-08, EV-09 |
| CMD-08 | Generar Miniatura | Política POL-02 | Foto | EV-10, EV-11 |
| CMD-09 | Publicar Galería | Fotógrafo | Galería | EV-12 |
| CMD-10 | Enviar Correo de Galería Publicada | Política POL-03 | Notificación | EV-13 |
| CMD-11 | Abrir Galería con Enlace | Cliente | Acceso a Galería | EV-14, EV-15 |
| CMD-12 | Marcar Foto | Cliente | Selección | EV-16, EV-18 |
| CMD-13 | Desmarcar Foto | Cliente | Selección | EV-17 |
| CMD-14 | Guardar Comentario de Retoque | Cliente | Selección | EV-19 |
| CMD-15 | Enviar Selección | Cliente | Selección | EV-20 |
| CMD-16 | Marcar Galería con Selección Enviada | Política POL-04 | Galería | EV-21 |
| CMD-17 | Enviar Correo de Selección Enviada | Política POL-05 | Notificación | EV-22 |
| CMD-18 | Definir Precio de Foto Extra | Fotógrafo | Galería | EV-23 |
| CMD-19 | Crear Pedido de Fotos Extra | Cliente | Pedido | EV-24 |
| CMD-20 | Confirmar Pago Simulado | Cliente | Pedido | EV-25 |
| CMD-21 | Aumentar Límite de Selección | Política POL-06 | Galería | EV-26 |

## Políticas

| ID | Cuando ocurre... | ...entonces |
|---|---|---|
| POL-01 | EV-04 Galería Creada | CMD-04 Generar Enlace de Acceso |
| POL-02 | EV-08 Foto Subida | CMD-08 Generar Miniatura |
| POL-03 | EV-12 Galería Publicada | CMD-10 Enviar Correo de Galería Publicada |
| POL-04 | EV-20 Selección Enviada | CMD-16 Marcar Galería con Selección Enviada |
| POL-05 | EV-20 Selección Enviada | CMD-17 Enviar Correo de Selección Enviada |
| POL-06 | EV-25 Pago Simulado Confirmado | CMD-21 Aumentar Límite de Selección |
| POL-07 | EV-07 Galería Eliminada | Borrar las fotos, la selección y el enlace asociados (limpieza) |

## Read models

| ID | Read model | Lo consulta | Información que muestra | Historia |
|---|---|---|---|---|
| RM-01 | Panel de sesiones | Fotógrafo | Lista de galerías con su estado | HU-04, HU-05 |
| RM-02 | Detalle de galería | Fotógrafo | Datos, enlace de acceso y fotos con su estado de procesamiento | HU-02, HU-08 |
| RM-03 | Galería del cliente | Cliente | Miniaturas, fotos marcadas y contador "X de N" | HU-03, HU-11, HU-12 |
| RM-04 | Selección enviada | Fotógrafo | Fotos elegidas con su comentario de retoque | HU-14, HU-16 |
| RM-05 | Resumen del pedido extra | Cliente | Cantidad de fotos, precio y total | HU-20 (extra) |

## Sistemas externos

| Sistema | Interviene en | Prioridad |
|---|---|---|
| Servicio de correo (SMTP) | CMD-10, CMD-17 | Después |
| Pasarela de pagos real | Reemplazaría al pago simulado en CMD-20 | Extra |

## Puntos críticos (hotspots)

| ID | Duda | Resolución propuesta |
|---|---|---|
| H-05 | POL-05 necesita el correo del fotógrafo y el nombre de la galería, datos que viven en dos contextos distintos. | El evento lleva todos los datos necesarios (ver paso 7). |
| H-06 | POL-06: ¿quién aumenta el límite al confirmarse el pago? | El gateway lo orquesta, porque es parte de la misma acción del cliente. |
