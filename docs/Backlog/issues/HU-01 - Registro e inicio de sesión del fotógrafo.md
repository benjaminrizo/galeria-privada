**Épica:** 1 · Acceso
**Prioridad:** MVP
**Requerimiento:** RF-01

## Historia de usuario

Como **fotógrafo**, quiero **registrarme, iniciar sesión y cerrar mi sesión**, para **administrar mis sesiones y galerías de forma privada**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Registro e inicio de sesión del fotógrafo

  Escenario: Registro exitoso
    Dado que no tengo una cuenta
    Cuando completo mi nombre, un correo electrónico válido y una contraseña que cumple la política de seguridad
    Entonces el sistema crea mi cuenta
    Y puedo iniciar sesión con mis credenciales

  Escenario: Normalización del correo electrónico
    Dado que registro una cuenta con un correo electrónico
    Cuando ingreso el mismo correo con diferencias de mayúsculas, minúsculas o espacios al intentar registrarme nuevamente
    Entonces el sistema reconoce que el correo ya está registrado
    Y no crea una segunda cuenta

  Escenario: Correo electrónico ya registrado
    Dado que existe una cuenta con el correo electrónico que intento registrar
    Cuando envío el formulario de registro
    Entonces el sistema informa que el correo ya está registrado
    Y no crea una segunda cuenta

  Escenario: Datos de registro inválidos
    Dado que estoy completando el formulario de registro
    Cuando ingreso un correo electrónico con formato inválido o una contraseña que no cumple la política de seguridad
    Entonces el sistema indica los campos que debo corregir
    Y no crea la cuenta

  Escenario: Inicio de sesión exitoso
    Dado que tengo una cuenta registrada
    Cuando ingreso mi correo electrónico y contraseña correctos
    Entonces accedo a mi panel de sesiones

  Escenario: Credenciales incorrectas
    Dado que estoy en el formulario de inicio de sesión
    Cuando ingreso credenciales incorrectas
    Entonces el sistema muestra un mensaje genérico de credenciales inválidas
    Y no revela si el correo electrónico o la contraseña fueron incorrectos

  Escenario: Cierre de sesión
    Dado que tengo una sesión autenticada
    Cuando selecciono la opción para cerrar sesión
    Entonces el sistema finaliza mi sesión
    Y debo volver a autenticarme para acceder a las funcionalidades privadas
```
