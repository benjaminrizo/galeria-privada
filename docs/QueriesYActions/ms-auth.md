# ms-auth: Identidad y Acceso

Datos propios: `fotografos`, `accesos_galeria` ([modelo de datos](../EventStorming/06-modelado-de-datos.md)).

## Actions

| ID | Nombre | Entrada | Salida | Reglas y errores | Evento | Ruta | Historia |
|---|---|---|---|---|---|---|---|
| A-AUTH-01 | RegistrarFotografo | nombre, correo, password | fotografoId | La contraseña se guarda con hash (RNF-03). `409 CORREO_DUPLICADO`. `422 DATOS_INVALIDOS` | EV-01 | `POST /fotografos` | HU-01 |
| A-AUTH-02 | IniciarSesion | correo, password | token firmado | `401 CREDENCIALES_INVALIDAS`, sin indicar si falló el correo o la contraseña | EV-02, EV-03 | `POST /login` | HU-01 |
| A-AUTH-03 | GenerarEnlaceAcceso | galeriaId | codigo | El código es aleatorio, largo y único (RNF-02, HT-09). Cada galería tiene un acceso activo | EV-05 | `POST /accesos` | HU-02 |

## Queries

| ID | Nombre | Entrada | Salida | Reglas y errores | Ruta | Historia |
|---|---|---|---|---|---|---|
| Q-AUTH-01 | ResolverCodigoDeAcceso | codigo | galeriaId | `404 ACCESO_NO_ENCONTRADO` si no existe o está inactivo; no revela datos de otras galerías | `GET /accesos/{codigo}` | HU-03 |
| Q-AUTH-02 | ObtenerEnlaceDeGaleria | galeriaId | codigo | `404` si la galería no tiene acceso | `GET /accesos?galeriaId={id}` | HU-02, HU-17 |
| Q-AUTH-03 | ObtenerFotografo | fotografoId | nombre, correo | `404 FOTOGRAFO_NO_ENCONTRADO` | `GET /fotografos/{id}` | HU-18 |

## Eventos que consume

| Evento | Reacción |
|---|---|
| `GaleriaEliminada` | Borra el enlace de acceso de esa galería (idempotente) |
