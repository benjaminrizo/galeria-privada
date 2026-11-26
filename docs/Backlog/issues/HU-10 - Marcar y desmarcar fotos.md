**Épica:** 4 · Selección
**Prioridad:** MVP
**Requerimiento:** RF-11
**Job story:** JS-07

## Historia de usuario

Como **cliente**, quiero **marcar y desmarcar fotografías de mi galería**, para **construir la selección de imágenes que deseo recibir**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Marcar y desmarcar fotografías

  Escenario: Marcar una fotografía disponible
    Dado que estoy en mi galería y todavía tengo cupos disponibles
    Y la fotografía está disponible para visualizar
    Cuando marco la fotografía
    Entonces queda incluida en mi selección

  Escenario: Desmarcar una fotografía seleccionada
    Dado que tengo una fotografía seleccionada
    Cuando la desmarco
    Entonces deja de formar parte de mi selección
    Y se actualiza el contador de fotografías seleccionadas

  Escenario: Evitar duplicar una fotografía en la selección
    Dado que una fotografía ya forma parte de mi selección
    Cuando intento marcarla nuevamente
    Entonces la fotografía permanece una sola vez en la selección
    Y el contador no aumenta

  Escenario: Intentar seleccionar una fotografía de otra galería
    Dado que estoy visualizando una galería
    Cuando intento incluir una fotografía que pertenece a otra galería
    Entonces el sistema rechaza la operación

  Escenario: Intentar seleccionar una fotografía no disponible
    Dado que una fotografía todavía está procesándose o no se encuentra disponible
    Cuando intento seleccionarla
    Entonces el sistema rechaza la operación
    Y la fotografía no se agrega a mi selección

  Escenario: Modificar la selección después del envío
    Dado que ya envié mi selección final
    Cuando intento marcar o desmarcar una fotografía
    Entonces el sistema no permite modificar la selección
```
