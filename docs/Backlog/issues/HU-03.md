**Épica:** 1 · Acceso
**Prioridad:** MVP
**Requerimiento:** RF-03
**Job story:** JS-06

## Historia de usuario

Como **cliente**, quiero **abrir el enlace privado de mi galería sin crear una cuenta**, para **visualizar mis fotografías de forma sencilla desde mis dispositivos**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Acceso del cliente mediante un enlace privado, sin cuenta

  Escenario: Acceso a una galería publicada
    Dado que el fotógrafo publicó mi galería
    Y el enlace que recibí es válido y está activo
    Cuando abro el enlace
    Entonces puedo visualizar las fotografías disponibles
    Y no se me solicita registrarme ni iniciar sesión

  Escenario: Acceso mediante un enlace inexistente o inválido
    Dado que abro un enlace que no corresponde a ninguna galería
    Cuando el sistema valida el enlace
    Entonces el acceso es rechazado
    Y se muestra un mensaje indicando que el enlace no es válido o no está disponible

  Escenario: Acceso a una galería en borrador
    Dado que la galería asociada al enlace todavía está en estado borrador
    Cuando intento abrir el enlace
    Entonces el sistema no permite visualizar la galería

  Escenario: Acceso mediante un enlace revocado
    Dado que el fotógrafo revocó el enlace de mi galería
    Cuando intento acceder utilizando ese enlace
    Entonces el sistema rechaza el acceso

  Escenario: Acceso a una galería eliminada
    Dado que la galería asociada al enlace fue eliminada
    Cuando intento abrir el enlace
    Entonces el sistema no permite acceder a su contenido

  Escenario: Aislamiento entre galerías
    Dado que tengo un enlace válido para una galería
    Cuando accedo mediante ese enlace
    Entonces solo puedo visualizar el contenido de la galería asociada
    Y no puedo consultar información de otras galerías
```
