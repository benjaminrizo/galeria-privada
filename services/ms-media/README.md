# ms-media

Microservicio de **medios**: subida de fotos, generación de miniaturas y entrega
protegida de los archivos.

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
| A-MED-01 · SubirFotos | `POST /fotos` |
| Q-MED-01 · ListarFotosDeGaleria | `GET /fotos` |
| Q-MED-02 · ObtenerUrlDeFoto | `GET /fotos/{id}/url` |

| `GET /ping` | Liveness: el proceso está vivo |
| `GET /health` | Readiness: además hay conexión a la base de datos |

Contrato completo y navegable en `http://localhost:3003/docs` (OpenAPI), y
en texto en [`docs/QueriesYActions/ms-media.md`](../../docs/QueriesYActions/ms-media.md).

## Datos

Agregado **Foto** (AG-04).

Los archivos no van en la base de datos: van a un almacén de objetos
compatible con S3 (RustFS en local, ADR 0005 y ADR 0010). El cliente solo
recibe URLs firmadas con vencimiento corto, y **nunca** la ruta del original
(HU-09). Solo se aceptan JPG, PNG y WebP.

Las miniaturas se generan en segundo plano a través del broker, no durante la
subida (HT-06): la foto queda guardada aunque el broker esté caído.

El esquema se crea y evoluciona **solo con migraciones versionadas**
(`src/migraciones/`), que se aplican solas al arrancar. No se usa
`synchronize`: el esquema no cambia sin dejar rastro.

Las referencias a datos de otros servicios se guardan como identificador suelto,
sin clave foránea, porque viven en bases de datos distintas (RNF-15).
