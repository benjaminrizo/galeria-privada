# Implementación de los microservicios

Esta carpeta explica **cómo se construyó** lo que el diseño describe. Los
contratos siguen siendo los de [Queries y Actions](../QueriesYActions/README.md);
aquí se cuenta dónde vive cada cosa y cómo levantarla.

## Arrancar todo con un comando

```bash
cp .env.example .env        # opcional: los valores por defecto ya sirven
docker compose up --build
```

Esto cumple RNF-16 y deja disponible:

| Dirección | Qué es |
|---|---|
| http://localhost:8080 | La aplicación (fotógrafo y cliente) |
| http://localhost:3000/docs | Contrato OpenAPI del gateway (RNF-13) |
| http://localhost:3001/docs … 3006/docs | Contrato de cada microservicio |
| http://localhost:8025 | Bandeja de correo de prueba (Mailpit) |
| http://localhost:15672 | Panel de RabbitMQ (`galeria` / `galeria`) |
| http://localhost:9001 | Consola de MinIO (`minioadmin` / `minioadmin`) |

La primera vez tarda, porque compila siete imágenes de Node y crea las bases de
datos.

## Recorrido para la demostración

1. Entrar a http://localhost:8080, crear una cuenta y acceder con ella.
2. Crear una sesión con su nombre, los datos del cliente y el límite de fotos.
3. Subir varias fotos. Aparecen como *Generando miniatura…* y pasan a mostrarse
   solas: el procesamiento va en segundo plano (RNF-08).
4. Pulsar **Publicar y avisar al cliente**. El correo aparece en
   http://localhost:8025.
5. Copiar el enlace privado y abrirlo en otra pestaña (o en el celular). Es la
   vista del cliente: entra sin cuenta (ADR 0001).
6. Elegir fotos. El contador bloquea al llegar al límite, y cada foto elegida
   acepta su comentario de retoque.
7. Enviar la selección. Llega un segundo correo, esta vez para el fotógrafo.
8. En la sesión del fotógrafo, **Ver la selección del cliente**: las fotos
   elegidas, sus comentarios y el enlace temporal al original.

Para probar el extra: definir un precio por foto extra en los ajustes de la
sesión y, desde la vista del cliente, pulsar **Pedir fotos extra**.

## Estructura del repositorio

```
gateway/                 API Gateway: único punto de entrada (ADR 0002)
services/ms-auth/        Identidad y Acceso
services/ms-galerias/    Gestión de Galerías
services/ms-media/       Medios
services/ms-seleccion/   Selección
services/ms-notificaciones/
services/ms-pagos/       Pagos (extra)
frontend/                React + Vite, servido por nginx
infra/postgres/init/     Crea una base y un usuario por servicio
scripts/                 Script para publicar el backlog como Issues
docs/                    Todo el diseño
```

Cada servicio tiene siempre la misma forma, para que cualquiera del equipo
pueda entrar en cualquiera (ADR 0006):

```
src/main.ts              arranque
src/app.module.ts        módulos, entidades y conexión a su base
src/<agregado>/          entidad, DTO, servicio, controlador y consumidores
src/comun/               bus de eventos, idempotencia, errores, arranque
```

`src/comun/` se repite a propósito en cada servicio: así ninguno depende del
código de otro, que es lo que se busca al separarlos.

## Correspondencia entre diseño y código

| Diseño | Dónde está |
|---|---|
| Operaciones `G-01` a `G-17` | `gateway/src/flujos/` |
| Orquestaciones SEQ-02 a SEQ-06 y SEQ-11 | `gateway/src/flujos/galerias/galerias.flujo.ts` |
| Orquestaciones SEQ-07 a SEQ-10 y SEQ-12 | `gateway/src/flujos/cliente/cliente.flujo.ts` |
| Operaciones `A-*` y `Q-*` de cada servicio | el controlador y el servicio de su agregado |
| Modelo de datos (paso 6) | las entidades `*.entity.ts` de cada servicio |
| Catálogo de eventos | `src/comun/tipos.ts` y los archivos `*.consumidor.ts` |

Cada método lleva en su comentario el identificador de la operación y la
historia de usuario que la origina, de modo que se puede ir del backlog al
código y al revés.

Los flujos del fotógrafo y los del cliente están en módulos separados dentro
del gateway, como respuesta al punto crítico **H-15** (que el gateway acumule
toda la lógica de coordinación).

## Cómo se cumplen los requerimientos no funcionales

| RNF | Cómo |
|---|---|
| RNF-02 | El código del enlace son 24 bytes aleatorios en base64url (192 bits) |
| RNF-03 | Contraseñas con `bcrypt`; el login compara también cuando el correo no existe, para no delatar qué cuentas hay |
| RNF-04 | Dos espacios privados en MinIO; al cliente solo se le firman miniaturas, y las URLs de originales vencen en 15 minutos |
| RNF-05 | El gateway valida el token y es el único que lo hace; los servicios reciben ya el `fotografoId` |
| RNF-06 | `ms-pagos` no tiene ningún campo de tarjeta ni de medio de pago |
| RNF-07 | La galería carga miniaturas, con `loading="lazy"` y paginación de 60 fotos |
| RNF-08 | La subida responde `202` y la miniatura se genera al consumir `FotoSubida` |
| RNF-10, RNF-11, RNF-12 | Interfaz responsive en español, con HTML y CSS estándar |
| RNF-13 | Swagger en `/docs` de cada servicio, generado desde el propio código |
| RNF-14 | Ningún servicio conoce la dirección de otro: solo el gateway las tiene |
| RNF-15 | Una base de datos y un usuario por servicio (`infra/postgres/init/`) |
| RNF-16 | `docker compose up --build` |

RNF-01 (HTTPS en toda la comunicación) queda pendiente: en desarrollo todo va
por HTTP dentro de la red de Docker. Es la historia **HT-10**, marcada como
«Después», y se resolvería con un certificado en la entrada de nginx.

## Lo que queda abierto

- **Migraciones.** Las tablas se crean solas al arrancar (`synchronize: true`),
  que sirve para el proyecto pero no para producción.
- **Pruebas automáticas.** El recorrido de arriba se hizo a mano; no hay todavía
  pruebas unitarias ni de integración.
- **RNF-01.** Como se explica arriba.
- **Un solo contenedor de PostgreSQL.** Es lo que decidió el ADR 0003 para
  desarrollo; en producción serían instancias separadas.

## Desarrollo sin Docker

Cada parte se puede levantar por separado, siempre que haya un PostgreSQL, un
RabbitMQ y un MinIO a mano:

```bash
cd services/ms-auth
npm install
DB_HOST=localhost DB_USER=auth_user DB_PASSWORD=auth_pass DB_NAME=auth_db \
RABBITMQ_URL=amqp://galeria:galeria@localhost:5672 \
npm run build && npm start

cd frontend
npm install && npm run dev      # http://localhost:5173, con /api hacia el gateway
```

Las variables que usa cada servicio están en el `docker-compose.yml`, que hace
de referencia.
