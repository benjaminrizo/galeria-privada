# ms-seleccion

Microservicio de **selección**: las fotos que elige el cliente, sus comentarios de
retoque y el envío final de la selección.

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
| A-SEL-01 · MarcarFoto | `POST /selecciones/{galeriaId}/fotos/{fotoId}` |
| A-SEL-02 · DesmarcarFoto | `DELETE /selecciones/{galeriaId}/fotos/{fotoId}` |
| A-SEL-03 · ComentarFoto | `PUT /selecciones/{galeriaId}/fotos/{fotoId}/comentario` |
| A-SEL-04 · EnviarSeleccion | `POST /selecciones/{galeriaId}/envio` |
| Q-SEL-01 · ObtenerSeleccion | `GET /selecciones/{galeriaId}` |

| `GET /ping` | Liveness: el proceso está vivo |
| `GET /health` | Readiness: además hay conexión a la base de datos |

Contrato completo y navegable en `http://localhost:3004/docs` (OpenAPI), y
en texto en [`docs/QueriesYActions/ms-seleccion.md`](../../docs/QueriesYActions/ms-seleccion.md).

## Datos

Agregado **Selección** (AG-05).

Una selección por galería. Las fotos marcadas nunca superan el límite vigente,
los comentarios solo existen sobre fotos marcadas, y una vez enviada no admite
cambios ni puede ir vacía. El marcado se hace dentro de una transacción con
bloqueo, para que dos pestañas abiertas a la vez no se salten el límite.

El esquema se crea y evoluciona **solo con migraciones versionadas**
(`src/migraciones/`), que se aplican solas al arrancar. No se usa
`synchronize`: el esquema no cambia sin dejar rastro.

Las referencias a datos de otros servicios se guardan como identificador suelto,
sin clave foránea, porque viven en bases de datos distintas (RNF-15).
