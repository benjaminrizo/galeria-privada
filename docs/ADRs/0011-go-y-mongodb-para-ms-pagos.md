# ADR 0011: Go y MongoDB para `ms-pagos`

- **Estado:** Propuesta
- **Fecha:** 27 de noviembre de 2026
- **Matiza a:** [ADR 0003](0003-postgresql-como-base-de-datos.md) (PostgreSQL para todos los servicios) y [ADR 0006](0006-nestjs-como-framework-de-backend.md) (NestJS para todos)

## Contexto

Los ADR 0003 y 0006 decidieron un único motor de base de datos y un único
framework para todo el sistema. Era razonable al empezar: menos cosas que
aprender y menos cosas que operar.

El problema es que un sistema de microservicios en el que el 100 % de los
servicios comparten lenguaje, framework y motor de base de datos no está
comprobando su propia independencia. Si todos los servicios se despliegan con
el mismo comando, se prueban con la misma herramienta y hablan con el mismo
PostgreSQL, nada impide que aparezcan acoplamientos silenciosos: una librería
compartida, un supuesto sobre el esquema del vecino, un script de arranque que
vale para todos. El síntoma solo se descubre cuando ya es caro arreglarlo.

El capítulo 8 de *Microservices: Up and Running* lo plantea como la **Rule of
Twos**: usar al menos dos alternativas en producción para los componentes
críticos, porque la segunda alternativa es la que obliga a que las fronteras
sean reales. El mismo capítulo advierte lo contrario de la uniformidad total:
*si el 100 % de tus microservicios están en el mismo lenguaje, algo está mal*.

## Decisión

`ms-pagos` se implementa en **Go** con **MongoDB**. El resto del sistema sigue
en NestJS sobre PostgreSQL.

Se eligió `ms-pagos` y no otro por tres razones:

- Es el más pequeño: un agregado, tres operaciones.
- Es el más aislado: nadie depende de él para el MVP, es prioridad *Extra*. Si
  falla, el sistema sigue funcionando sin pagos.
- Su modelo encaja con un documento: un pedido es un objeto cerrado que se
  escribe entero y se lee entero, sin consultas entre tablas.

El contrato no cambia: mismas rutas, mismos códigos de error y mismo formato
`{ codigo, mensaje }`. El gateway no distingue este servicio de los demás, que
es justo la prueba de que la frontera estaba bien puesta.

## Consecuencias

**A favor**
- La independencia de los servicios queda demostrada, no supuesta: `ms-pagos`
  no puede compartir código ni esquema con nadie porque ni siquiera comparte
  lenguaje.
- La imagen de producción pesa unos pocos megabytes (binario estático sobre
  Alpine) frente a los cientos de una imagen con Node y sus dependencias.
- El equipo aprende que el contrato es lo que une a los servicios, no la
  tecnología.

**En contra**
- Dos ecosistemas que mantener: dos gestores de dependencias, dos frameworks
  de pruebas, dos formas de analizar el código.
- Quien trabaje en `ms-pagos` necesita saber Go.
- Un motor de base de datos más en `docker-compose`.

**Medidas**
- El `Makefile` tiene los mismos targets en los nueve repositorios
  ([ADR 0012](0012-entorno-de-desarrollo.md)), así que `make start`, `make test`
  y `make lint` funcionan igual en Go que en TypeScript: quien cambia de
  servicio no cambia de comandos.
- Se limita a **dos** lenguajes y **dos** motores. El capítulo advierte que
  pasar de dos o tres convierte la heterogeneidad en caos.
- El contrato está en `services/ms-pagos/docs/api.yml`, igual que el de los
  demás.

## Alternativas consideradas

- **Dejar todo en NestJS y PostgreSQL.** Más simple de operar, pero deja sin
  comprobar la independencia de los servicios y no cumple la Rule of Twos.
- **Reescribir `ms-notificaciones` en Python con Redis.** También es pequeño,
  pero sí está en el camino crítico de dos flujos del MVP y su modelo
  (reintentos con historial de intentos) encaja peor en una clave-valor.
- **Reescribir dos servicios a la vez.** Cubre más superficie, pero multiplica
  el riesgo sin añadir nada que un solo servicio heterogéneo no demuestre ya.
