**Épica:** 1 · Acceso
**Prioridad:** MVP
**Requerimiento:** RF-02
**Job story:** JS-01

## Historia de usuario

Como **fotógrafo**, quiero **que cada galería tenga un enlace privado, único y que pueda revocar o regenerar**, para **compartirla con mi cliente y controlar quién puede acceder**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Generación y administración del enlace privado de una galería

  Escenario: Generación automática del enlace
    Dado que creo una nueva galería
    Cuando el sistema termina de crearla
    Entonces genera un enlace privado y único para esa galería
    Y el enlace queda asociado únicamente a esa galería

  Escenario: Enlaces diferentes para galerías diferentes
    Dado que tengo dos galerías distintas
    Cuando consulto sus enlaces privados
    Entonces cada galería tiene un enlace diferente

  Escenario: Copiar enlace privado
    Dado que tengo una galería con un enlace generado
    Cuando selecciono la opción para copiar el enlace
    Entonces el enlace queda disponible en el portapapeles

  Escenario: Revocar enlace
    Dado que tengo una galería con un enlace activo
    Cuando revoco ese enlace
    Entonces el enlace deja de permitir el acceso a la galería
    Y la galería y sus fotografías se conservan

  Escenario: Regenerar enlace
    Dado que revoqué el enlace de una galería
    Cuando solicito generar un nuevo enlace
    Entonces el sistema genera un enlace diferente al anterior
    Y el nuevo enlace queda habilitado para la galería
    Y el enlace anterior continúa revocado

  Escenario: Enlace difícil de adivinar
    Dado que el sistema genera un enlace privado
    Cuando se crea el identificador del enlace
    Entonces utiliza un valor no secuencial y suficientemente impredecible para evitar que terceros puedan adivinar otros enlaces
```
