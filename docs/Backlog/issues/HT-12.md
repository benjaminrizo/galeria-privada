**Épica:** 8 · Fundamentos técnicos
**Prioridad:** MVP
**Referencias:** ADR 0002

## Historia técnica

Validar el límite al marcar fotos coordinando `ms-galerias` (límite) y `ms-seleccion` (fotos elegidas) desde el gateway.

## Criterios de aceptación

- [ ] El gateway consulta el límite a `ms-galerias` y las fotos elegidas a `ms-seleccion`.
- [ ] `ms-seleccion` no llama directamente a `ms-galerias`.
- [ ] El flujo queda documentado en un diagrama de secuencia.
