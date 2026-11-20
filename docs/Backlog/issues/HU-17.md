**Épica:** 6 · Notificaciones
**Prioridad:** Después
**Requerimiento:** RF-18

## Historia de usuario

Como **cliente**, quiero **recibir un correo cuando mi galería esté publicada** para **enterarme de que ya puedo ver mis fotos**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Correo al cliente cuando se publica su galería

  Escenario: Correo al publicar
    Dado que el fotógrafo publica mi galería
    Cuando termina la publicación
    Entonces recibo un correo con el enlace de mi galería
```
