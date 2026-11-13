#!/usr/bin/env bash
# Crea en GitHub todos los issues del backlog (épicas, historias de usuario e historias técnicas).
#
# Requisitos:
#   - GitHub CLI instalado (https://cli.github.com) y sesión iniciada: gh auth login
#   - Para añadirlos a un GitHub Project: gh auth refresh -s project
#
# Uso:
#   ./crear-issues.sh OWNER/REPO [NUMERO_DEL_PROYECTO]
# Ejemplo:
#   ./crear-issues.sh mi-usuario/galeria-privada 1

set -euo pipefail

REPO="${1:?Uso: ./crear-issues.sh OWNER/REPO [NUMERO_DEL_PROYECTO]}"
PROJECT="${2:-}"
OWNER="${REPO%%/*}"
cd "$(dirname "$0")"

echo "Creando etiquetas en $REPO..."
crear_etiqueta() { gh label create "$1" --repo "$REPO" --color "$2" --description "$3" --force >/dev/null; }
crear_etiqueta "epica"             "5319E7" "Épica"
crear_etiqueta "historia-usuario"  "1D76DB" "Historia de usuario"
crear_etiqueta "historia-tecnica"  "0E8A16" "Historia técnica"
crear_etiqueta "MVP"               "B60205" "Lo primero que se construye"
crear_etiqueta "Despues"           "FBCA04" "Si el MVP va bien"
crear_etiqueta "Extra"             "C5DEF5" "Solo si sobra tiempo"
for i in 1 2 3 4 5 6 7 8; do crear_etiqueta "E$i" "BFD4F2" "Pertenece a la épica $i"; done

echo "Creando issues..."
while IFS=$'\t' read -r id titulo etiquetas archivo; do
  [ -z "$id" ] && continue
  url=$(gh issue create --repo "$REPO" --title "$titulo" --body-file "$archivo" --label "$etiquetas")
  echo "  $id -> $url"
  if [ -n "$PROJECT" ]; then
    gh project item-add "$PROJECT" --owner "$OWNER" --url "$url" >/dev/null
  fi
done < manifest.tsv

echo "Listo."
