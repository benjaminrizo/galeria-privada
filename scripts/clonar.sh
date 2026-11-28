#!/usr/bin/env bash
# Clona los 8 repositorios de los componentes dentro de este repositorio
# sombrilla, en las rutas que espera el docker-compose.
#
# El sombrilla no contiene el codigo de los servicios: cada uno vive en su
# propio repositorio y aqui estan ignorados por .gitignore (capitulo 9,
# umbrella project).
#
# Uso:  bash scripts/clonar.sh [NOMBRE-DE-LA-ORG]

set -euo pipefail
ORG="${1:-${GALERIA_ORG:-}}"

if [ -z "$ORG" ]; then
  echo "Falta la organizacion. Uso: bash scripts/clonar.sh NOMBRE-DE-LA-ORG" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

clonar() {
  local repo="$1" destino="$2"
  if [ -d "$destino/.git" ]; then
    echo "  $destino ya estaba clonado; se actualiza"
    git -C "$destino" pull --ff-only
  else
    echo "  clonando $repo en $destino"
    git clone "https://github.com/$ORG/$repo.git" "$destino"
  fi
}

mkdir -p services
clonar ms-auth           services/ms-auth
clonar ms-galerias       services/ms-galerias
clonar ms-media          services/ms-media
clonar ms-seleccion      services/ms-seleccion
clonar ms-notificaciones services/ms-notificaciones
clonar ms-pagos          services/ms-pagos
clonar gateway           gateway
clonar frontend          frontend

echo
echo "Listo. Ahora:  make start"
