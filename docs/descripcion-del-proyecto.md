# Galería Privada

Sistema web de galerías fotográficas personalizadas, donde los fotógrafos suben sus sesiones y los clientes seleccionan sus fotos favoritas, dejan comentarios de retoque y compran fotos extra, todo desde el navegador.

> Proyecto académico de Desarrollo de Software III · Universidad del Valle Sede Yumbo · 2026-2

## Problema

Hoy muchos fotógrafos entregan sus sesiones por WhatsApp, correo o enlaces de nube genéricos. Eso dificulta que el cliente elija sus fotos con un límite claro, que deje indicaciones de retoque ordenadas por foto . El fotógrafo termina gestionando todo a mano.

## Solución

Una plataforma donde el fotógrafo crea una galería privada por sesión, define cuántas fotos incluye el paquete y comparte un enlace de acceso con su cliente. El cliente entra, selecciona hasta el límite permitido, comenta los retoques que necesita y, si quiere más fotos, las compra en línea. Al finalizar, el fotógrafo recibe la selección completa.

## Actores principales

- **Fotógrafo:** crea sesiones, sube fotos, define límites y recibe las selecciones.
- **Cliente:** accede a su galería privada, selecciona, comenta y compra fotos extra.
- **Pasarela de pagos:** sistema externo que procesa los pagos de las fotos adicionales.

## Funcionalidades clave

- Creación de sesiones y galerías privadas con enlace de acceso o PIN
- Subida de fotos con generación automática de miniaturas y marca de agua
- Selección de fotos con contador y bloqueo al llegar al límite del paquete
- Comentarios por foto
- Notificaciones por correo (galería lista, selección enviada, pago confirmado)

## Arquitectura

El sistema está diseñado con **arquitectura de microservicios**, siguiendo el proceso de diseño **SEED(S)**. Los microservicios implementan las capacidades del negocio y una capa de API (API Gateway) orquesta las interacciones; los procesos secundarios se desacoplan mediante eventos asíncronos.

| Componente | Responsabilidad |
|---|---|
| API Gateway | Punto de entrada, autenticación y orquestación |
| ms-auth | Usuarios, roles y acceso privado a galerías |
| ms-galerias | Sesiones, límites y estado de las galerías |
| ms-media | Subida, optimización y entrega de fotos |
| ms-seleccion | Selección de fotos y comentarios de retoque |
| ms-pagos | Pedidos y pagos de fotos extra |
| ms-notificaciones | Envío de correos y avisos |

## Tecnologías

- **Frontend:** React
- **Backend:** Node.js (Express o NestJS)
- **Base de datos:**
- **Mensajería:** RabbitMQ o Redis
- **Contenedores:** Docker y docker-compose
- **Documentación de APIs:** OpenAPI (Swagger)
- **Diagramas:** PlantUML


## Estado del proyecto

- [ ] Descripción del proyecto
- [ ] Actores y JTBDs
- [ ] Diagramas de secuencia
- [ ] Queries y Actions
- [ ] Requerimientos
- [ ] ADRs
- [ ] Implementación

## Integrantes

| Joshua Arciniegas Rosero |
| Andrés Felipe Portillo |
| Giankarlo Gonzales Varela |
| Andrés Felipe Chicaiza |
| Benjamin Rizo Luna |
