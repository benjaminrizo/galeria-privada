**Épica:** 2 · Sesiones y galerías
**Prioridad:** MVP
**Requerimiento:** RF-05

## Historia de usuario

Como **fotógrafo**, quiero **editar y eliminar mis sesiones**, para **corregir su información o retirar sesiones que ya no necesito**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Editar y eliminar sesiones fotográficas

  Escenario: Editar los datos de una sesión
    Dado que tengo una sesión creada
    Cuando modifico su nombre o los datos del cliente y guardo los cambios
    Entonces el sistema conserva la información actualizada

  Escenario: Modificar el límite de fotografías
    Dado que tengo una sesión creada
    Cuando establezco un nuevo límite entero mayor que cero y guardo los cambios
    Entonces el sistema actualiza el límite de selección de la galería

  Escenario: Intentar establecer un límite inferior a la selección existente
    Dado que mi cliente tiene 12 fotografías seleccionadas
    Cuando intento reducir el límite de la galería a 10 fotografías
    Entonces el sistema rechaza el cambio
    Y me informa que el nuevo límite no puede ser inferior a la selección actual

  Escenario: Intentar guardar datos inválidos
    Dado que estoy editando una sesión
    Cuando ingreso información obligatoria inválida o dejo vacío un campo requerido
    Entonces el sistema indica los campos que debo corregir
    Y no guarda los cambios

  Escenario: Confirmar eliminación de una sesión
    Dado que tengo una sesión creada
    Cuando selecciono eliminar y confirmo la operación
    Entonces la sesión deja de estar disponible en mis sesiones
    Y el enlace privado asociado deja de permitir el acceso

  Escenario: Cancelar eliminación de una sesión
    Dado que seleccioné la opción para eliminar una sesión
    Cuando cancelo la confirmación
    Entonces la sesión permanece disponible sin cambios

  Escenario: Intentar modificar una sesión de otro fotógrafo
    Dado que existe una sesión que pertenece a otro fotógrafo
    Cuando intento modificarla o eliminarla desde mi cuenta
    Entonces el sistema deniega la operación
```
