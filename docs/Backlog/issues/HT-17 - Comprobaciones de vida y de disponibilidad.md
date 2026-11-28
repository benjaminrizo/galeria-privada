**Épica:** 8 · Fundamentos técnicos
**Prioridad:** MVP
**Referencias:** ADR 0012

## Historia técnica

Cada servicio dice por separado si está vivo y si además puede trabajar, porque la reacción correcta es distinta en cada caso: reiniciarlo o dejar de mandarle tráfico.

## Criterios de aceptación

- [ ] Cada servicio responde en `/ping` mientras el proceso esté vivo.
- [ ] Cada servicio responde 200 en `/health` solo si además alcanza su base de datos.
- [ ] `/health` devuelve 503 cuando el servicio está vivo pero no puede trabajar.
- [ ] El gateway comprueba en su `/health` que alcanza a los servicios del MVP.
- [ ] Un fallo en un servicio de prioridad posterior no deja al gateway como no disponible.
