# frontend

Interfaz web de Galería Privada, en **React** con **Vite**. Dos recorridos: el
del fotógrafo, que entra con su cuenta, y el del cliente, que entra por un
enlace sin registrarse (ADR 0001).

Parte del sistema **Galería Privada**. El repositorio sombrilla, con el
`docker-compose` del sistema completo y toda la documentación, es
[galeria-privada](../README.md).

## Requisitos

Docker y Docker Compose. Nada más.

## Comandos

| Comando | Qué hace |
|---|---|
| `make start` | Servidor de desarrollo con recarga en caliente en el 5173 |
| `make stop` | Lo detiene |
| `make test` | Pruebas con cobertura (Vitest) |
| `make lint` | Análisis estático |
| `make build` | Construye la imagen de producción (nginx) |

Necesita el gateway corriendo en el puerto 3000.

## Cómo habla con el backend

Todo pasa por `src/api.js`, que llama siempre a `/api` y nada más: el frontend
es **un consumidor más del gateway** y no conoce ningún microservicio. En
desarrollo lo reenvía Vite; en producción, nginx.

Los errores del backend llegan con su `codigo` (`LIMITE_ALCANZADO`,
`SELECCION_ENVIADA`...), y las pantallas reaccionan a ese código y no al texto
del mensaje, que puede cambiar.

## Pantallas

| Archivo | Para quién |
|---|---|
| `paginas/Acceso.jsx` | Entrada del fotógrafo y del cliente |
| `paginas/Panel.jsx` | El fotógrafo y sus galerías |
| `paginas/Galeria.jsx` | Una galería vista por su fotógrafo |
| `paginas/GaleriaDelCliente.jsx` | La galería vista por el cliente |
| `paginas/SeleccionRecibida.jsx` | Lo que el fotógrafo recibe al final |
