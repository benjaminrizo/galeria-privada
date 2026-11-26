**Épica:** 8 · Fundamentos técnicos
**Prioridad:** Después
**Referencias:** RNF-08, ADR 0002

## Historia técnica

Integrar RabbitMQ o Redis para los procesos secundarios (miniaturas, correos).

## Criterios de aceptación

- [ ] El broker se levanta con docker-compose.
- [ ] Existe al menos un evento publicado y consumido entre servicios.
- [ ] La elección del broker queda documentada en un ADR.
