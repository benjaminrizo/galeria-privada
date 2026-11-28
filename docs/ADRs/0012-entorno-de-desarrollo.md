# ADR 0012: Entorno de desarrollo con Docker, migraciones y Makefile

- **Estado:** Propuesta
- **Fecha:** 27 de noviembre de 2026

## Contexto

Hasta ahora el entorno de desarrollo había crecido solo. Funcionaba, pero tenía
tres agujeros que se vuelven caros en cuanto el equipo crece:

1. **El esquema se creaba con `synchronize: true` de TypeORM**, que mira las
   entidades y altera las tablas por su cuenta. Nadie sabe qué cambió ni
   cuándo, no hay forma de volver atrás, y en producción es inaceptable:
   ¿quién ejecuta el `ALTER TABLE` y con qué permisos?
2. **Las imágenes eran de una sola etapa**, con el compilador, el código fuente
   y las dependencias de desarrollo dentro de la imagen que iría a producción.
   Y para ver un cambio había que reconstruir la imagen entera.
3. **Cada componente se arrancaba y se probaba distinto.** Con un lenguaje era
   soportable; con dos ([ADR 0011](0011-go-y-mongodb-para-ms-pagos.md)) deja de
   serlo.

El capítulo 8 de *Microservices: Up and Running* trata esto como un
prerrequisito subestimado: si hacer lo correcto es difícil, la gente toma el
camino de menor resistencia.

## Decisión

**Docker como única dependencia.** En la máquina solo hacen falta Docker y
Docker Compose. No se asume ninguna versión de Node ni de Go instalada.

**Migraciones versionadas.** `synchronize` queda desactivado. Cada servicio
tiene sus migraciones en `src/migraciones/`, con fecha en el nombre, y se
aplican solas al arrancar (`migrationsRun`). El esquema no cambia sin dejar
rastro, y todos los entornos quedan iguales. `ms-pagos` no tiene migraciones
porque MongoDB no tiene esquema fijo.

**Imágenes multistage con dos destinos.** Cada `Dockerfile` tiene **dos
etapas**, ni una más, para que se lea de un vistazo:

| Etapa | Qué lleva | Para qué |
|---|---|---|
| `construccion` | compilador y todas las dependencias | trabajar: se edita en el host y se ejecuta en el contenedor |
| `prod` | solo lo necesario para ejecutar, y no corre como administrador | desplegar |

En los componentes de TypeScript, la etapa de construcción recompila y
reinicia sola al guardar. En Go no se usa ninguna herramienta extra para eso:
compila en segundo y medio, así que para ver un cambio basta con
`docker compose restart ms-pagos`.

**Un servicio o el sistema entero, igual de fácil.** Cada componente tiene su
propio `docker-compose.yml` que lo levanta aislado con sus dependencias. El
repositorio sombrilla levanta el sistema completo.

**`Makefile` con los mismos targets en los nueve repositorios:** `start`,
`stop`, `build`, `test`, `lint`, `clean`, `logs`, `migrate`. Da igual el
lenguaje: `make test` es `jest` en uno, `vitest` en otro y `go test` en el
tercero, pero quien lo escribe no necesita saberlo.

**Pruebas y análisis estático automatizados.** Jest en NestJS, Vitest en el
frontend, `go test` en Go, ESLint y `go vet` para el análisis. La integración
continua ejecuta linting, pruebas y construcción de la imagen de producción en
cada *pull request*, y ninguna rama se mezcla en `main` sin pasar en verde.

**Liveness y readiness separados.** Cada servicio publica `/ping` (el proceso
está vivo) y `/health` (además puede trabajar). Son cosas distintas: a un
servicio que no responde a `/ping` hay que reiniciarlo; a uno que falla
`/health` solo hay que dejar de mandarle tráfico hasta que se recupere.

## Consecuencias

**A favor**
- Un desarrollador nuevo levanta el sistema sin instalar nada y sin preguntar
  cómo se ejecuta.
- El esquema de base de datos tiene historial y reversión.
- La imagen de producción es pequeña y no lleva código fuente ni herramientas
  de compilación.
- Los errores se detectan en el *pull request*, no en `main`.

**En contra**
- Más archivos que mantener: un `Makefile`, un `docker-compose` y una
  configuración de pruebas por componente.
- Las migraciones hay que escribirlas a mano cuando cambia una entidad; antes
  no había que hacer nada.
- La primera construcción es más lenta, porque son más etapas.

**Medidas**
- Los `Makefile` son idénticos salvo en los comandos concretos, así que
  cambiarlos es mecánico.
- La protección de rama en GitHub es lo que hace que la integración continua
  sea obligatoria y no decorativa; hay que activarla en *Settings → Branches*.

## Alternativas consideradas

- **Seguir con `synchronize`.** Cero trabajo, pero ningún control sobre el
  esquema y ninguna forma de desplegar un cambio de tabla con seguridad.
- **Scripts por componente en lugar de `Makefile`.** Equivalente en lo técnico,
  pero obliga a recordar un conjunto de comandos por lenguaje, que es
  exactamente lo que el `Makefile` evita.
- **Montar el código también en producción.** Más rápido de desplegar, pero la
  imagen deja de ser autocontenida y de poder ejecutarse en un orquestador.
