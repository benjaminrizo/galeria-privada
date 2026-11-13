# Diagramas de secuencia

Diagramas en formato texto (PlantUML) de los flujos principales del sistema. Cada archivo `.puml` es la fuente y su `.png` es el render para verlo directamente en GitHub. Se derivan del paso 7 del [event storming](../EventStorming/07-patrones-de-interaccion.md) y siguen el ADR 0002: el API Gateway orquesta y los microservicios no se llaman entre sí.

| ID | Diagrama | Historias | Prioridad |
|---|---|---|---|
| SEQ-01 | [Registro e inicio de sesión](SEQ-01-registro-e-inicio-de-sesion.puml) | HU-01 | MVP |
| SEQ-02 | [Crear galería](SEQ-02-crear-galeria.puml) | HU-02, HU-04 | MVP |
| SEQ-03 | [Editar galería](SEQ-03-editar-galeria.puml) | HU-05 | MVP |
| SEQ-04 | [Eliminar galería](SEQ-04-eliminar-galeria.puml) | HU-05 | MVP |
| SEQ-05 | [Subir fotos y generar miniaturas](SEQ-05-subir-fotos-y-miniaturas.puml) | HU-07, HU-08 | MVP |
| SEQ-06 | [Publicar galería](SEQ-06-publicar-galeria.puml) | HU-06, HU-17 | MVP / Después |
| SEQ-07 | [El cliente abre su galería](SEQ-07-cliente-abre-galeria.puml) | HU-03, HU-09, HU-11 | MVP |
| SEQ-08 | [Marcar y desmarcar una foto](SEQ-08-marcar-y-desmarcar-foto.puml) | HU-10, HU-11, HU-12 | MVP |
| SEQ-09 | [Comentario de retoque](SEQ-09-comentario-de-retoque.puml) | HU-15 | Después |
| SEQ-10 | [Enviar la selección final](SEQ-10-enviar-seleccion.puml) | HU-13, HU-18 | MVP / Después |
| SEQ-11 | [El fotógrafo ve la selección](SEQ-11-fotografo-ve-seleccion.puml) | HU-14, HU-16 | MVP / Después |
| SEQ-12 | [Fotos extra con pago simulado](SEQ-12-fotos-extra-pago-simulado.puml) | HU-19, HU-20 | Extra |

## Cómo regenerar las imágenes

```bash
java -jar plantuml.jar -tpng docs/DiagramasSecuencia/*.puml
```

Si el `.png` sale con el nombre del identificador del diagrama (por ejemplo `SEQ-01.png`), renómbralo para que coincida con el nombre del `.puml`.

## Convenciones

- Las operaciones entre el gateway y los servicios usan los nombres definidos en [Queries y Actions](../QueriesYActions/README.md).
- Las respuestas de error usan códigos HTTP y un código de error en mayúsculas (por ejemplo `LIMITE_ALCANZADO`).
- Las partes en segundo plano (eventos y colas) aparecen separadas bajo "En segundo plano".
