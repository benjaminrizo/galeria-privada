**Épica:** 8 · Fundamentos técnicos
**Prioridad:** Extra
**Referencias:** ADR 0011

## Historia técnica

Al menos un servicio usa un lenguaje y un motor de base de datos distintos a los del resto, para comprobar que la independencia entre servicios es real y no solo una suposición.

## Criterios de aceptación

- [ ] Al menos un servicio está escrito en otro lenguaje y usa otro motor de base de datos.
- [ ] Ese servicio expone el mismo contrato que exponía antes: mismas rutas, mismos códigos de error y mismo formato de error.
- [ ] El gateway no necesita ningún tratamiento especial para hablar con él.
- [ ] Ningún servicio comparte código con otro.
- [ ] El número de lenguajes y de motores se mantiene en dos, para no convertir la variedad en desorden.
