# Catálogo de eventos de integración

Mensajes que viajan por el broker. Regla propuesta (ADR 0007): un servicio publica su evento cuando el contenido depende solo de sus datos; si necesita datos de varios servicios, lo compone y lo publica el gateway.

| Evento | Lo publica | Lo consumen | Contenido | Efecto |
|---|---|---|---|---|
| `FotoSubida` | `ms-media` | `ms-media` | fotoId, galeriaId | Genera la miniatura en segundo plano |
| `GaleriaEliminada` | `ms-galerias` | `ms-media`, `ms-seleccion`, `ms-auth` | galeriaId | Cada servicio borra sus datos de esa galería |
| `GaleriaPublicada` | API Gateway | `ms-notificaciones` | galeriaId, nombreGaleria, clienteNombre, clienteCorreo, enlace | Correo al cliente |
| `SeleccionEnviada` | API Gateway | `ms-notificaciones` | galeriaId, nombreGaleria, fotografoCorreo, cantidad | Correo al fotógrafo |

## Ejemplo de mensaje

```json
{
  "evento": "GaleriaPublicada",
  "id": "5b0c6e7e-6a77-4c43-9b8f-0d2f6c1d9a10",
  "ocurrioEn": "2026-11-04T15:30:00Z",
  "datos": {
    "galeriaId": "0f8fad5b-d9cb-469f-a165-70867728950e",
    "nombreGaleria": "Sesión de grado",
    "clienteNombre": "Laura",
    "clienteCorreo": "laura@example.com",
    "enlace": "https://galeria.example.com/c/Xk3v9..."
  }
}
```

Todo mensaje lleva un `id` único para que los consumidores puedan ignorar duplicados.
