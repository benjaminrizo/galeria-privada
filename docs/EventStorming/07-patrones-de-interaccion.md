# Paso 7: Patrones de interacción

Aquí se define **cómo colaboran** los servicios en cada flujo, respetando el ADR 0002: los servicios no se llaman entre sí; el API Gateway orquesta y los eventos cubren los procesos secundarios.

## Patrones usados

| Patrón | Qué es | Dónde se usa |
|---|---|---|
| **Petición directa** | El gateway llama a un solo servicio y devuelve la respuesta. | Registro, inicio de sesión, editar galería |
| **Composición de consultas** | El gateway consulta a varios servicios y combina los resultados en una sola respuesta. | Galería del cliente, selección enviada |
| **Orquestación** | El gateway ejecuta varios pasos en orden, y deshace o reintenta si uno falla. | Crear galería, publicar, enviar selección, pedido extra |
| **Cola de trabajo** | Un servicio deja una tarea en el broker y la procesa en segundo plano. | Miniaturas (HT-06) |
| **Publicación y suscripción** | Se publica un evento y cada servicio interesado reacciona por su cuenta. | Correos, limpieza al eliminar una galería |
| **Consistencia eventual** | Los datos de distintos servicios se alinean poco después, no al instante. | Borrado en cascada |

## Flujos principales

Cada flujo tiene su diagrama de secuencia en [`../DiagramasSecuencia/`](../DiagramasSecuencia/).

| ID | Flujo | Patrón | Participantes | Historias |
|---|---|---|---|---|
| SEQ-01 | Registro e inicio de sesión | Petición directa | Gateway, `ms-auth` | HU-01 |
| SEQ-02 | Crear galería | Orquestación | Gateway, `ms-galerias`, `ms-auth` | HU-02, HU-04 |
| SEQ-03 | Editar galería | Orquestación | Gateway, `ms-seleccion`, `ms-galerias` | HU-05 |
| SEQ-04 | Eliminar galería | Publicación y suscripción | Gateway, `ms-galerias`, `ms-media`, `ms-seleccion`, `ms-auth` | HU-05 |
| SEQ-05 | Subir fotos y generar miniaturas | Orquestación y cola de trabajo | Gateway, `ms-galerias`, `ms-media` | HU-07, HU-08 |
| SEQ-06 | Publicar galería | Orquestación y publicación | Gateway, `ms-media`, `ms-galerias`, `ms-auth`, `ms-notificaciones` | HU-06, HU-17 |
| SEQ-07 | Cliente abre su galería | Composición de consultas | Gateway, `ms-auth`, `ms-galerias`, `ms-media`, `ms-seleccion` | HU-03, HU-09, HU-11 |
| SEQ-08 | Marcar o desmarcar una foto | Orquestación | Gateway, `ms-auth`, `ms-galerias`, `ms-media`, `ms-seleccion` | HU-10, HU-11, HU-12 |
| SEQ-09 | Guardar comentario de retoque | Orquestación | Gateway, `ms-auth`, `ms-seleccion` | HU-15 |
| SEQ-10 | Enviar selección final | Orquestación y publicación | Gateway, `ms-seleccion`, `ms-galerias`, `ms-auth`, `ms-notificaciones` | HU-13, HU-18 |
| SEQ-11 | Fotógrafo ve la selección | Composición de consultas | Gateway, `ms-galerias`, `ms-seleccion`, `ms-media` | HU-14, HU-16 |
| SEQ-12 | Precio y pedido de fotos extra con pago simulado | Orquestación | Gateway, `ms-auth`, `ms-galerias`, `ms-pagos` | HU-19, HU-20 |

## Detalle de los flujos con orquestación

### SEQ-02: Crear galería
1. El gateway valida la sesión del fotógrafo.
2. Llama a `ms-galerias` para crear la galería en borrador.
3. Llama a `ms-auth` para generar el enlace de acceso.
4. **Si el paso 3 falla**, el gateway elimina la galería creada (compensación) y devuelve un error.

### SEQ-06: Publicar galería
1. El gateway consulta a `ms-media` cuántas fotos tiene la galería.
2. Llama a `ms-galerias` para publicarla, enviándole esa cantidad; `ms-galerias` rechaza si es cero, si la galería no es del fotógrafo o si no está en borrador.
3. Consulta a `ms-auth` el enlace de acceso.
4. Publica el evento `GaleriaPublicada` con los datos completos. La publicación ya quedó hecha aunque el correo falle.

### SEQ-08: Marcar una foto
1. El gateway resuelve el enlace a una galería con `ms-auth`.
2. Consulta a `ms-galerias` que esté `publicada` y el límite vigente (incluido más extra).
3. Verifica con `ms-media` que la foto pertenezca a esa galería, para que nadie marque identificadores ajenos.
4. Envía a `ms-seleccion` el comando de marcado junto con ese límite.
5. `ms-seleccion` acepta (EV-16) o rechaza por límite (EV-18).

### SEQ-10: Enviar selección final
1. El gateway resuelve el enlace con `ms-auth` y pide a `ms-seleccion` enviar la selección; esta se bloquea.
2. Llama a `ms-galerias` para pasar la galería a `seleccion_enviada`; la respuesta trae el nombre de la galería y el fotógrafo.
3. Consulta a `ms-auth` el correo del fotógrafo.
4. Publica el evento `SeleccionEnviada` con los datos completos.
5. **Si el paso 2 falla**, el gateway reintenta; mientras no se complete, la selección ya enviada permanece bloqueada.

### SEQ-12: Pedido de fotos extra
1. El gateway resuelve el enlace con `ms-auth` y consulta a `ms-galerias` el precio de la foto extra.
2. Llama a `ms-pagos` para crear y confirmar el pedido simulado.
3. Llama a `ms-galerias` para aumentar el límite.
4. **Si el paso 3 falla**, el pedido queda confirmado pero sin aplicar; el gateway reintenta hasta lograrlo.

## Eventos de integración

Regla propuesta (ADR 0007): **un servicio publica su evento cuando el contenido solo depende de sus propios datos; cuando el evento necesita datos de varios servicios, lo compone y lo publica el gateway** después de orquestar.

| Evento | Lo publica | Lo consumen | Contenido |
|---|---|---|---|
| `FotoSubida` | `ms-media` | `ms-media` (cola de trabajo) | fotoId, galeriaId |
| `GaleriaEliminada` | `ms-galerias` | `ms-media`, `ms-seleccion`, `ms-auth` | galeriaId |
| `GaleriaPublicada` | Gateway | `ms-notificaciones` | galeriaId, nombre de la galería, nombre y correo del cliente, enlace de acceso |
| `SeleccionEnviada` | Gateway | `ms-notificaciones` | galeriaId, nombre de la galería, correo del fotógrafo, cantidad de fotos |

Todos los consumidores deben ser **idempotentes**: si reciben el mismo evento dos veces, el resultado es el mismo (por ejemplo, borrar algo que ya no existe no es un error).

## Manejo de fallos

| Situación | Comportamiento |
|---|---|
| Cae `ms-notificaciones` | La acción principal igual se completa; los eventos esperan en el broker (HU-17). |
| Cae `ms-media` | El cliente no ve fotos, pero el resto del sistema sigue funcionando. |
| Falla la generación de una miniatura | Esa foto se marca `error`; las demás no se ven afectadas (HU-08). |
| Se pierde un evento `GaleriaEliminada` | Quedan datos huérfanos; se resuelve con reintentos del broker (ADR 0008). |

## Puntos críticos (hotspots)

| ID | Duda | Resolución propuesta |
|---|---|---|
| H-15 | El gateway acumula lógica de coordinación y puede volverse complejo (consecuencia ya reconocida en el ADR 0002). | Mantener la orquestación en módulos separados por flujo dentro del gateway. |
| H-16 | ¿RabbitMQ o Redis? | Decidir en el ADR 0004. RabbitMQ ofrece colas y reintentos de forma nativa; Redis es más simple de operar. |
| H-17 | ¿Es válido que el gateway publique eventos de otros servicios? | Es una decisión propia de este diseño; confirmar en el ADR 0007. |
