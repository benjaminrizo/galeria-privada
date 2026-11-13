# ADR 0008: Consistencia eventual y borrado en cascada por eventos

- **Estado:** Propuesta
- **Fecha:** 4 de noviembre de 2026

## Contexto

Cada servicio tiene su propia base de datos (RNF-15) y las referencias entre servicios son identificadores sin clave foránea. Por eso, al eliminar una galería (HU-05) no se puede borrar en cascada con una sola transacción: sus fotos viven en `ms-media`, su selección en `ms-seleccion` y su enlace en `ms-auth`.

## Decisión

Se acepta la **consistencia eventual** para la limpieza de datos:

1. `ms-galerias` elimina la galería y publica el evento `GaleriaEliminada` con su `galeriaId`.
2. `ms-media`, `ms-seleccion` y `ms-auth` consumen el evento y borran, cada uno, sus datos asociados.
3. El cliente deja de poder entrar en cuanto `ms-auth` borra el enlace.

Los consumidores son **idempotentes**: borrar algo que ya no existe no es un error.

## Consecuencias

**A favor**
- Los servicios siguen siendo independientes; `ms-galerias` no conoce a los demás.
- Si un servicio está caído, recibe el evento al volver.

**En contra**
- Durante un corto tiempo pueden quedar datos huérfanos.
- Si un mensaje se pierde o agota los reintentos, esos datos quedan huérfanos.

**Medidas**
- Cola de mensajes fallidos (dead letter) para revisar los eventos que no se pudieron procesar.
- Cada servicio ignora peticiones sobre una galería que ya no existe (responde `404`).

## Alternativas consideradas

- **Orquestar el borrado desde el gateway con llamadas síncronas a cada servicio:** más inmediato, pero si un servicio falla a mitad quedaría un borrado parcial que el gateway tendría que compensar.
- **Borrado lógico (marcar como eliminada) sin limpiar:** deja datos y archivos acumulándose sin límite.
