**Épica:** 3 · Fotos
**Prioridad:** MVP
**Requerimiento:** RF-09
**Job story:** JS-02

## Historia de usuario

Como **fotógrafo**, quiero **que el sistema genere automáticamente miniaturas de las fotografías que cargo**, para **mostrar una galería más ligera sin preparar manualmente versiones reducidas**.

## Criterios de aceptación

```gherkin
# language: es
Característica: Generación automática de miniaturas

  Escenario: Iniciar el procesamiento después de la carga
    Dado que cargué una fotografía válida
    Cuando el sistema recibe el archivo correctamente
    Entonces inicia la generación de su miniatura en segundo plano
    Y la fotografía se identifica como en procesamiento

  Escenario: Miniatura generada correctamente
    Dado que una fotografía está en procesamiento
    Cuando el sistema termina de generar su miniatura
    Entonces la fotografía queda disponible para visualizar en la galería

  Escenario: Continuar cargando mientras se procesan fotografías
    Dado que tengo fotografías en proceso de generación de miniaturas
    Cuando cargo otras fotografías
    Entonces el sistema permite continuar con la carga sin esperar a que termine el procesamiento anterior

  Escenario: Fallo en el procesamiento de una fotografía
    Dado que se están procesando varias fotografías
    Cuando ocurre un error al generar la miniatura de una de ellas
    Entonces el sistema identifica esa fotografía como fallida
    Y registra el error correspondiente
    Y continúa procesando las demás fotografías

  Escenario: Reintentar un procesamiento fallido
    Dado que una fotografía falló durante su procesamiento por una causa recuperable
    Cuando se solicita reintentar el procesamiento
    Entonces el sistema vuelve a intentar generar su miniatura
    Y actualiza el estado según el resultado

  Escenario: Conservar el archivo original
    Dado que el sistema genera una miniatura a partir de una fotografía
    Cuando termina el procesamiento
    Entonces el archivo original permanece conservado sin modificaciones
```
