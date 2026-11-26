**Épica:** 5 · Comentarios de retoque
**Prioridad:** MVP
**Requerimiento:** RF-17
**Job story:** JS-03

## Historia de usuario

Como **fotógrafo**, quiero **visualizar los comentarios de retoque asociados a cada fotografía seleccionada**, para **seguir las indicaciones del cliente al preparar las imágenes**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Visualización de comentarios de retoque por el fotógrafo

  Escenario: Ver un comentario junto a su fotografía
    Dado que mi cliente envió una selección con comentarios
    Cuando consulto la selección enviada
    Entonces cada comentario aparece asociado a su fotografía correspondiente

  Escenario: Identificar fotografías sin comentarios
    Dado que mi cliente envió fotografías con y sin comentarios
    Cuando consulto la selección
    Entonces puedo identificar las fotografías que no tienen instrucciones adicionales
    Y puedo visualizar la selección completa

  Escenario: Consultar comentarios de una selección enviada
    Dado que mi cliente envió su selección final
    Cuando abro el detalle de la selección
    Entonces puedo consultar los comentarios registrados para cada fotografía seleccionada

  Escenario: Impedir la consulta de comentarios de otra galería
    Dado que otro fotógrafo tiene una galería con comentarios de retoque
    Cuando intento consultar esos comentarios desde mi cuenta
    Entonces el sistema deniega el acceso
```
