**Épica:** 8 · Fundamentos técnicos
**Prioridad:** MVP
**Referencias:** ADR 0012

## Historia técnica

Cada repositorio ofrece los mismos comandos, sin importar en qué lenguaje esté escrito, para que quien cambia de servicio no tenga que aprender comandos nuevos.

## Criterios de aceptación

- [ ] Cada repositorio tiene un `Makefile` con los targets `start`, `stop`, `build`, `test`, `lint`, `clean`, `logs` y `migrate`.
- [ ] Los mismos targets funcionan en el servicio escrito en Go y en los escritos en TypeScript.
- [ ] `make help` lista los comandos disponibles.
- [ ] El repositorio sombrilla tiene además targets para el sistema completo.
