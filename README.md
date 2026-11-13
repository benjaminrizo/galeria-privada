# Galería Privada

Sistema web de galerías fotográficas privadas donde los fotógrafos suben sus
sesiones y los clientes seleccionan fotos y dejan comentarios de retoque.
Proyecto de arquitectura de microservicios.

> Desarrollo de Software III · Universidad del Valle Sede Yumbo · 2026-2

## Arrancar el sistema

```bash
cp .env.example .env          # opcional: los valores por defecto ya sirven
docker compose up --build
```

Con eso queda todo en pie (RNF-16):

| Dirección | Qué es |
|---|---|
| http://localhost:8080 | La aplicación |
| http://localhost:3000/docs | Contrato OpenAPI del gateway |
| http://localhost:8025 | Bandeja de correo de prueba |
| http://localhost:15672 | Panel de RabbitMQ (`galeria` / `galeria`) |
| http://localhost:9001 | Consola del almacén de archivos (`galeriaprivada` / `galeriaprivada2026`) |

El recorrido para la demostración, paso a paso, está en
[docs/Implementacion/README.md](docs/Implementacion/README.md).

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
