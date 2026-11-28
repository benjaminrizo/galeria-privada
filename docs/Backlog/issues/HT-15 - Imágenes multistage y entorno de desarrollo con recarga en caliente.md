**Épica:** 8 · Fundamentos técnicos
**Prioridad:** MVP
**Referencias:** RNF-16, ADR 0012

## Historia técnica

Separar la imagen con la que se trabaja de la imagen que se despliega, y poder editar el código en la máquina viéndolo aplicado dentro del contenedor.

## Criterios de aceptación

- [ ] Cada `Dockerfile` tiene dos etapas: una de construcción y una de producción.
- [ ] La imagen de producción no lleva código fuente ni dependencias de desarrollo, y no se ejecuta como root.
- [ ] En modo desarrollo el código se monta desde la máquina y el cambio se ve sin reconstruir la imagen.
- [ ] Levantar el entorno no exige tener instalado Node ni Go en la máquina.
