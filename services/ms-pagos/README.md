# ms-pagos

Microservicio de pagos de Galería Privada: pedidos de fotos extra con pago
simulado. Escrito en **Go** con **MongoDB**.

> Es el servicio heterogéneo del sistema. El resto está en NestJS sobre
> PostgreSQL; este usa otro lenguaje y otra base de datos, siguiendo la
> *Rule of Twos* del capítulo 8 (Guideline 3). Se eligió este porque es el más
> pequeño y el más aislado: es prioridad *Extra*, nadie depende de él para el
> MVP, y si falla el resto del sistema sigue funcionando.

## Requisitos

Docker y Docker Compose. Nada más: no hace falta tener Go instalado.

## Comandos

| Comando | Qué hace |
|---|---|
| `make start` | Levanta el servicio y su MongoDB |
| `make stop` | Lo detiene |
| `make test` | Ejecuta las pruebas con cobertura |
| `make lint` | Análisis estático (`go vet` y `gofmt`) |
| `make build` | Construye la imagen de producción |
| `make logs` | Muestra los logs |
| `make clean` | Borra contenedores y volúmenes |

## Endpoints

| Método y ruta | Operación |
|---|---|
| `POST /pedidos` | A-PAG-01 · CrearPedido (HU-20) |
| `POST /pedidos/{id}/pago-simulado` | A-PAG-02 · ConfirmarPagoSimulado · idempotente |
| `GET /pedidos/{id}` | Q-PAG-01 · ObtenerPedido |
| `GET /ping` | Liveness: responde si el proceso está vivo |
| `GET /health` | Readiness: responde 200 solo si además hay MongoDB |

El contrato completo está en [`docs/api.yml`](docs/api.yml).

## Variables de entorno

| Variable | Por defecto | Para qué |
|---|---|---|
| `PORT` | `3006` | Puerto de escucha |
| `MONGO_URI` | `mongodb://localhost:27017` | Conexión a MongoDB |
| `MONGO_DB` | `pagos_db` | Base de datos |

## Probar a mano

```bash
curl -X POST http://localhost:3006/pedidos \
  -H "Content-Type: application/json" \
  -d '{"galeriaId":"3f2504e0-4f89-41d3-9a0c-0305e82c3301","cantidadFotos":5,"precioUnitario":15000}'

curl -X POST http://localhost:3006/pedidos/<id>/pago-simulado
curl http://localhost:3006/pedidos/<id>
curl http://localhost:3006/health
```

## Sobre los datos

El agregado es **Pedido** (AG-06). No se guarda ningún dato de tarjeta ni de
medio de pago: el pago es simulado y el sistema nunca los almacena (RNF-06).
`galeriaId` es una referencia lógica a `ms-galerias`, sin clave foránea, porque
viven en bases de datos distintas.

MongoDB no tiene esquema fijo, así que no hay migraciones. El equivalente de
una migración aquí sería un script de datos semilla, que este servicio no
necesita.
