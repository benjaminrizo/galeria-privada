# ADR 0005: Almacenamiento de archivos con MinIO y URLs temporales

- **Estado:** Propuesta · la elección de producto quedó reemplazada por el [ADR 0010](0010-rustfs-en-lugar-de-minio.md)
- **Fecha:** 4 de noviembre de 2026

> **Nota de noviembre de 2026.** Lo que decide este ADR sigue vigente: espacios
> privados, URLs firmadas con vencimiento y solo miniaturas para el cliente.
> Lo que cambió es el producto: MinIO retiró sus imágenes de Docker Hub en
> septiembre de 2026 y el sistema dejó de poder levantarse. El ADR 0010 explica
> el cambio a RustFS, que habla la misma API de S3.

## Contexto

Los originales no pueden ser públicos y se acceden con enlaces temporales (RNF-04). El cliente solo debe ver miniaturas (RF-10). Los archivos no se guardan en la base de datos. Además, el sistema debe levantarse con `docker-compose` (RNF-16), sin depender de un servicio de nube de pago.

## Decisión

`ms-media` guarda los archivos en **MinIO**, un almacenamiento de objetos compatible con la API de S3 que corre como contenedor.

- Dos espacios (buckets) privados: uno para **originales** y otro para **miniaturas**. Ninguno tiene acceso público.
- La base de datos de `ms-media` guarda solo la **clave** de cada archivo.
- Para mostrar un archivo se generan **URLs firmadas con vencimiento corto**.
- Al cliente solo se le entregan URLs de miniaturas; las URLs de originales las usa únicamente el fotógrafo.

## Consecuencias

**A favor**
- Cumple RNF-04 de forma nativa con URLs firmadas.
- Como usa la API de S3, el código sirve igual si luego se migra a un servicio de nube.
- Se levanta con `docker-compose`.

**En contra**
- Un contenedor más.
- Las URLs temporales caducan; el frontend debe pedirlas de nuevo si expiran.

**Medidas**
- El tiempo de vida de las URLs se define como configuración.
- Al recibir `GaleriaEliminada`, `ms-media` borra los archivos de esa galería.

## Alternativas consideradas

- **Volumen de disco con rutas en la base de datos:** lo más simple, pero no ofrece URLs firmadas y obliga a servir los archivos desde el propio servicio.
- **S3 de un proveedor en la nube:** adecuado para producción, pero añade dependencia y costo para un proyecto académico.
