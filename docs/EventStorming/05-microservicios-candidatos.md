# Paso 5: Microservicios candidatos

Cada bounded context es un candidato a microservicio. Se evalúa con estos criterios:

- **Cohesión:** todo lo que cambia junto vive junto.
- **Datos propios:** el servicio es dueño exclusivo de sus datos (RNF-15).
- **Aislamiento de fallos:** si cae, el resto sigue funcionando.
- **Escalado distinto:** carga de trabajo diferente a la de los demás.

## Candidatos

| Microservicio | Contexto | Cohesión | Datos propios | Aislamiento de fallos | Escalado distinto | Decisión |
|---|---|---|---|---|---|---|
| `ms-auth` | Identidad y Acceso | Alta | Fotógrafos y enlaces | Si cae, nadie entra | No | Sí (MVP) |
| `ms-galerias` | Gestión de Galerías | Alta | Galerías | Si cae, no se administran sesiones | No | Sí (MVP) |
| `ms-media` | Medios | Alta | Metadatos de fotos y archivos | La subida pesada no afecta al resto | **Sí**: subida y procesamiento de imágenes | Sí (MVP) |
| `ms-seleccion` | Selección | Alta | Selecciones y comentarios | Si cae, el cliente no elige | Picos al abrir la galería | Sí (MVP) |
| `ms-notificaciones` | Notificaciones | Alta | Registro de envíos | Un fallo de correo no debe afectar nada más | No | Sí (Después) |
| `ms-pagos` | Pagos | Alta | Pedidos | Aislar el dinero del resto | No | Sí (Extra) |
| API Gateway | Transversal | n/a | Ninguno | Punto único de entrada | No | Sí (MVP) |

## Candidatos descartados o fusionados

| Candidato | Decisión | Razón |
|---|---|---|
| `ms-comentarios` | Fusionado en `ms-seleccion` | Un comentario depende de que la foto esté marcada; separarlos obligaría a coordinar dos servicios para una sola regla. |
| `ms-clientes` | Descartado | El cliente no tiene cuenta (ADR 0001); su nombre y correo son datos de la galería. |
| `ms-enlaces` | Fusionado en `ms-auth` | El enlace es el mecanismo de acceso del cliente, el mismo tema que la autenticación. |
| `ms-sesiones` | Fusionado en `ms-galerias` | Sesión y galería son el mismo concepto (glosario). |

## Ficha de cada servicio

### API Gateway
- **Responsabilidad:** único punto de entrada, valida la sesión del fotógrafo, orquesta las operaciones que involucran varios servicios y publica los eventos de integración compuestos.
- **Datos propios:** ninguno.
- **Historias:** HT-02, HT-12.

### `ms-auth`
- **Responsabilidad:** registro e inicio de sesión del fotógrafo; generación y resolución de enlaces de acceso.
- **Agregados:** Fotógrafo, Acceso a Galería.
- **Consume:** `GaleriaEliminada` (borra el enlace).
- **Historias:** HU-01, HU-02, HU-03, HT-08, HT-09.

### `ms-galerias`
- **Responsabilidad:** crear, editar, eliminar y publicar galerías; guardar datos del cliente, límite y estado.
- **Agregado:** Galería.
- **Publica:** `GaleriaEliminada`.
- **Historias:** HU-04, HU-05, HU-06, HU-19.

### `ms-media`
- **Responsabilidad:** recibir fotos, generar miniaturas en segundo plano y entregar solo versiones reducidas al cliente; los originales se acceden con enlaces temporales.
- **Agregado:** Foto.
- **Publica y consume:** `FotoSubida`. **Consume:** `GaleriaEliminada` (borra los archivos).
- **Historias:** HU-07, HU-08, HU-09, HT-06, HT-07.

### `ms-seleccion`
- **Responsabilidad:** marcar y desmarcar fotos, respetar el límite recibido, guardar comentarios y registrar el envío final.
- **Agregado:** Selección.
- **Consume:** `GaleriaEliminada`.
- **Historias:** HU-10 a HU-16, HT-12.

### `ms-notificaciones`
- **Responsabilidad:** enviar los correos y registrar cada envío para poder reintentar.
- **Agregado:** Notificación.
- **Consume:** `GaleriaPublicada`, `SeleccionEnviada`.
- **Historias:** HU-17, HU-18.

### `ms-pagos` (extra)
- **Responsabilidad:** crear pedidos de fotos extra y confirmarlos con pago simulado.
- **Agregado:** Pedido.
- **Historias:** HU-20.

## Orden de implementación sugerido

1. **Base:** API Gateway, `ms-auth`, `ms-galerias`.
2. **Fotos:** `ms-media` con el broker para miniaturas.
3. **Selección:** `ms-seleccion` y la orquestación del límite (completa el MVP).
4. **Después:** `ms-notificaciones` y comentarios de retoque.
5. **Extra:** `ms-pagos`.

## Puntos críticos (hotspots)

| ID | Duda | Resolución propuesta |
|---|---|---|
| H-11 | ¿Express o NestJS para el backend? | Pendiente del equipo; registrar en el ADR 0006. NestJS aporta estructura por módulos y Express es más ligero. |
