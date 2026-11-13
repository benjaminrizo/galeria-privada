# ADR 0006: NestJS como framework de backend

- **Estado:** Propuesta
- **Fecha:** 4 de noviembre de 2026

## Contexto

El backend se escribe en Node.js y la descripción del proyecto deja abierta la elección entre Express y NestJS. Hay seis servicios y un gateway, desarrollados por cinco personas en paralelo. Cada servicio debe documentar su contrato con OpenAPI (RNF-13) y varios consumen o publican mensajes en el broker.

## Decisión

Se usa **NestJS** (con TypeScript) para el gateway y los microservicios.

- Estructura de módulos, controladores y servicios igual en todos los servicios.
- Documentación OpenAPI generada con el módulo de Swagger de NestJS.
- Integración con RabbitMQ mediante el soporte de microservicios de NestJS.

## Consecuencias

**A favor**
- Todos los servicios se parecen entre sí, lo que facilita que cualquiera del equipo entre en cualquier servicio.
- La documentación OpenAPI sale de las anotaciones del propio código.
- La validación de entrada (por ejemplo, límite mayor que cero) se declara con decoradores.

**En contra**
- Hay una curva de aprendizaje inicial, sobre todo con inyección de dependencias y decoradores.
- Más código de base (boilerplate) que Express.

## Alternativas consideradas

- **Express:** más ligero y conocido, pero cada servicio terminaría con su propia estructura y habría que montar a mano la documentación OpenAPI y la validación.
