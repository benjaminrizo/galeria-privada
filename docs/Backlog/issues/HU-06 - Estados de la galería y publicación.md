**Épica:** 2 · Sesiones y galerías
**Prioridad:** MVP
**Requerimiento:** RF-06, RF-07
**Job story:** JS-01

## Historia de usuario

Como **fotógrafo**, quiero **controlar cuándo una galería está en borrador, publicada o tiene una selección enviada**, para **decidir cuándo puede acceder el cliente y conocer el estado del proceso**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Estados de la galería y publicación

  Escenario: Crear una galería en borrador
    Dado que creo una nueva sesión
    Cuando el sistema crea su galería
    Entonces la galería queda en estado borrador
    Y el cliente todavía no puede acceder a su contenido

  Escenario: Publicar una galería con fotografías disponibles
    Dado que mi galería está en estado borrador
    Y tiene al menos una fotografía disponible para visualizar
    Cuando selecciono la opción para publicar
    Entonces la galería cambia al estado publicada
    Y el cliente puede acceder mediante su enlace privado activo

  Escenario: Intentar publicar una galería sin fotografías
    Dado que mi galería está en estado borrador y no contiene fotografías
    Cuando intento publicarla
    Entonces el sistema rechaza la publicación
    Y me indica que debo cargar al menos una fotografía disponible

  Escenario: Intentar publicar sin fotografías procesadas
    Dado que mi galería contiene fotografías que todavía están procesándose
    Y no tiene fotografías disponibles para visualizar
    Cuando intento publicarla
    Entonces el sistema rechaza la publicación
    Y mantiene la galería en estado borrador

  Escenario: Consultar una galería publicada
    Dado que mi galería está publicada
    Cuando consulto su estado
    Entonces el sistema la identifica como publicada

  Escenario: Registrar el envío de la selección
    Dado que mi galería está publicada
    Cuando el cliente envía correctamente su selección final
    Entonces la galería cambia al estado selección enviada
    Y la selección queda bloqueada para nuevas modificaciones
```
