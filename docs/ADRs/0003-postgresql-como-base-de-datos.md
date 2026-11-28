# ADR 0003: PostgreSQL como base de datos, una por servicio

- **Estado:** Propuesta
- **Fecha:** 4 de noviembre de 2026
- **Matizada por:** [ADR 0011](0011-go-y-mongodb-para-ms-pagos.md), que saca a `ms-pagos` de esta decisión

## Contexto

Cada microservicio debe tener su propia base de datos (RNF-15). El modelo de datos del [paso 6 del event storming](../EventStorming/06-modelado-de-datos.md) es relacional: galerías, fotos, selecciones con sus fotos marcadas, pedidos. Además, todo el sistema debe levantarse con un solo comando (RNF-16).

## Decisión

Se usa **PostgreSQL** como motor de todos los servicios que guardan datos. En desarrollo, un solo contenedor de PostgreSQL aloja **una base de datos por servicio, cada una con su propio usuario y contraseña**, de modo que un servicio no pueda leer las tablas de otro.

`ms-notificaciones` también usa PostgreSQL, para registrar los envíos y reintentarlos.

> **Actualización (ADR 0011).** `ms-pagos` dejó de usar PostgreSQL y pasó a MongoDB, junto con el cambio de lenguaje a Go. La decisión de esta ADR sigue valiendo para los otros cinco servicios; lo que cambió es el alcance de «todos». La alternativa «MongoDB» que aquí se descartaba se descartaba *para el modelo relacional del sistema*, y eso sigue siendo cierto: el pedido es el único agregado que no lo es.

## Consecuencias

**A favor**
- Un solo motor que aprender y operar para todo el equipo.
- Soporta las restricciones del modelo (claves únicas, claves compuestas) y el tipo JSON para el contenido de las notificaciones.
- Un solo contenedor en `docker-compose` mantiene simple el arranque.

**En contra**
- Un contenedor compartido es un punto único de fallo en desarrollo; en producción se separarían las instancias.
- El aislamiento depende de usuarios y permisos, no de servidores distintos.

**Medidas**
- Cada servicio se conecta únicamente con las credenciales de su propia base.
- Las referencias entre servicios se guardan como identificadores, sin claves foráneas.

## Alternativas consideradas

- **MongoDB:** flexible, pero el modelo es claramente relacional y la consistencia de la selección se beneficia de restricciones y transacciones.
- **Un motor distinto por servicio:** más fiel a la independencia, pero multiplica el trabajo de operación sin aportar valor para este proyecto.
- **Una sola base compartida con tablas por servicio:** descartada porque viola RNF-15.
