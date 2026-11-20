**Épica:** 4 · Selección
**Prioridad:** MVP
**Requerimiento:** RF-14
**Job story:** JS-10

## Historia de usuario

Como **cliente**, quiero **revisar y enviar mi selección final de fotografías**, para **confirmar al fotógrafo cuáles imágenes debe preparar**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Enviar la selección final

  Escenario: Visualizar el resumen antes del envío
    Dado que tengo fotografías seleccionadas
    Cuando ingreso al resumen de mi selección
    Entonces puedo revisar las fotografías que voy a enviar
    Y puedo identificar la cantidad total seleccionada

  Escenario: Envío exitoso de la selección
    Dado que tengo una selección válida y no vacía
    Cuando confirmo el envío
    Entonces el sistema registra la selección como enviada
    Y registra la fecha y hora del envío
    Y la galería cambia al estado selección enviada
    Y recibo una confirmación del envío

  Escenario: Confirmar antes de enviar
    Dado que estoy revisando mi selección final
    Cuando selecciono la opción para enviarla
    Entonces el sistema solicita confirmar la operación antes de registrarla

  Escenario: Intentar enviar una selección vacía
    Dado que no tengo fotografías seleccionadas
    Cuando intento enviar mi selección
    Entonces el sistema rechaza el envío
    Y me indica que debo seleccionar al menos una fotografía

  Escenario: Intentar enviar una selección que supera el límite
    Dado que mi selección supera el límite permitido
    Cuando intento enviarla
    Entonces el sistema rechaza el envío
    Y me informa que debo ajustarla al límite de mi paquete

  Escenario: Bloquear cambios después del envío
    Dado que mi selección fue enviada correctamente
    Cuando intento marcar o desmarcar fotografías
    Entonces el sistema no permite modificar la selección enviada

  Escenario: Evitar registrar dos veces el mismo envío
    Dado que mi selección ya fue enviada correctamente
    Cuando se repite la solicitud de envío
    Entonces el sistema no crea un segundo envío
    Y conserva el estado de la selección original
```
