# ADR 0013: Traefik como edge router delante del API Gateway

- **Estado:** Propuesta
- **Fecha:** 28 de noviembre de 2026
- **Complementa a:** [ADR 0002](0002-gateway-orquesta-microservicios.md)

## Contexto

Hasta ahora había dos puertas al sistema: el frontend en el 8080 y el API
Gateway en el 3000. Funciona en una máquina, pero trae tres problemas:

1. **El navegador tiene que conocer dos direcciones.** En producción eso
   significa dos dominios o una configuración de CORS que hay que mantener.
2. **Los puertos internos quedan expuestos.** Cualquiera que conozca el 3001
   puede hablar con `ms-auth` sin pasar por el gateway, que es exactamente lo
   que el [ADR 0002](0002-gateway-orquesta-microservicios.md) quiere evitar.
3. **Añadir un servicio obliga a tocar configuración.** Con un proxy estático
   tipo nginx hay que escribir la regla y reiniciar el proxy.

El capítulo 9 del libro resuelve esto con un **edge router** en el umbrella
project, y el capítulo 10 lo reutiliza como *ingress controller* en
Kubernetes: la misma pieza en local y en producción.

## Decisión

Se pone **Traefik v3.6** delante de todo, como única puerta del sistema.

No sustituye al API Gateway. Son dos capas distintas y se explican así:

| | Traefik | API Gateway |
|---|---|---|
| **Qué decide** | a qué contenedor va la petición, según la URL | qué operaciones ejecutar y en qué orden |
| **Qué sabe** | direcciones y puertos | el token, los permisos y las reglas de negocio |
| **Capa** | red | aplicación |

El enrutamiento es:

| URL | A dónde va |
|---|---|
| `/api/...` | el API Gateway |
| `/docs`, `/health`, `/ping` | el API Gateway |
| cualquier otra | el frontend |

Traefik descubre los servicios **solo**, leyendo el socket de Docker en modo
solo lectura. Un contenedor entra al enrutamiento poniéndose la etiqueta
`traefik.enable=true`; sin ella, Traefik lo ignora
(`--providers.docker.exposedbydefault=false`). No hay archivo de rutas que
mantener ni proxy que reiniciar.

Se usa la **v3.6** y no una v2: las versiones antiguas fallan contra los
motores de Docker modernos con el error `client version 1.24 is too old`.

| Puerto | Para qué |
|---|---|
| `9080` | la puerta del sistema |
| `8081` | el panel de control de Traefik |

Los puertos de cada servicio (3000 a 3006) siguen publicados **solo para
depurar**: ver el Swagger de un servicio o probarlo aislado. En un despliegue
real no se publicarían.

## Consecuencias

**A favor**
- Una sola dirección para el navegador: desaparece el problema de CORS entre
  el frontend y el gateway.
- El panel del 8081 muestra en tiempo real qué rutas existen y si el destino
  responde. Es la primera herramienta a la que ir cuando algo da 404.
- Añadir un servicio al enrutamiento es añadirle dos etiquetas.
- La misma pieza sirve de *ingress* si el sistema se lleva a Kubernetes.

**En contra**
- Un contenedor más y una capa más que entender al depurar.
- Traefik necesita acceso al socket de Docker. Es solo lectura, pero sigue
  siendo un permiso fuerte que en producción habría que acotar.
- El panel va sin contraseña (`--api.insecure=true`): vale para desarrollo y
  **no** debe quedar así en producción.

**Medidas**
- El socket se monta con `:ro`.
- Los servicios solo aceptan llamadas del gateway, como ya decía el ADR 0002;
  Traefik no abre rutas hacia ellos.
- En producción el panel se cierra y se añade TLS en la entrada, que es donde
  se resolvería el RNF-01 (HT-10).

## Alternativas consideradas

- **nginx como proxy inverso.** Ya está en el proyecto sirviendo el frontend,
  así que no añadiría contenedores. Pero la configuración es estática: cada
  servicio nuevo obliga a editar el archivo y recargar.
- **Dejar el gateway como única puerta.** Es lo que había. Sigue sin resolver
  que el frontend necesite su propia dirección.
- **Kong o Envoy.** Más potentes, bastante más pesados de configurar para lo
  que este sistema necesita.
