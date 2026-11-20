**Épica:** 7 · Fotos extra con pago simulado
**Prioridad:** Extra
**Requerimiento:** RF-21, RF-22
**Job story:** JS-11

## Historia de usuario

Como **cliente**, quiero **solicitar fotografías adicionales y confirmar el pedido mediante un pago simulado**, para **ampliar mi selección sin salir de la galería**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Solicitud de fotografías adicionales con pago simulado

  Escenario: Consultar la opción de fotografías adicionales
    Dado que mi selección alcanzó el límite incluido en el paquete
    Y el fotógrafo configuró un precio por fotografía adicional
    Cuando consulto las opciones disponibles
    Entonces puedo solicitar fotografías adicionales
    Y puedo visualizar el precio unitario

  Escenario: Calcular el total del pedido
    Dado que está disponible la opción de fotografías adicionales
    Cuando indico una cantidad entera mayor que cero
    Entonces el sistema calcula el total según la cantidad y el precio unitario
    Y muestra el resumen del pedido antes de confirmarlo

  Escenario: Confirmar un pedido mediante pago simulado
    Dado que revisé el resumen de mi pedido de fotografías adicionales
    Cuando confirmo el pedido mediante el flujo de pago simulado
    Entonces el sistema registra el pedido como confirmado
    Y no realiza un cobro real

  Escenario: Conservar el importe y la moneda del pedido
    Dado que estoy revisando el resumen de un pedido de fotografías adicionales
    Cuando se confirma el pedido
    Entonces el sistema conserva la cantidad, el precio unitario, el total y la moneda aplicados en ese momento

  Escenario: Aumentar el límite después de confirmar el pedido
    Dado que confirmé correctamente un pedido de fotografías adicionales
    Cuando el sistema registra la confirmación
    Entonces aumenta el límite de selección por la cantidad de fotografías adicionales adquiridas

  Escenario: No aumentar el límite si el pedido no se confirma
    Dado que inicié una solicitud de fotografías adicionales
    Cuando el pedido no se confirma
    Entonces el sistema no aumenta el límite de selección

  Escenario: Evitar aplicar dos veces el mismo pedido
    Dado que un pedido de fotografías adicionales ya fue confirmado
    Cuando se procesa nuevamente la misma confirmación
    Entonces el sistema no duplica el pedido
    Y no vuelve a aumentar el límite de selección

  Escenario: No solicitar datos de tarjetas bancarias
    Dado que estoy confirmando un pedido mediante el pago simulado
    Cuando completo el proceso
    Entonces el sistema no solicita ni almacena datos de tarjetas bancarias
```
