**Épica:** 5 · Comentarios de retoque
**Prioridad:** MVP
**Requerimiento:** RF-16
**Job story:** JS-09

## Historia de usuario

Como **cliente**, quiero **agregar y modificar comentarios de retoque en las fotografías que seleccioné**, para **explicar al fotógrafo los ajustes que deseo en cada imagen**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Comentarios de retoque por fotografía

  Escenario: Agregar un comentario a una fotografía seleccionada
    Dado que tengo una fotografía seleccionada
    Cuando escribo y guardo un comentario de retoque
    Entonces el comentario queda asociado a esa fotografía

  Escenario: Modificar un comentario antes del envío
    Dado que una fotografía seleccionada ya tiene un comentario
    Y todavía no he enviado mi selección
    Cuando modifico y guardo el comentario
    Entonces el sistema conserva la versión actualizada del comentario

  Escenario: Comentario opcional
    Dado que tengo una fotografía seleccionada
    Cuando decido no escribir un comentario
    Entonces puedo conservar la fotografía en mi selección sin instrucciones adicionales

  Escenario: Validar la longitud del comentario
    Dado que estoy escribiendo un comentario de retoque
    Cuando el texto supera la longitud máxima permitida
    Entonces el sistema impide guardarlo
    Y me informa el límite permitido

  Escenario: Asociar comentarios únicamente a fotografías de la galería
    Dado que estoy escribiendo un comentario en mi galería
    Cuando intento asociarlo a una fotografía que pertenece a otra galería
    Entonces el sistema rechaza la operación

  Escenario: Excluir del envío el comentario de una fotografía desmarcada
    Dado que una fotografía seleccionada tiene un comentario
    Cuando desmarco esa fotografía antes de enviar mi selección
    Entonces la fotografía y su comentario dejan de formar parte de la selección que se enviará

  Escenario: Bloquear comentarios después del envío
    Dado que ya envié mi selección final
    Cuando intento agregar o modificar un comentario
    Entonces el sistema no permite realizar el cambio
```
