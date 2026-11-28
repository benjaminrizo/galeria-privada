# ms-galerias

Microservicio de **gestión de galerías**: las sesiones del fotógrafo, los datos
del cliente, el límite de fotos incluidas y el estado de cada galería.

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
| A-GAL-01 · CrearGaleria | `POST /galerias` |
| A-GAL-02 · EditarGaleria | `PATCH /galerias/{id}` |
| A-GAL-03 · EliminarGaleria | `DELETE /galerias/{id}` |
| A-GAL-04 · PublicarGaleria | `POST /galerias/{id}/publicacion` |
| Q-GAL-01 · ListarGaleriasDeFotografo | `GET /galerias` |
| Q-GAL-02 · ObtenerGaleria | `GET /galerias/{id}` |

| `GET /ping` | Liveness: el proceso está vivo |
| `GET /health` | Readiness: además hay conexión a la base de datos |

Contrato completo y navegable en `http://localhost:3002/docs` (OpenAPI), y
en texto en [`docs/QueriesYActions/ms-galerias.md`](../../docs/QueriesYActions/ms-galerias.md).

## Datos

Agregado **Galería** (AG-03).

El estado solo avanza: `borrador` → `publicada` → `seleccion_enviada`. El
límite vigente es `limite_incluido + limite_extra`, y no puede quedar por
debajo de lo que el cliente ya marcó.

El esquema se crea y evoluciona **solo con migraciones versionadas**
(`src/migraciones/`), que se aplican solas al arrancar. No se usa
`synchronize`: el esquema no cambia sin dejar rastro.

Las referencias a datos de otros servicios se guardan como identificador suelto,
sin clave foránea, porque viven en bases de datos distintas (RNF-15).
