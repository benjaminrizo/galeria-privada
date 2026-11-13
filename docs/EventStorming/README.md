# Event Storming – Galería Privada

Esta carpeta documenta, paso a paso, el proceso de event storming del proyecto. Cada archivo es un paso y alimenta al siguiente.

| Paso | Archivo | Qué se obtiene |
|---|---|---|
| 1 | [Eventos de dominio](01-eventos-de-dominio.md) | Línea de tiempo de lo que ocurre en el negocio |
| 2 | [Comandos, políticas y read models](02-comandos-politicas-y-read-models.md) | Qué dispara cada evento y qué reglas reaccionan a él |
| 3 | [Agregados](03-agregados.md) | Límites de consistencia e invariantes |
| 4 | [Bounded contexts](04-bounded-contexts.md) | Contextos delimitados y mapa de contextos |
| 5 | [Microservicios candidatos](05-microservicios-candidatos.md) | Qué servicios salen de los contextos y cuáles se descartan |
| 6 | [Modelado de datos](06-modelado-de-datos.md) | Datos propios de cada servicio |
| 7 | [Patrones de interacción](07-patrones-de-interaccion.md) | Cómo colaboran los servicios en cada flujo |

Los diagramas están en [`diagramas/`](diagramas/) en formato PlantUML (`.puml`), con su imagen `.png` para verlos directamente en GitHub.

## Leyenda de colores

Se usa la notación habitual de event storming. Si el equipo hace el taller en un tablero (Miro, FigJam), estos son los colores de los post-its:

| Elemento | Color | Se escribe como |
|---|---|---|
| Evento de dominio | Naranja | Verbo en pasado: *Galería Publicada* |
| Comando | Azul | Verbo en imperativo: *Publicar Galería* |
| Actor | Amarillo claro | *Fotógrafo*, *Cliente* |
| Política | Lila | "Cuando [evento], entonces [comando]" |
| Read model | Verde | Información que alguien necesita ver |
| Agregado | Amarillo | Sustantivo: *Galería*, *Selección* |
| Sistema externo | Rosa | *Servicio de correo* |
| Punto crítico (hotspot) | Rojo | Duda o conflicto por resolver |

Si el equipo hace el taller en un tablero, conviene guardar capturas en una carpeta `imagenes/` dentro de esta y enlazarlas desde cada paso.

## Lenguaje ubicuo (glosario)

| Término | Significado en este proyecto |
|---|---|
| **Galería** | La sesión fotográfica de un cliente y el espacio privado donde él ve y elige sus fotos. Sesión y galería son el mismo concepto. |
| **Inicio de sesión** | Autenticación del fotógrafo. Se evita decir solo "sesión" para no confundirlo con la sesión fotográfica. |
| **Enlace de acceso** | URL privada con un código aleatorio con la que el cliente entra a su galería (ADR 0001). |
| **Límite** | Número de fotos que el cliente puede elegir. El límite vigente es el incluido más el extra comprado. |
| **Selección** | Conjunto de fotos que el cliente marca en una galería, con sus comentarios de retoque. |
| **Miniatura** | Versión reducida de una foto; es lo único que ve el cliente. |
| **Original** | Archivo completo subido por el fotógrafo; nunca se muestra al cliente. |

## Decisiones que salen de este proceso (ADRs)

Estas decisiones aparecieron como puntos críticos en los pasos y quedaron registradas como ADR en estado Propuesta, en [`../ADRs/`](../ADRs/):

| ADR propuesto | Tema | Dónde surge |
|---|---|---|
| 0003 | Motor de base de datos | Paso 6 |
| 0004 | Broker de mensajes: RabbitMQ o Redis | Paso 7 |
| 0005 | Almacenamiento de originales y miniaturas | Paso 6 |
| 0006 | Backend: Express o NestJS | Paso 5 |
| 0007 | Quién publica los eventos de integración | Paso 7 |
| 0008 | Borrado en cascada y consistencia eventual | Pasos 3 y 7 |
