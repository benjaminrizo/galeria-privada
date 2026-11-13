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

Los ADR 0003 a 0008 salen de los puntos críticos del [event storming](../EventStorming/README.md). Los ADR 0009 y 0010 salieron de la implementación. El 0009, al escribir los consumidores: `GaleriaEliminada` tiene que llegar a tres servicios a la vez, y eso cambia cómo se conecta el broker. El 0010, al levantar el sistema: MinIO retiró sus imágenes y hubo que cambiar de producto sin cambiar la decisión de fondo.

Todos están en estado **Propuesta**: el equipo debe revisarlos y pasarlos a **Aceptada** (o cambiar la decisión). La implementación actual ya sigue lo que proponen, así que un cambio de decisión implica cambiar código.
