# ms-auth

Microservicio de **identidad y acceso**: registro e inicio de sesión del fotógrafo,
y generación y resolución de los enlaces con los que entra el cliente.

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
| A-AUTH-01 · RegistrarFotografo | `POST /fotografos` |
| A-AUTH-02 · IniciarSesion | `POST /sesiones` |
| A-AUTH-03 · GenerarEnlaceDeAcceso | `POST /accesos` |
| Q-AUTH-01 · ResolverEnlace | `GET /accesos/{codigo}` |

| `GET /ping` | Liveness: el proceso está vivo |
| `GET /health` | Readiness: además hay conexión a la base de datos |

Contrato completo y navegable en `http://localhost:3001/docs` (OpenAPI), y
en texto en [`docs/QueriesYActions/ms-auth.md`](../../docs/QueriesYActions/ms-auth.md).

## Datos

Agregados **Fotógrafo** (AG-01) y **Acceso a Galería** (AG-02).

La contraseña se guarda siempre como hash con bcrypt, nunca en texto plano
(RNF-03). El código del enlace son 24 bytes aleatorios en base64url: largo,
imposible de adivinar y seguro dentro de una URL (RNF-02).

El esquema se crea y evoluciona **solo con migraciones versionadas**
(`src/migraciones/`), que se aplican solas al arrancar. No se usa
`synchronize`: el esquema no cambia sin dejar rastro.

Las referencias a datos de otros servicios se guardan como identificador suelto,
sin clave foránea, porque viven en bases de datos distintas (RNF-15).
