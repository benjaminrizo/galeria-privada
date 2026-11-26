**Épica:** 3 · Fotos
**Prioridad:** MVP
**Requerimiento:** RF-08
**Job story:** JS-02

## Historia de usuario

Como **fotógrafo**, quiero **cargar varias fotografías a la vez en una sesión**, para **preparar la galería sin tener que subir cada archivo individualmente**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Carga múltiple de fotografías en una sesión

  Escenario: Carga múltiple exitosa
    Dado que estoy en una sesión que me pertenece
    Cuando selecciono varias fotografías con formatos y tamaños permitidos y las cargo
    Entonces el sistema registra las fotografías en esa sesión
    Y puedo consultar el resultado de la carga

  Escenario: Rechazar un formato no permitido
    Dado que selecciono un archivo cuyo formato no está admitido
    Cuando intento cargarlo
    Entonces el sistema rechaza ese archivo
    Y muestra el motivo del rechazo
    Y continúa procesando los demás archivos válidos

  Escenario: Rechazar un archivo que supera el tamaño permitido
    Dado que selecciono una fotografía cuyo tamaño supera el máximo configurado
    Cuando intento cargarla
    Entonces el sistema rechaza ese archivo
    Y muestra el motivo del rechazo

  Escenario: Resultado individual de la carga
    Dado que seleccioné varias fotografías
    Y algunas cumplen las reglas de carga y otras no
    Cuando finaliza la operación
    Entonces el sistema informa cuáles archivos se cargaron y cuáles fueron rechazados
    Y el rechazo de un archivo no afecta la carga de los demás archivos válidos

  Escenario: Evitar duplicados por reintento
    Dado que una fotografía ya fue recibida correctamente por el sistema
    Cuando se reintenta la misma operación de carga
    Entonces el sistema evita crear una segunda fotografía idéntica como resultado del reintento

  Escenario: Impedir la carga en una sesión ajena
    Dado que estoy autenticado como fotógrafo
    Y la sesión pertenece a otro fotógrafo
    Cuando intento cargar fotografías en esa sesión
    Entonces el sistema deniega la operación
```
