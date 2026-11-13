# ADR 0002: El API Gateway orquesta y los microservicios no se llaman entre sí

- **Estado:** Aceptada
- **Fecha:** 22 de octubre de 2026

## Contexto

El sistema se divide en varios microservicios (autenticación, galerías, medios, selección, etc.). Algunos procesos necesitan datos de más de un servicio. Por ejemplo, para validar una selección hay que conocer el límite de fotos de la galería (que vive en `ms-galerias`) y las fotos ya elegidas (que viven en `ms-seleccion`).

Si cada servicio llama directamente a los demás, quedan acoplados: un cambio o una caída en uno afecta a todos.

## Decisión

Los microservicios **no se llaman directamente entre sí**. Las operaciones que involucran varios servicios las orquesta el **API Gateway**, que consulta a cada servicio y combina los resultados. Cuando no sea posible orquestar desde el gateway (por ejemplo, tareas secundarias como enviar un correo), se usarán **eventos asíncronos**.

## Consecuencias

**A favor**
- Los servicios quedan independientes y se pueden cambiar o escalar por separado.
- Si un servicio falla, los demás siguen funcionando.
- Es más fácil entender y probar cada servicio por sí solo.

**En contra**
- El gateway acumula lógica de coordinación y puede volverse complejo.
- Algunas operaciones requieren más de una llamada desde el gateway.
- Los eventos agregan una pieza más (un broker de mensajes) si llegan a usarse.

## Alternativas consideradas

- **Llamadas directas entre microservicios (REST):** más simple al principio, pero genera dependencias entre servicios y fallos en cadena. Se descartó porque va contra la independencia que buscan los microservicios.
