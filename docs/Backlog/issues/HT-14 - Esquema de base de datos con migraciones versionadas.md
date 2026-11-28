**Épica:** 8 · Fundamentos técnicos
**Prioridad:** MVP
**Referencias:** RNF-15, ADR 0012

## Historia técnica

El esquema de cada base de datos se crea y evoluciona mediante migraciones versionadas, no automáticamente, para que todo cambio quede registrado y se pueda desplegar con seguridad.

## Criterios de aceptación

- [ ] `synchronize` está desactivado en todos los servicios.
- [ ] Cada cambio de esquema es un archivo de migración con fecha en el nombre.
- [ ] Las migraciones se aplican solas al arrancar el servicio, sin pasos manuales.
- [ ] Cada migración tiene su reversión.
- [ ] Ningún servicio ejecuta migraciones sobre la base de datos de otro.
