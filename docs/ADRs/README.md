# ADRs (Architecture Decision Records)

Cada decisión de arquitectura está en su propio archivo.

| ADR | Decisión | Estado |
|---|---|---|
| [0001](0001-acceso-del-cliente-por-enlace.md) | Acceso del cliente mediante enlace privado | Aceptada |
| [0002](0002-gateway-orquesta-microservicios.md) | El API Gateway orquesta y los microservicios no se llaman entre sí | Aceptada |
| [0003](0003-postgresql-como-base-de-datos.md) | PostgreSQL como base de datos, una por servicio | Propuesta |
| [0004](0004-rabbitmq-como-broker.md) | RabbitMQ como broker de mensajes | Propuesta |
| [0005](0005-almacenamiento-de-archivos-con-minio.md) | Almacenamiento de archivos privado con URLs temporales | Propuesta · producto reemplazado por el 0010 |
| [0006](0006-nestjs-como-framework-de-backend.md) | NestJS como framework de backend | Propuesta |
| [0007](0007-gateway-publica-eventos-compuestos.md) | El gateway publica los eventos que combinan datos de varios servicios | Propuesta |
| [0008](0008-consistencia-eventual-y-borrado-en-cascada.md) | Consistencia eventual y borrado en cascada por eventos | Propuesta |
| [0009](0009-publicacion-y-suscripcion-con-exchange-topic.md) | Publicación y suscripción con un exchange `topic` de RabbitMQ | Propuesta |
| [0010](0010-rustfs-en-lugar-de-minio.md) | RustFS en lugar de MinIO como almacenamiento de archivos | Propuesta |
| [0011](0011-go-y-mongodb-para-ms-pagos.md) | Go y MongoDB para `ms-pagos` | Propuesta |
| [0012](0012-entorno-de-desarrollo.md) | Entorno de desarrollo con Docker, migraciones y Makefile | Propuesta |

Los ADR 0003 a 0008 salen de los puntos críticos del [event storming](../EventStorming/README.md). Los ADR 0009 y 0010 salieron de la implementación. El 0009, al escribir los consumidores: `GaleriaEliminada` tiene que llegar a tres servicios a la vez, y eso cambia cómo se conecta el broker. El 0010, al levantar el sistema: MinIO retiró sus imágenes y hubo que cambiar de producto sin cambiar la decisión de fondo.

Los ADR 0011 y 0012 salieron de revisar el proyecto contra el capítulo 8 de *Microservices: Up and Running*. El 0011 porque un sistema donde todos los servicios comparten lenguaje y base de datos no comprueba su propia independencia; el 0012 porque el entorno de desarrollo había crecido sin decisión explícita y arrastraba `synchronize: true`, imágenes de una sola etapa y un arranque distinto por componente.

El 0011 **matiza** a los ADR 0003 y 0006: no los reemplaza, les acota el alcance. Esos dos decían «todos los servicios»; ahora dicen «todos menos `ms-pagos`».

Todos están en estado **Propuesta**: el equipo debe revisarlos y pasarlos a **Aceptada** (o cambiar la decisión). La implementación actual ya sigue lo que proponen, así que un cambio de decisión implica cambiar código.
