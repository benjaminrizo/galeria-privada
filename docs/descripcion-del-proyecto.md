# Galería Privada

Sistema web de galerías fotográficas personalizadas, donde los fotógrafos suben sus sesiones y los clientes seleccionan sus fotos favoritas, dejan comentarios de retoque y, como extra, compran fotos adicionales, todo desde el navegador.

> Proyecto académico de Desarrollo de Software III · Universidad del Valle Sede Yumbo · 2026-2

## Contexto

Hoy muchos fotógrafos entregan sus sesiones por WhatsApp, correo o enlaces de nube genéricos. Ese proceso es informal y deja varios problemas:

- El cliente no tiene un límite claro de cuántas fotos incluye su paquete.
- Las indicaciones de retoque llegan desordenadas, mezcladas con otros mensajes y sin relación directa con cada foto.
- El fotógrafo termina consolidando a mano las selecciones y los comentarios.
- Los archivos originales se comparten sin control sobre quién los ve.

Este proyecto propone una plataforma donde cada sesión tiene su galería privada y el proceso de selección queda ordenado de principio a fin. Además, sirve como caso de estudio para diseñar un sistema con **arquitectura de microservicios** siguiendo el proceso SEED(S).

## Solución

El fotógrafo crea una galería privada por sesión, define cuántas fotos incluye el paquete y comparte un enlace de acceso con su cliente. El cliente entra sin crear cuenta, selecciona hasta el límite permitido y comenta los retoques que necesita. Al enviar su selección, el fotógrafo la recibe completa y ordenada.

## Alcance

### Dentro del alcance (MVP)

- Registro e inicio de sesión del fotógrafo.
- Creación, edición y eliminación de sesiones, con nombre, datos del cliente y límite de fotos.
- Galería con estados: borrador, publicada y selección enviada.
- Enlace privado y único por galería; el cliente entra sin cuenta (ADR 0001).
- Subida de varias fotos y generación automática de miniaturas; el cliente nunca ve el original.
- Selección con contador y bloqueo al llegar al límite; guardado de la selección y envío final.
- Visualización de la selección enviada por parte del fotógrafo.

### Dentro del alcance, después del MVP

- Comentarios de retoque por foto, visibles para el fotógrafo.
- Notificaciones por correo: galería publicada y selección enviada.

### Extras (solo si sobra tiempo)

- Fotos extra con **pago simulado** (botón "Pagar" que confirma el pedido sin cobrar) y precio definido por el fotógrafo.
- Marca de agua en las fotos.
- PIN adicional para entrar a la galería.
- Fecha de expiración de la galería.
- Reabrir una selección ya enviada.
- Descarga de las fotos finales en ZIP.
- Pago real con pasarela en modo de pruebas.

### Fuera del alcance

- Cuentas de cliente con registro e inicio de sesión (descartado en el ADR 0001).
- Aplicaciones móviles nativas (el cliente usa el navegador del celular).
- Edición o retoque de fotos dentro de la plataforma.
- Almacenamiento de datos de tarjetas (RNF-06).

## Actores principales

- **Fotógrafo:** crea sesiones, sube fotos, define límites y recibe las selecciones.
- **Cliente:** accede a su galería privada, selecciona fotos y comenta retoques.
- **Pasarela de pagos (extra):** sistema externo que solo se integraría si sobra tiempo; mientras tanto el pago es simulado.

## Funcionalidades clave

- Creación de sesiones y galerías privadas con enlace de acceso.
- Subida de fotos con generación automática de miniaturas.
- Selección de fotos con contador y bloqueo al llegar al límite del paquete.
- Comentarios de retoque por foto.
- Notificaciones por correo (galería lista, selección enviada).

## Arquitectura

El sistema está diseñado con **arquitectura de microservicios**, siguiendo el proceso de diseño **SEED(S)**. Los microservicios implementan las capacidades del negocio y el **API Gateway** orquesta las interacciones entre ellos (ADR 0002); los procesos secundarios se desacoplan mediante eventos asíncronos.

| Componente | Responsabilidad |
|---|---|
| API Gateway | Punto de entrada, autenticación y orquestación |
| ms-auth | Usuarios, roles y acceso privado a galerías |
| ms-galerias | Sesiones, límites y estado de las galerías |
| ms-media | Subida, optimización y entrega de fotos |
| ms-seleccion | Selección de fotos y comentarios de retoque |
| ms-pagos | Pedidos y pagos de fotos extra (extra) |
| ms-notificaciones | Envío de correos y avisos |

> Esta división es una propuesta inicial; se validará y ajustará con el proceso de event storming.

## Tecnologías

- **Frontend:** React
- **Backend:** Node.js con NestJS (ADR 0006, propuesta)
- **Base de datos:** PostgreSQL, una base por servicio (RNF-15; ADR 0003, propuesta)
- **Mensajería:** RabbitMQ (ADR 0004, propuesta)
- **Almacenamiento de archivos:** MinIO, con URLs temporales (ADR 0005, propuesta)
- **Contenedores:** Docker y docker-compose
- **Documentación de APIs:** OpenAPI (Swagger)
- **Diagramas:** PlantUML

## Participantes

| Nombre |
|---|
| Joshua Arciniegas Rosero |
| Andrés Felipe Chicaiza |
| Andrés Felipe Portillo |
| Giankarlo Gonzales Varela |
| Benjamin Rizo Luna |

## Estado del proyecto

- [x] Descripción del proyecto
- [x] Actores y JTBDs
- [x] Job stories
- [x] Backlog (épicas, historias de usuario, historias técnicas) — el texto de cada issue está en `docs/Backlog/issues/`; se publican con `scripts/publicar-en-github.sh`
- [x] Diagramas de secuencia
- [x] Queries y Actions
- [x] Requerimientos (funcionales y no funcionales)
- [x] ADRs (0001 a 0009; del 0003 al 0009 están en estado Propuesta, pendientes de que el equipo los acepte)
- [x] Event storming
- [x] Implementación de los microservicios — los siete servicios, el frontend y `docker-compose`; ver [Implementación](Implementacion/README.md)

### Lo que queda pendiente de la implementación

- **RNF-01 (HTTPS):** en desarrollo todo va por HTTP. Es la historia HT-10, marcada como «Después».
- **Migraciones:** las tablas se crean al arrancar; falta pasar a migraciones.
- **Pruebas automáticas:** el flujo completo se verificó a mano; no hay todavía pruebas unitarias ni de integración en el repositorio.
