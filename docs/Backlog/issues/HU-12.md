**Épica:** 4 · Selección
**Prioridad:** MVP
**Requerimiento:** RF-13
**Job story:** JS-08

## Historia de usuario

Como **cliente**, quiero **que mi selección se guarde automáticamente**, para **retomarla más tarde sin perder las fotografías que ya marqué**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Guardar la selección para continuar después

  Escenario: Conservar la selección al cerrar la página
    Dado que marqué varias fotografías en mi galería
    Cuando cierro la página y vuelvo a abrir el mismo enlace
    Entonces las fotografías que seleccioné continúan marcadas
    Y el contador conserva la cantidad seleccionada

  Escenario: Conservar los cambios al desmarcar fotografías
    Dado que tengo varias fotografías seleccionadas
    Cuando desmarco una fotografía y vuelvo a consultar la galería
    Entonces la fotografía continúa desmarcada
    Y el contador refleja el cambio

  Escenario: Recuperar la selección desde otro dispositivo
    Dado que seleccioné fotografías desde un dispositivo
    Cuando abro el mismo enlace privado desde otro dispositivo
    Entonces visualizo la selección guardada anteriormente

  Escenario: Guardar la selección sin crear una cuenta
    Dado que accedo a mi galería mediante un enlace privado válido
    Cuando marco o desmarco fotografías
    Entonces el sistema conserva los cambios asociados a esa galería
    Y no me solicita crear una cuenta
```
