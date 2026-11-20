**Épica:** 4 · Selección
**Prioridad:** MVP
**Requerimiento:** RF-15
**Job story:** JS-03

## Historia de usuario

Como **fotógrafo**, quiero **consultar la selección que envió mi cliente y sus datos principales**, para **saber qué fotografías debo preparar y a qué sesión corresponde el envío**.

## Criterios de aceptación

```gherkin
# language: es
Característica: El fotógrafo consulta la selección enviada

  Escenario: Visualizar las fotografías seleccionadas
    Dado que mi cliente envió la selección de una galería
    Cuando abro la sesión correspondiente
    Entonces veo la lista de fotografías seleccionadas

  Escenario: Consultar el resumen del envío
    Dado que mi cliente envió su selección
    Cuando consulto el detalle del envío
    Entonces veo el nombre de la sesión
    Y veo los datos del cliente
    Y veo la cantidad de fotografías seleccionadas
    Y veo la fecha y hora del envío

  Escenario: Consultar únicamente mis galerías
    Dado que otro fotógrafo tiene una sesión con una selección enviada
    Cuando intento abrir esa sesión desde mi cuenta
    Entonces el sistema deniega el acceso

  Escenario: Consultar una sesión sin selección enviada
    Dado que una sesión todavía no tiene una selección enviada
    Cuando consulto su detalle
    Entonces el sistema no la presenta como una selección final recibida
```
