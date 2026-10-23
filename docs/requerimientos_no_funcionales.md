# Requerimientos no funcionales

Proyecto: **Galería Privada**

Son condiciones de calidad que el sistema debe cumplir. Se dejaron solo las que el equipo puede cumplir y comprobar en el tiempo del proyecto. Pueden cambiar a medida que se definan los detalles.

---

## Seguridad

| ID | Requerimiento |
|---|---|
| RNF-01 | Toda la comunicación usa HTTPS. |
| RNF-02 | El enlace de cada galería lleva un código aleatorio difícil de adivinar. |
| RNF-03 | Las contraseñas se guardan cifradas (hash), nunca en texto plano. |
| RNF-04 | Los archivos originales no son públicos; se acceden con enlaces temporales. |
| RNF-05 | Las acciones del fotógrafo requieren sesión iniciada; el cliente solo accede a su propia galería. |
| RNF-06 | El sistema nunca guarda datos de tarjetas, ni siquiera si más adelante se integra una pasarela de pagos real. |

## Rendimiento

| ID | Requerimiento |
|---|---|
| RNF-07 | La galería carga miniaturas, no las fotos originales, y las imágenes se cargan a medida que se necesitan. |
| RNF-08 | El procesamiento de fotos se hace en segundo plano para no dejar esperando al fotógrafo. |

## Usabilidad y compatibilidad

| ID | Requerimiento |
|---|---|
| RNF-10 | El cliente puede usar la galería desde el celular, sin instalar nada ni crear cuenta. |
| RNF-11 | La interfaz está en español. |
| RNF-12 | Funciona en las versiones actuales de Chrome, Firefox y Edge. |

## Mantenibilidad

| ID | Requerimiento |
|---|---|
| RNF-13 | Cada servicio tiene su contrato de API documentado (OpenAPI). |
| RNF-14 | Los microservicios no se llaman directamente entre sí; coordina el API Gateway o se usan eventos. |
| RNF-15 | Cada servicio tiene su propia base de datos. |
| RNF-16 | Todo el sistema se levanta con un solo comando (`docker-compose up`). |

---
