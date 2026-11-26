**Épica:** 8 · Fundamentos técnicos
**Prioridad:** MVP
**Referencias:** RNF-05, RNF-14, ADR 0002

## Historia técnica

Implementar el gateway como único punto de entrada, que enruta a los servicios y valida la sesión del fotógrafo.

## Criterios de aceptación

- [ ] El frontend solo habla con el gateway.
- [ ] Las rutas del fotógrafo exigen sesión válida; las del cliente solo exigen el código del enlace.
- [ ] Los microservicios no se llaman entre sí.
