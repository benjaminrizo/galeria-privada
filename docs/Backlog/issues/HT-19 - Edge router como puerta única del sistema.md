**Épica:** 8 · Fundamentos técnicos
**Prioridad:** MVP
**Referencias:** RNF-14, ADR 0013

## Historia técnica

Todo el tráfico entra por una sola dirección, y es un enrutador de borde el que decide a qué contenedor va cada petición según la URL, sin que haya que configurarlo a mano cada vez que aparece un servicio.

## Criterios de aceptación

- [ ] El sistema se usa entero desde una única dirección, sin cambiar de puerto entre el frontend y la API.
- [ ] Las peticiones a `/api` llegan al API Gateway y el resto al frontend.
- [ ] El enrutador descubre los contenedores solo, sin archivo de rutas que mantener.
- [ ] Un contenedor sin la etiqueta correspondiente queda fuera del enrutamiento.
- [ ] Existe un panel donde se ve qué rutas hay y si su destino responde.
- [ ] Los puertos de cada servicio siguen accesibles solo para depurar.
