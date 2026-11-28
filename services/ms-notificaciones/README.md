# ms-notificaciones

Microservicio de **notificaciones**: los correos al cliente cuando se publica su
galería y al fotógrafo cuando el cliente envía su selección.

Parte del sistema **Galería Privada**. El repositorio sombrilla, con el
`docker-compose` del sistema completo y toda la documentación, es
[galeria-privada](../../README.md).

## Requisitos

Docker y Docker Compose. Nada más: no hace falta tener Node instalado en la
máquina (capítulo 8, Guideline 1).

## Comandos

| Comando | Qué hace |
|---|---|
| `make start` | Levanta este servicio con su base de datos, aislado del resto |
| `make stop` | Lo detiene |
| `make test` | Pruebas con cobertura |
| `make lint` | Análisis estático |
| `make build` | Construye la imagen de producción |
| `make logs` | Muestra los logs |
| `make clean` | Borra contenedores, volúmenes y artefactos |

`make start` levanta solo este servicio, para trabajar en él sin arrancar el
sistema entero (Guideline 4). El código se edita en el host y se ejecuta dentro
del contenedor, con recarga en caliente al guardar.

## Operaciones

| Operación | Ruta |
|---|---|
| Q-NOT-01 · ObtenerNotificacion | `GET /notificaciones/{id}` |

No tiene actions públicas: reacciona a eventos del broker, no a llamadas.

| `GET /ping` | Liveness: el proceso está vivo |
| `GET /health` | Readiness: además hay conexión a la base de datos |

Contrato completo y navegable en `http://localhost:3005/docs` (OpenAPI), y
en texto en [`docs/QueriesYActions/ms-notificaciones.md`](../../docs/QueriesYActions/ms-notificaciones.md).

## Datos

Agregado **Notificación** (AG-07).

Guarda tipo, destinatario, estado e intentos, para poder reintentar si el
servidor de correo falla (HU-17). Un mismo evento genera un solo correo por
mucho que el broker lo reentregue: el identificador del evento es único en la
tabla.

El esquema se crea y evoluciona **solo con migraciones versionadas**
(`src/migraciones/`), que se aplican solas al arrancar. No se usa
`synchronize`: el esquema no cambia sin dejar rastro.

Las referencias a datos de otros servicios se guardan como identificador suelto,
sin clave foránea, porque viven en bases de datos distintas (RNF-15).
