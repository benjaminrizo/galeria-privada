**Épica:** 6 · Notificaciones
**Prioridad:** Después
**Requerimiento:** RF-19
**Job story:** JS-04

## Historia de usuario

Como **fotógrafo**, quiero **recibir un correo cuando mi cliente envíe su selección** para **empezar a editar sin revisar la galería constantemente**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Correo al fotógrafo cuando el cliente envía su selección

  Escenario: Correo al enviar la selección
    Dado que el cliente envía su selección final
    Cuando el sistema la registra
    Entonces recibo un correo que indica la sesión y el cliente
```
