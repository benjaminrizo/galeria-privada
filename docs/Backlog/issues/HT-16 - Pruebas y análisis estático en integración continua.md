**Épica:** 8 · Fundamentos técnicos
**Prioridad:** MVP
**Referencias:** ADR 0012

## Historia técnica

Ningún cambio llega a la rama principal sin que las pruebas y el análisis estático hayan pasado, para que los errores se vean en la propuesta de cambio y no después.

## Criterios de aceptación

- [ ] Cada componente tiene pruebas automatizadas con el framework propio de su lenguaje.
- [ ] Cada componente tiene análisis estático configurado.
- [ ] La integración continua ejecuta linting, pruebas y construcción de la imagen de producción en cada propuesta de cambio.
- [ ] El estado de la comprobación se ve en la propuesta de cambio.
- [ ] La rama principal está protegida y no admite mezclas con la comprobación en rojo.
