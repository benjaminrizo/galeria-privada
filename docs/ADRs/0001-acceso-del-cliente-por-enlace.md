# ADR 0001: Acceso del cliente mediante enlace privado

- **Estado:** Aceptada
- **Fecha:** 22 de octubre de 2026

## Contexto

El cliente necesita entrar a su galería para ver las fotos, seleccionarlas y enviar su selección. Hay que decidir cómo se identifica: con una cuenta (registro y login) o con un enlace privado que le entrega el fotógrafo.

## Decisión

El cliente accede a su galería mediante un **enlace privado y único**, sin registrarse ni iniciar sesión. El enlace contiene un código aleatorio difícil de adivinar. Solo el fotógrafo tiene cuenta.

## Consecuencias

**A favor**
- El cliente no tiene que crear cuenta ni recordar contraseñas.
- Se reduce el trabajo del equipo: no hay registro, login ni recuperación de contraseña para clientes.

**En contra**
- La seguridad depende de que el enlace no se comparta ni se filtre.
- No hay forma de saber con certeza quién abrió el enlace.

**Medidas**
- El código del enlace será aleatorio y largo.
- El fotógrafo podrá revocar o regenerar el enlace (si el tiempo lo permite).
- Opcionalmente, se podrá añadir un PIN más adelante.

## Alternativas consideradas

- **Cuentas de cliente con login:** más seguro y con identidad clara, pero agrega fricción al cliente y bastante trabajo extra. Se descartó por el tiempo disponible.
