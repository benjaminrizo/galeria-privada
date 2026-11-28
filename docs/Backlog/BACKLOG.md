# Backlog de producto

Proyecto: **Galería Privada**

El backlog vive como Issues en GitHub Projects. Esta carpeta contiene el texto de cada issue (`issues/`) y el script `crear-issues.sh` para crearlos todos de una vez. Los requerimientos no funcionales están en [requerimientos_no_funcionales.md](../requerimientos_no_funcionales.md) y se cubren con las historias técnicas.

## Épica 1: Acceso

El fotógrafo tiene cuenta y cada cliente entra a su galería mediante un enlace privado, sin registrarse (ADR 0001).

| ID | Título | Tipo | Prioridad | Ref. |
|---|---|---|---|---|
| [HU-01](<issues/HU-01 - Registro e inicio de sesión del fotógrafo.md>) | Registro e inicio de sesión del fotógrafo | Historia de usuario | MVP | RF-01 |
| [HU-02](<issues/HU-02 - Enlace privado y único por galería.md>) | Enlace privado y único por galería | Historia de usuario | MVP | RF-02 |
| [HU-03](<issues/HU-03 - Acceso del cliente con el enlace, sin cuenta.md>) | Acceso del cliente con el enlace, sin cuenta | Historia de usuario | MVP | RF-03 |

## Épica 2: Sesiones y galerías

El fotógrafo crea y administra sesiones, con su límite de fotos y el estado de cada galería.

| ID | Título | Tipo | Prioridad | Ref. |
|---|---|---|---|---|
| [HU-04](<issues/HU-04 - Crear una sesión.md>) | Crear una sesión | Historia de usuario | MVP | RF-04 |
| [HU-05](<issues/HU-05 - Editar y eliminar sesiones.md>) | Editar y eliminar sesiones | Historia de usuario | MVP | RF-05 |
| [HU-06](<issues/HU-06 - Estados de la galería y publicación.md>) | Estados de la galería y publicación | Historia de usuario | MVP | RF-06, RF-07 |

## Épica 3: Fotos

Subida de fotos, miniaturas automáticas y protección de los originales.

| ID | Título | Tipo | Prioridad | Ref. |
|---|---|---|---|---|
| [HU-07](<issues/HU-07 - Subir varias fotos a una sesión.md>) | Subir varias fotos a una sesión | Historia de usuario | MVP | RF-08 |
| [HU-08](<issues/HU-08 - Miniaturas automáticas.md>) | Miniaturas automáticas | Historia de usuario | MVP | RF-09 |
| [HU-09](<issues/HU-09 - El cliente solo ve versiones reducidas.md>) | El cliente solo ve versiones reducidas | Historia de usuario | MVP | RF-10, RNF-04 |

## Épica 4: Selección

El cliente elige sus fotos dentro del límite, guarda su avance y envía la selección final.

| ID | Título | Tipo | Prioridad | Ref. |
|---|---|---|---|---|
| [HU-10](<issues/HU-10 - Marcar y desmarcar fotos.md>) | Marcar y desmarcar fotos | Historia de usuario | MVP | RF-11 |
| [HU-11](<issues/HU-11 - Contador y bloqueo al llegar al límite.md>) | Contador y bloqueo al llegar al límite | Historia de usuario | MVP | RF-12 |
| [HU-12](<issues/HU-12 - Guardar la selección para continuar después.md>) | Guardar la selección para continuar después | Historia de usuario | MVP | RF-13 |
| [HU-13](<issues/HU-13 - Enviar la selección final.md>) | Enviar la selección final | Historia de usuario | MVP | RF-14 |
| [HU-14](<issues/HU-14 - El fotógrafo ve la selección enviada.md>) | El fotógrafo ve la selección enviada | Historia de usuario | MVP | RF-15 |

## Épica 5: Comentarios de retoque

El cliente indica el retoque deseado en cada foto seleccionada y el fotógrafo lo ve junto a la foto.

| ID | Título | Tipo | Prioridad | Ref. |
|---|---|---|---|---|
| [HU-15](<issues/HU-15 - Comentario de retoque por foto.md>) | Comentario de retoque por foto | Historia de usuario | Después | RF-16 |
| [HU-16](<issues/HU-16 - El fotógrafo ve los comentarios junto a cada foto.md>) | El fotógrafo ve los comentarios junto a cada foto | Historia de usuario | Después | RF-17 |

## Épica 6: Notificaciones

Avisos por correo cuando la galería se publica y cuando el cliente envía su selección.

| ID | Título | Tipo | Prioridad | Ref. |
|---|---|---|---|---|
| [HU-17](<issues/HU-17 - Correo al cliente cuando se publica su galería.md>) | Correo al cliente cuando se publica su galería | Historia de usuario | Después | RF-18 |
| [HU-18](<issues/HU-18 - Correo al fotógrafo cuando el cliente envía su selección.md>) | Correo al fotógrafo cuando el cliente envía su selección | Historia de usuario | Después | RF-19 |

## Épica 7: Fotos extra con pago simulado

Compra de fotos adicionales con un pago simulado (sin cobro real). Épica extra.

| ID | Título | Tipo | Prioridad | Ref. |
|---|---|---|---|---|
| [HU-19](<issues/HU-19 - Definir el precio de las fotos extra.md>) | Definir el precio de las fotos extra | Historia de usuario | Extra | RF-20 |
| [HU-20](<issues/HU-20 - Pedir fotos extra con pago simulado.md>) | Pedir fotos extra con pago simulado | Historia de usuario | Extra | RF-21, RF-22 |

## Épica 8: Fundamentos técnicos

Infraestructura, arquitectura de microservicios y seguridad que sostienen las demás épicas.

| ID | Título | Tipo | Prioridad | Ref. |
|---|---|---|---|---|
| [HT-01](<issues/HT-01 - Estructura del repositorio y docker-compose.md>) | Estructura del repositorio y docker-compose | Historia técnica | MVP | RNF-16 |
| [HT-02](<issues/HT-02 - API Gateway, punto de entrada y validación de sesión.md>) | API Gateway: punto de entrada y validación de sesión | Historia técnica | MVP | RNF-05, RNF-14, ADR 0002 |
| [HT-03](<issues/HT-03 - Base de datos propia por servicio.md>) | Base de datos propia por servicio | Historia técnica | MVP | RNF-15 |
| [HT-04](<issues/HT-04 - Contratos OpenAPI por servicio.md>) | Contratos OpenAPI por servicio | Historia técnica | MVP | RNF-13 |
| [HT-05](<issues/HT-05 - Broker de mensajes y eventos asíncronos.md>) | Broker de mensajes y eventos asíncronos | Historia técnica | Después | RNF-08, ADR 0002 |
| [HT-06](<issues/HT-06 - Procesamiento asíncrono de miniaturas.md>) | Procesamiento asíncrono de miniaturas | Historia técnica | MVP | RNF-07, RNF-08 |
| [HT-07](<issues/HT-07 - Almacenamiento privado de originales con enlaces temporales.md>) | Almacenamiento privado de originales con enlaces temporales | Historia técnica | MVP | RNF-04 |
| [HT-08](<issues/HT-08 - Hash seguro de contraseñas.md>) | Hash seguro de contraseñas | Historia técnica | MVP | RNF-03 |
| [HT-09](<issues/HT-09 - Generación de códigos aleatorios para enlaces.md>) | Generación de códigos aleatorios para enlaces | Historia técnica | MVP | RNF-02 |
| [HT-10](<issues/HT-10 - HTTPS en toda la comunicación.md>) | HTTPS en toda la comunicación | Historia técnica | Después | RNF-01 |
| [HT-11](<issues/HT-11 - Frontend responsive en español.md>) | Frontend responsive en español | Historia técnica | MVP | RNF-10, RNF-11, RNF-12 |
| [HT-12](<issues/HT-12 - Validación de la selección orquestada por el gateway.md>) | Validación de la selección orquestada por el gateway | Historia técnica | MVP | ADR 0002 |
| [HT-13](<issues/HT-13 - Comandos estandarizados con Makefile.md>) | Comandos estandarizados con Makefile | Historia técnica | MVP | ADR 0012 |
| [HT-14](<issues/HT-14 - Esquema de base de datos con migraciones versionadas.md>) | Esquema de base de datos con migraciones versionadas | Historia técnica | MVP | RNF-15, ADR 0012 |
| [HT-15](<issues/HT-15 - Imágenes multistage y entorno de desarrollo con recarga en caliente.md>) | Imágenes multistage y entorno de desarrollo con recarga en caliente | Historia técnica | MVP | RNF-16, ADR 0012 |
| [HT-16](<issues/HT-16 - Pruebas y análisis estático en integración continua.md>) | Pruebas y análisis estático en integración continua | Historia técnica | MVP | ADR 0012 |
| [HT-17](<issues/HT-17 - Comprobaciones de vida y de disponibilidad.md>) | Comprobaciones de vida y de disponibilidad | Historia técnica | MVP | ADR 0012 |
| [HT-18](<issues/HT-18 - Heterogeneidad del stack.md>) | Heterogeneidad del stack | Historia técnica | Extra | ADR 0011 |

## Supuestos por validar con el equipo

Estos criterios no estaban en los requerimientos originales; se propusieron para que las historias fueran comprobables:

- No se puede publicar una galería sin fotos (HU-06).
- No se puede enviar una selección vacía (HU-13).
- Una vez enviada la selección, tampoco se pueden editar los comentarios (HU-15).
- No se puede bajar el límite de una sesión por debajo de las fotos ya seleccionadas (HU-05).
- Si falla el envío de un correo, la acción de negocio igual se completa (HU-17).
