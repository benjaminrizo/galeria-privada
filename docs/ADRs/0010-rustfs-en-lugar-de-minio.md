# ADR 0010: RustFS en lugar de MinIO como almacenamiento de archivos

- **Estado:** Propuesta
- **Fecha:** 13 de noviembre de 2026
- **Reemplaza a:** la elección de producto del [ADR 0005](0005-almacenamiento-de-archivos-con-minio.md)

## Contexto

El ADR 0005 decidió guardar los archivos en **MinIO**: dos espacios privados,
URLs firmadas con vencimiento corto y un contenedor más en `docker-compose`.
La decisión sigue siendo correcta; el producto dejó de estar disponible.

Al levantar el sistema por primera vez, la descarga de la imagen falla:

```
Error response from daemon: pull access denied for minio/minio,
repository does not exist or may require 'docker login'
```

No es un problema de credenciales. MinIO **borró sus repositorios de Docker
Hub** (`minio/minio` y `minio/mc`) en septiembre de 2026, y poco después su
copia en `quay.io` dejó de permitir descargas anónimas. El repositorio del
proyecto en GitHub está archivado desde abril de 2026 con el aviso de que ya no
se mantiene.

Como el proyecto tiene que levantarse con un solo comando en cualquier
computador (RNF-16), depender de una imagen que ya no se puede descargar deja
el sistema sin arrancar.

## Decisión

Se cambia MinIO por **RustFS** (`rustfs/rustfs:1.0.0`), un almacenamiento de
objetos compatible con la API de S3, con licencia Apache 2.0 y publicado en
Docker Hub.

Lo que **no** cambia, porque no depende del producto:

- Dos espacios privados, `originales` y `miniaturas`.
- Las URLs firmadas con vencimiento: 15 minutos para los originales, una hora
  para las miniaturas.
- Que al cliente solo se le firmen miniaturas (RNF-04).
- Los puertos: `9000` para la API y `9001` para la consola web.

Lo que cambia:

- El nombre del servicio en `docker-compose` pasa de `minio` a `almacen`.
- Las variables de entorno de `ms-media` pasan de `MINIO_*` a `ALMACEN_*`,
  para no nombrar un producto concreto en el código.
- Desaparece la comprobación de salud `mc ready local`, que era del cliente de
  MinIO. `ms-media` ya reintentaba la conexión al arrancar, así que el arranque
  sigue siendo ordenado sin ella.

El código de `ms-media` no cambia por lo demás: usa el SDK de AWS para S3, que
es lo que habla cualquiera de estos servidores.

## Consecuencias

**A favor**

- El sistema vuelve a levantarse con un solo comando, sin cuentas ni
  credenciales de registro.
- Al pasar por la API de S3, el servidor concreto queda intercambiable: si
  RustFS desaparece también, se cambia la imagen y nada más.
- Las variables dejan de llamarse como un producto, que fue lo que hizo visible
  el acoplamiento.

**En contra**

- RustFS es más joven y tiene menos recorrido que MinIO.
- Su consola web no es la misma que la de MinIO, así que las capturas o los
  pasos de una guía que mencionen la consola hay que rehacerlos.
- La compatibilidad con S3 es amplia pero no está garantizada al detalle; si
  algo falla, lo primero que hay que comprobar son las URLs firmadas.

**Medidas**

- `ms-media` crea los espacios al arrancar y reintenta hasta diez veces, así
  que no hace falta prepararlos a mano.
- Si RustFS diera problemas, la alternativa inmediata es la imagen de MinIO que
  publica Chainguard (`cgr.dev/chainguard/minio`), que corre con un usuario sin
  privilegios y necesita ajustar los permisos del volumen.

## Alternativas consideradas

- **`quay.io/minio/minio`:** fue el primer recambio que circuló, pero desde el
  24 de septiembre de 2026 rechaza las descargas anónimas.
- **Imagen de MinIO de Chainguard:** es el mismo MinIO, pero corre con el
  usuario 65532 y obliga a ajustar los permisos del volumen; el plan gratuito
  solo publica la etiqueta `latest`, así que no se puede fijar una versión.
- **SeaweedFS:** sólido y activo, pero las credenciales se definen en un archivo
  de configuración aparte y sin él la API queda abierta a cualquiera, justo lo
  contrario de lo que pide RNF-04.
- **Guardar los archivos en una carpeta del contenedor, sin S3:** quitaría un
  contenedor, pero habría que escribir a mano las URLs temporales y el proyecto
  perdería la parte que demuestra el almacenamiento privado.
