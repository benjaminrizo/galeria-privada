**Épica:** 2 · Sesiones y galerías
**Prioridad:** MVP
**Requerimiento:** RF-04
**Job story:** JS-01

## Historia de usuario

Como **fotógrafo**, quiero **crear una sesión con el nombre, los datos del cliente y el límite de fotografías incluidas**, para **organizar el trabajo y definir cuántas fotografías podrá seleccionar mi cliente**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Crear una sesión fotográfica

  Escenario: Creación exitosa de una sesión
    Dado que inicié sesión en la plataforma
    Cuando ingreso el nombre de la sesión, el nombre del cliente, un correo válido y un límite entero mayor que cero
    Entonces el sistema crea la sesión
    Y la galería queda inicialmente en estado borrador
    Y la sesión queda asociada a mi cuenta
    Y se genera un enlace privado para la galería

  Escenario: Nombre de sesión obligatorio
    Dado que estoy creando una sesión
    Cuando dejo vacío el nombre de la sesión
    Entonces el sistema indica que el campo es obligatorio
    Y no crea la sesión

  Escenario: Correo del cliente inválido
    Dado que estoy creando una sesión
    Cuando ingreso un correo electrónico con formato inválido
    Entonces el sistema indica que debo corregir el correo
    Y no crea la sesión

  Escenario: Límite inválido
    Dado que estoy creando una sesión
    Cuando ingreso un límite igual a cero, negativo o que no sea un número entero
    Entonces el sistema indica que el límite debe ser un entero mayor que cero
    Y no crea la sesión

  Escenario: Acceso a la sesión creada
    Dado que la sesión fue creada correctamente
    Cuando consulto mis sesiones
    Entonces puedo identificar la nueva sesión en mi listado
```
