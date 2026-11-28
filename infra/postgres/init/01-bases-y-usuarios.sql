-- Una base de datos por servicio, cada una con su propio usuario (RNF-15, ADR 0003).
-- Un servicio solo tiene credenciales de su base, así que no puede leer las
-- tablas de otro aunque compartan el mismo contenedor de PostgreSQL.
--
-- Este script lo ejecuta PostgreSQL la primera vez que se crea el volumen.

CREATE USER auth_user          WITH PASSWORD 'auth_pass';
CREATE USER galerias_user      WITH PASSWORD 'galerias_pass';
CREATE USER media_user         WITH PASSWORD 'media_pass';
CREATE USER seleccion_user     WITH PASSWORD 'seleccion_pass';
CREATE USER notificaciones_user WITH PASSWORD 'notificaciones_pass';

CREATE DATABASE auth_db           OWNER auth_user;
CREATE DATABASE galerias_db       OWNER galerias_user;
CREATE DATABASE media_db          OWNER media_user;
CREATE DATABASE seleccion_db      OWNER seleccion_user;
CREATE DATABASE notificaciones_db OWNER notificaciones_user;

-- La extensión de UUID la instala el superusuario en cada base, porque es la
-- que genera las claves primarias.
\connect auth_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT ALL ON SCHEMA public TO auth_user;

\connect galerias_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT ALL ON SCHEMA public TO galerias_user;

\connect media_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT ALL ON SCHEMA public TO media_user;

\connect seleccion_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT ALL ON SCHEMA public TO seleccion_user;

\connect notificaciones_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT ALL ON SCHEMA public TO notificaciones_user;

