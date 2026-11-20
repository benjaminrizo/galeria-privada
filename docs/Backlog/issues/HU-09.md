**Épica:** 3 · Fotos
**Prioridad:** MVP
**Requerimiento:** RF-10, RNF-04
**Job story:** JS-05

## Historia de usuario

Como **fotógrafo**, quiero **que el cliente visualice únicamente versiones reducidas de mis fotografías**, para **proteger los archivos originales que entrego como parte de mi trabajo**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Acceso protegido a las fotografías de una galería

  Escenario: Visualizar fotografías de la galería
    Dado que un cliente accede a una galería publicada mediante un enlace válido
    Cuando se cargan las imágenes de la galería
    Entonces el sistema entrega únicamente las versiones reducidas destinadas a visualización
    Y no entrega los archivos originales

  Escenario: Intentar acceder directamente a un archivo original
    Dado que una persona conoce o intenta construir la ruta de un archivo original
    Cuando solicita el archivo sin autorización válida
    Entonces el sistema deniega el acceso

  Escenario: Solicitar una fotografía de otra galería
    Dado que un cliente tiene acceso a una galería
    Cuando intenta solicitar una fotografía que pertenece a otra galería
    Entonces el sistema deniega el acceso al archivo

  Escenario: Acceder mediante un enlace revocado
    Dado que el enlace privado de una galería fue revocado
    Cuando se intenta solicitar una fotografía utilizando ese enlace
    Entonces el sistema deniega el acceso a la fotografía
```
