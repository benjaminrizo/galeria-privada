**Épica:** 7 · Fotos extra con pago simulado
**Prioridad:** Extra
**Requerimiento:** RF-20
**Job story:** JS-11

## Historia de usuario

Como **fotógrafo**, quiero **definir el precio por fotografía adicional de una sesión**, para **ofrecer a mi cliente la posibilidad de seleccionar más fotografías que las incluidas inicialmente**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Definir el precio de las fotografías adicionales

  Escenario: Definir un precio válido
    Dado que estoy configurando una sesión
    Cuando ingreso un precio por fotografía adicional mayor que cero
    Entonces el sistema guarda el precio asociado a la sesión

  Escenario: Rechazar un precio igual a cero o negativo
    Dado que estoy configurando el precio de las fotografías adicionales
    Cuando ingreso un valor igual a cero o negativo
    Entonces el sistema rechaza el valor
    Y me informa que el precio debe ser mayor que cero

  Escenario: Rechazar un precio con formato inválido
    Dado que estoy configurando el precio de las fotografías adicionales
    Cuando ingreso un valor que no corresponde a un importe válido
    Entonces el sistema rechaza el valor
    Y conserva el último precio válido

  Escenario: Mostrar el precio con su moneda
    Dado que definí un precio válido para las fotografías adicionales
    Cuando consulto la configuración o la opción de compra
    Entonces el sistema muestra el importe junto con la moneda configurada para la plataforma
    Y utiliza la precisión monetaria definida para los importes

  Escenario: Mantener el precio de un pedido confirmado
    Dado que existe un pedido de fotografías adicionales confirmado
    Cuando modifico el precio de la sesión para futuros pedidos
    Entonces el precio registrado en el pedido confirmado permanece sin cambios
```
