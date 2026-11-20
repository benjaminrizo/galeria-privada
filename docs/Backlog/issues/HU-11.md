**Épica:** 4 · Selección
**Prioridad:** MVP
**Requerimiento:** RF-12
**Job story:** JS-07

## Historia de usuario

Como **cliente**, quiero **visualizar cuántas fotografías he seleccionado y cuántas puedo seleccionar todavía**, para **respetar el límite definido para mi sesión**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Contador y control del límite de fotografías

  Escenario: Visualizar el contador
    Dado que mi paquete incluye 20 fotografías y he seleccionado 8
    Cuando consulto mi galería
    Entonces veo que llevo seleccionadas 8 de 20 fotografías
    Y puedo identificar cuántos cupos me quedan disponibles

  Escenario: Alcanzar el límite de selección
    Dado que he seleccionado todas las fotografías permitidas por mi paquete
    Cuando intento seleccionar una fotografía adicional
    Entonces el sistema no permite agregarla
    Y me informa que alcancé el límite de selección

  Escenario: Recuperar un cupo al desmarcar una fotografía
    Dado que alcancé el límite de selección
    Cuando desmarco una de las fotografías seleccionadas
    Entonces el contador disminuye en una fotografía
    Y puedo seleccionar otra fotografía disponible

  Escenario: Validar el límite al registrar la selección
    Dado que intento agregar una fotografía a mi selección
    Cuando el sistema procesa la operación
    Entonces valida que la cantidad total no supere el límite permitido
    Y solo registra la selección si cumple esa condición

  Escenario: Evitar superar el límite con solicitudes simultáneas
    Dado que queda un solo cupo disponible
    Cuando se reciben solicitudes simultáneas para seleccionar fotografías
    Entonces el sistema registra como máximo una selección adicional
    Y la cantidad seleccionada nunca supera el límite
```
