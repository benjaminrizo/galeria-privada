#!/usr/bin/env bash
# Crea en GitHub todo el backlog: etiquetas, hitos, las 8 épicas, las 20
# historias de usuario y las 12 historias técnicas.
#
# Cada historia queda enlazada a su épica con "Parte de #N", así que GitHub
# muestra la relación en los dos sentidos, y se agrupa en un hito según su
# prioridad.
#
# Requisitos:
#   - GitHub CLI instalado (https://cli.github.com) y sesión iniciada: gh auth login
#   - Para añadirlos a un GitHub Project: gh auth refresh -s project,read:project
#
# Uso:
#   ./crear-issues.sh OWNER/REPO [NUMERO_DEL_PROYECTO]
# Ejemplo:
#   ./crear-issues.sh benjaminrizo/galeria-privada 1
#
# Ojo: ejecutarlo dos veces crea los issues por duplicado.

set -euo pipefail

REPO="${1:?Uso: ./crear-issues.sh OWNER/REPO [NUMERO_DEL_PROYECTO]}"
PROJECT="${2:-}"
OWNER="${REPO%%/*}"
cd "$(dirname "$0")"

# ------------------------------------------------------------------ etiquetas
echo "Creando etiquetas en $REPO..."
crear_etiqueta() { gh label create "$1" --repo "$REPO" --color "$2" --description "$3" --force >/dev/null; }
crear_etiqueta "epica"             "5319E7" "Épica"
crear_etiqueta "historia-usuario"  "1D76DB" "Historia de usuario"
crear_etiqueta "historia-tecnica"  "0E8A16" "Historia técnica"
crear_etiqueta "MVP"               "B60205" "Lo primero que se construye"
crear_etiqueta "Despues"           "FBCA04" "Si el MVP va bien"
crear_etiqueta "Extra"             "C5DEF5" "Solo si sobra tiempo"
for i in 1 2 3 4 5 6 7 8; do crear_etiqueta "E$i" "BFD4F2" "Pertenece a la épica $i"; done

# ---------------------------------------------------------------------- hitos
# Agrupan el backlog por prioridad y dan la barra de progreso del repositorio.
echo "Creando hitos..."
crear_hito() {
  gh api "repos/$REPO/milestones" -f title="$1" -f description="$2" >/dev/null 2>&1 \
    || echo "  (el hito «$1» ya existía)"
}
crear_hito "MVP"     "Lo primero que se construye"
crear_hito "Después" "Si el MVP va bien"
crear_hito "Extra"   "Solo si sobra tiempo"

hito_de() {
  case "$1" in
    *MVP*)     echo "MVP" ;;
    *Despues*) echo "Después" ;;
    *Extra*)   echo "Extra" ;;
    *)         echo "" ;;
  esac
}

al_proyecto() {
  [ -z "$PROJECT" ] && return 0
  gh project item-add "$PROJECT" --owner "$OWNER" --url "$1" >/dev/null
}

# --------------------------------------------------------------------- épicas
# Van primero para conocer su número y poder enlazarlas desde cada historia.
echo "Creando las épicas..."
declare -A NUMERO_EPICA

while IFS=$'\t' read -r id titulo etiquetas archivo; do
  [ -z "$id" ] && continue
  case "$id" in E[0-9]) ;; *) continue ;; esac

  url=$(gh issue create --repo "$REPO" --title "$titulo" --body-file "$archivo" --label "$etiquetas")
  NUMERO_EPICA["$id"]="${url##*/}"
  echo "  $id -> $url"
  al_proyecto "$url"
done < manifest.tsv

# ------------------------------------------------------------------ historias
echo "Creando las historias..."
cuerpo=$(mktemp)
trap 'rm -f "$cuerpo"' EXIT

while IFS=$'\t' read -r id titulo etiquetas archivo; do
  [ -z "$id" ] && continue
  case "$id" in E[0-9]) continue ;; esac

  # El archivo empieza con su título ("# HU-01 · ..."), que sirve para
  # identificarlo en el repositorio. En el issue sobra, porque ya es el título
  # del propio issue, así que se quita del cuerpo.
  sed '1{/^# /d}' "$archivo" | sed '/./,$!d' > "$cuerpo"

  # La etiqueta E1..E8 dice a qué épica pertenece: se añade el enlace al issue.
  epica=$(echo "$etiquetas" | tr ',' '\n' | grep -E '^E[0-9]$' || true)
  if [ -n "$epica" ] && [ -n "${NUMERO_EPICA[$epica]:-}" ]; then
    printf '\n---\n\nParte de #%s\n' "${NUMERO_EPICA[$epica]}" >> "$cuerpo"
  fi

  hito=$(hito_de "$etiquetas")
  if [ -n "$hito" ]; then
    url=$(gh issue create --repo "$REPO" --title "$titulo" --body-file "$cuerpo" \
            --label "$etiquetas" --milestone "$hito")
  else
    url=$(gh issue create --repo "$REPO" --title "$titulo" --body-file "$cuerpo" \
            --label "$etiquetas")
  fi

  echo "  $id -> $url"
  al_proyecto "$url"
done < manifest.tsv

echo
echo "Listo: 8 épicas, 20 historias de usuario y 12 historias técnicas."
echo "  https://github.com/$REPO/issues"
