# gateway

**API Gateway** de Galería Privada: el único punto de entrada al sistema
(ADR 0002). Valida el token del fotógrafo, orquesta las operaciones que tocan
varios servicios y publica los eventos de integración compuestos (ADR 0007).

Parte del sistema **Galería Privada**. El repositorio sombrilla, con el
`docker-compose` del sistema completo y toda la documentación, es
[galeria-privada](../README.md).

## Requisitos

Docker y Docker Compose. Nada más.

## Comandos

| Comando | Qué hace |
|---|---|
| `make start` | Levanta el gateway contra los servicios que ya estén corriendo |
| `make stop` | Lo detiene |
| `make test` | Pruebas con cobertura |
| `make lint` | Análisis estático |
| `make build` | Construye la imagen de producción |

El gateway no tiene sentido aislado: su trabajo es hablar con los demás. Para
trabajar en él conviene levantar el sistema desde el sombrilla (`make dev`) y
después este repositorio.

## Qué hace

No tiene base de datos propia. Sus responsabilidades:

- **Punto único de entrada.** El frontend solo conoce esta dirección; nunca
  llama a un microservicio directamente.
- **Autenticación.** El token se valida aquí y solo aquí. A los servicios les
  llega ya resuelto el `fotografoId`, y ellos confían en ese dato.
- **Composición de consultas.** Una pantalla del cliente necesita datos de
  galerías, medios y selección: el gateway los pide en paralelo y devuelve una
  sola respuesta.
- **Orquestación con compensación.** En los flujos de varios pasos (publicar
  una galería, enviar una selección) ejecuta el orden, y si un paso falla
  deshace o reintenta según el caso (ADR 0008).

## Salud

| Ruta | Qué comprueba |
|---|---|
| `GET /ping` | Liveness: el proceso está vivo |
| `GET /health` | Readiness: además alcanza a los servicios del MVP |

La diferencia importa: un gateway vivo que no alcanza a nadie no puede
orquestar nada, así que no debe recibir tráfico. Los servicios de prioridad
posterior (notificaciones, pagos) se informan pero no tumban la respuesta.

Contrato completo en `http://localhost:3000/docs`, y en texto en
[`docs/QueriesYActions/gateway.md`](../docs/QueriesYActions/gateway.md).
