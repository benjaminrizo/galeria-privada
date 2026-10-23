# Requerimientos funcionales

Proyecto: **Galería Privada**

**Actores:** Fotógrafo, Cliente.

**Prioridad:** `MVP` = lo primero que se construye · `Después` = si el MVP va bien · `Extra` = solo si sobra tiempo.

Este documento puede cambiar a medida que se definan los detalles del proyecto.

---

## Épica 1: Acceso

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-01 | El fotógrafo puede registrarse e iniciar sesión. | MVP |
| RF-02 | El sistema genera un enlace privado y único para cada galería. | MVP |
| RF-03 | El cliente entra a su galería con ese enlace, sin crear cuenta. | MVP |

## Épica 2: Sesiones y galerías

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-04 | El fotógrafo crea una sesión con nombre, datos del cliente y límite de fotos incluidas. | MVP |
| RF-05 | El fotógrafo puede editar y eliminar sesiones. | MVP |
| RF-06 | Cada galería tiene un estado: borrador, publicada o selección enviada. | MVP |
| RF-07 | El fotógrafo publica la galería para que el cliente pueda entrar. | MVP |

## Épica 3: Fotos

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-08 | El fotógrafo sube varias fotos a una sesión. | MVP |
| RF-09 | El sistema genera miniaturas automáticamente. | MVP |
| RF-10 | El cliente solo ve versiones reducidas, nunca el archivo original. | MVP |

## Épica 4: Selección

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-11 | El cliente marca y desmarca fotos. | MVP |
| RF-12 | Un contador muestra cuántas lleva elegidas frente al límite, y el sistema bloquea al llegar a él. | MVP |
| RF-13 | La selección se guarda para que el cliente pueda continuar después. | MVP |
| RF-14 | El cliente envía su selección final y esta queda bloqueada. | MVP |
| RF-15 | El fotógrafo ve la selección enviada. | MVP |

## Épica 5: Comentarios de retoque

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-16 | El cliente deja un comentario de retoque en cada foto seleccionada. | Después |
| RF-17 | El fotógrafo ve esos comentarios junto a cada foto. | Después |

## Épica 6: Notificaciones

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-18 | El cliente recibe un correo cuando su galería está publicada. | Después |
| RF-19 | El fotógrafo recibe un correo cuando el cliente envía su selección. | Después |

## Épica 7: Fotos extra con pago simulado (Extra)

Se implementa primero con un **pago simulado**: un botón "Pagar" que confirma el pedido sin cobrar nada. Una integración real con una pasarela de pagos solo se haría si sobra tiempo.

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-20 | El fotógrafo define el precio de las fotos extra. | Extra |
| RF-21 | Al llegar al límite, el cliente puede pedir fotos extra y confirmar el pedido con un pago simulado. | Extra |
| RF-22 | Al confirmarse el pedido, el límite de selección del cliente aumenta. | Extra |

## Otros extras 

- Marca de agua en las fotos
- PIN adicional para entrar a la galería
- Fecha de expiración de la galería
- Reabrir una selección ya enviada
- Descarga de fotos finales en ZIP
- Pago real con pasarela en modo de pruebas
