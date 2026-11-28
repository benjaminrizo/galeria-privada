# Galería Privada

Sistema web de galerías fotográficas privadas donde los fotógrafos suben sus
sesiones y los clientes seleccionan fotos y dejan comentarios de retoque.
Proyecto de arquitectura de microservicios.

> Desarrollo de Software III · Universidad del Valle Sede Yumbo · 2026-2

## Arrancar el sistema

```bash
cp .env.example .env          # opcional: los valores por defecto ya sirven
make start                    # o: docker compose up -d --build
```

Para trabajar en el código, con recarga en caliente al guardar:

```bash
make dev
```

`make help` lista todos los comandos. Los mismos nombres (`start`, `stop`,
`build`, `test`, `lint`, `clean`, `logs`, `migrate`) existen en cada componente,
en Go igual que en TypeScript.

Con eso queda todo en pie (RNF-16):

| Dirección | Qué es |
|---|---|
| **http://localhost:9080** | **La aplicación · única puerta del sistema** |
| http://localhost:8081 | Panel de Traefik: qué rutas hay y si responden |
| http://localhost:9080/docs | Contrato OpenAPI del gateway |
| http://localhost:8025 | Bandeja de correo de prueba |
| http://localhost:15672 | Panel de RabbitMQ (`galeria` / `galeria`) |
| `localhost:27017` | MongoDB de `ms-pagos` (sin contraseña en desarrollo) |
| http://localhost:9001 | Consola del almacén de archivos (`galeriaprivada` / `galeriaprivada2026`) |

El recorrido para la demostración, paso a paso, está en
[docs/Implementacion/README.md](docs/Implementacion/README.md).

## El entorno de desarrollo

El sistema sigue los *workspace guidelines* del capítulo 8 de
*Microservices: Up and Running*:

| | Cómo se cumple |
|---|---|
| **Docker como única dependencia** | `make start` y nada más; no hace falta Node ni Go en la máquina |
| **Da igual local o remoto** | Todo en contenedores, sin nada atado al sistema operativo |
| **Workspace heterogéneo** | 5 servicios en NestJS sobre PostgreSQL y `ms-pagos` en Go sobre MongoDB |
| **Un servicio o el subsistema** | Cada componente tiene su propio `docker-compose`; el sombrilla levanta todo |
| **Bases de datos locales** | PostgreSQL, MongoDB, RabbitMQ, RustFS (S3) y Mailpit, todas en contenedor |
| **Edge router** | Traefik delante de todo: una sola dirección y descubrimiento automático de servicios |
| **Containerización** | Dockerfiles multistage (`dev` / `prod`), código montado desde el host, recarga en caliente y puerto de depuración |
| **Migraciones** | Esquema versionado en `src/migraciones/`, aplicado al arrancar. Sin `synchronize` |
| **Pruebas automatizadas** | Jest en NestJS, Vitest en el frontend, `go test` en Go, y ESLint en todos |
| **Branching y merging** | CI en cada *pull request*: linting, pruebas y construcción de la imagen |
| **Makefile** | Los mismos targets en los 9 repositorios |

### Cómo entra una petición

```
navegador  ->  Traefik (9080)  ->  ¿la URL empieza por /api?
                                      sí  ->  API Gateway  ->  microservicios
                                      no  ->  frontend
```

Traefik decide **a dónde** va la petición; el gateway decide **qué hacer** con
ella. Son dos capas distintas: red y negocio. Traefik descubre los contenedores
solo, leyendo el socket de Docker, así que añadir un servicio al enrutamiento
es ponerle dos etiquetas.

Los puertos 3000 a 3006 siguen publicados, pero solo para depurar: ver el
Swagger de un servicio suelto o probarlo aislado.

Para probar la API sin abrir el navegador está [`api.http`](api.http), que se
ejecuta desde VS Code con la extensión *REST Client*.

### Comprobar que está vivo

Cada servicio publica dos rutas distintas a propósito:

| Ruta | Qué dice |
|---|---|
| `/ping` | **Liveness**: el proceso está vivo. Si no responde, hay que reiniciarlo |
| `/health` | **Readiness**: además puede trabajar (tiene base de datos). Si falla, solo hay que dejar de mandarle tráfico |

`make health` las consulta todas de una vez.

## Qué hace

El fotógrafo crea una galería por sesión, define cuántas fotos incluye el
paquete y comparte un enlace privado. El cliente entra **sin crear cuenta**,
elige hasta el límite permitido, comenta los retoques que necesita y envía su
selección; el fotógrafo la recibe completa y ordenada.

## Arquitectura

Seis microservicios y un API Gateway, que es el único punto de entrada y el que
orquesta las operaciones que tocan a varios servicios (ADR 0002). Los procesos
secundarios van por eventos en RabbitMQ.

| Componente | Responsabilidad |
|---|---|
| API Gateway | Entrada única, validación de sesión y orquestación |
| `ms-auth` | Cuentas del fotógrafo y enlaces privados de galería |
| `ms-galerias` | Sesiones, límites y estado de las galerías |
| `ms-media` | Subida de fotos, miniaturas y entrega protegida |
| `ms-seleccion` | Fotos elegidas, comentarios y envío final |
| `ms-notificaciones` | Correos, con reintentos |
| `ms-pagos` | Pedidos de fotos extra con pago simulado |

Cada servicio tiene su propia base de datos (RNF-15) y nadie entra en la de
otro. React para el frontend, NestJS y TypeScript para el backend, PostgreSQL,
RabbitMQ, RustFS como almacenamiento compatible con S3 y Docker Compose.

## Documentación

Todo el diseño está en [`docs/`](docs/):

- [Descripción del proyecto](docs/descripcion-del-proyecto.md) · contexto, alcance y participantes
- [JTBD](docs/JTBD.md) y [Job stories](docs/JobStories/)
- [Backlog de producto](docs/Backlog/BACKLOG.md) · épicas, historias de usuario con Gherkin e historias técnicas
- [Requerimientos funcionales](docs/requerimientos_funcionales.md) y [no funcionales](docs/requerimientos_no_funcionales.md)
- [Event storming](docs/EventStorming/) · los siete pasos, bounded contexts, microservicios candidatos, modelo de datos y patrones de interacción
- [Diagramas de secuencia](docs/DiagramasSecuencia/) · en PlantUML
- [Queries y Actions](docs/QueriesYActions/) · el contrato de cada servicio
- [ADRs](docs/ADRs/) · las decisiones de arquitectura
- [Implementación](docs/Implementacion/README.md) · cómo está construido y cómo se corresponde con el diseño

## Publicar el backlog como Issues

El backlog vive como Issues de GitHub Projects. El texto de cada una está en
[`docs/Backlog/issues/`](docs/Backlog/issues/) y se publican con:

```bash
./scripts/publicar-en-github.sh benjaminrizo/galeria-privada CapitanFantastico
```

Ese script sube el código, comparte el repositorio con el colaborador y crea
las 40 Issues (8 épicas, 20 historias de usuario y 12 historias técnicas) en un
GitHub Project. Necesita [GitHub CLI](https://cli.github.com) con sesión
iniciada y el permiso de proyectos:

```bash
gh auth login
gh auth refresh -s project,read:project
```

## Estructura

```
gateway/            API Gateway
services/           los seis microservicios
frontend/           React + Vite, servido por nginx
infra/              una base de datos y un usuario por servicio
scripts/            publicación en GitHub
docs/               todo el diseño
docker-compose.yml  el sistema completo
```

## Integrantes

- Joshua Arciniegas Rosero
- Andrés Felipe Chicaiza
- Andrés Felipe Portillo
- Giankarlo Gonzales Varela
- Benjamin Rizo Luna
