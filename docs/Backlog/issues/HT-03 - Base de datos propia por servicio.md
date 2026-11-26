**Épica:** 8 · Fundamentos técnicos
**Prioridad:** MVP
**Referencias:** RNF-15

## Historia técnica

Cada microservicio tiene su propia base de datos y ningún otro servicio accede a ella.

## Criterios de aceptación

- [ ] Cada servicio define su esquema y sus migraciones.
- [ ] Ningún servicio lee tablas de otro.
- [ ] El motor de base de datos elegido queda documentado en un ADR.
