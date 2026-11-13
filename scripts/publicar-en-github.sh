#!/usr/bin/env bash
#
# Publica el proyecto en GitHub en un solo paso:
#
#   1. Sube el código al repositorio.
#   2. Comparte el repositorio con un colaborador.
#   3. Crea el backlog como Issues y las añade a un GitHub Project.
#
# Requisitos (en la máquina de quien lo ejecuta, no en el repositorio):
#   - GitHub CLI: https://cli.github.com
#   - Sesión iniciada con permisos de proyectos:
#       gh auth login
#       gh auth refresh -s project,read:project
#
# Uso:
#   ./scripts/publicar-en-github.sh [OWNER/REPO] [USUARIO_COLABORADOR]
#
# Por defecto usa el repositorio del equipo y el usuario del profesor:
#   ./scripts/publicar-en-github.sh benjaminrizo/galeria-privada CapitanFantastico
#
# Cada paso se puede repetir sin problema, menos la creación de Issues: si se
# ejecuta dos veces, las crea otra vez. Para publicar solo el backlog:
#   SALTAR_CODIGO=1 SALTAR_COLABORADOR=1 ./scripts/publicar-en-github.sh

set -euo pipefail

REPO="${1:-benjaminrizo/galeria-privada}"
COLABORADOR="${2:-CapitanFantastico}"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
RAMA="${RAMA:-main}"

cd "$RAIZ"

echo "Repositorio: $REPO"
echo "Colaborador: $COLABORADOR"
echo

# ---------------------------------------------------------------- comprobaciones
if ! command -v gh >/dev/null 2>&1; then
  echo "Falta GitHub CLI. Instálalo desde https://cli.github.com y vuelve a ejecutar." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "No hay sesión de GitHub. Ejecuta: gh auth login" >&2
  exit 1
fi

if ! gh repo view "$REPO" >/dev/null 2>&1; then
  echo "No se puede ver $REPO. Revisa el nombre o si creaste el repositorio." >&2
  echo "Para crearlo:  gh repo create $REPO --private --source=. --remote=origin" >&2
  exit 1
fi

# ---------------------------------------------------------------- 1 · el código
if [ -z "${SALTAR_CODIGO:-}" ]; then
  echo "1 · Subiendo el código…"

  [ -d .git ] || git init -q

  if git remote get-url origin >/dev/null 2>&1; then
    git remote set-url origin "https://github.com/$REPO.git"
  else
    git remote add origin "https://github.com/$REPO.git"
  fi

  git branch -M "$RAMA" 2>/dev/null || git checkout -q -B "$RAMA"

  if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -q -m "Primer avance del proyecto: documentación e implementación de los microservicios"
  fi

  # Si el repositorio ya tenía algo, se integra antes de subir.
  if git ls-remote --exit-code --heads origin "$RAMA" >/dev/null 2>&1; then
    echo "   La rama $RAMA ya existe en el repositorio; se integra lo que hay."
    git fetch -q origin "$RAMA"
    git pull -q --rebase origin "$RAMA" || {
      echo "   Hay conflictos con lo que ya estaba en el repositorio." >&2
      echo "   Resuélvelos y termina con: git rebase --continue && git push origin $RAMA" >&2
      exit 1
    }
  fi

  git push -u origin "$RAMA"
  echo "   Listo: https://github.com/$REPO"
  echo
fi

# ---------------------------------------------------------------- 2 · colaborador
if [ -z "${SALTAR_COLABORADOR:-}" ]; then
  echo "2 · Compartiendo el repositorio con $COLABORADOR…"

  if gh api -X PUT "repos/$REPO/collaborators/$COLABORADOR" -f permission=push >/dev/null 2>&1; then
    echo "   Invitación enviada (permiso de escritura). Tiene que aceptarla."
  else
    echo "   No se pudo invitar a '$COLABORADOR'." >&2
    echo "   Comprueba que el usuario de GitHub se escriba exactamente así," >&2
    echo "   o invítalo a mano en: https://github.com/$REPO/settings/access" >&2
  fi
  echo
fi

# ---------------------------------------------------------------- 3 · el backlog
if [ -z "${SALTAR_BACKLOG:-}" ]; then
  echo "3 · Creando el backlog como Issues…"

  PROYECTO="${PROYECTO:-}"

  if [ -z "$PROYECTO" ]; then
    OWNER="${REPO%%/*}"
    echo "   Creando el GitHub Project «Galería Privada»…"
    PROYECTO=$(gh project create --owner "$OWNER" --title "Galería Privada" --format json 2>/dev/null \
      | sed -n 's/.*"number":\([0-9]*\).*/\1/p') || true

    if [ -z "$PROYECTO" ]; then
      echo "   No se pudo crear el proyecto (suele faltar el permiso 'project')."
      echo "   Ejecuta: gh auth refresh -s project,read:project"
      echo "   Las Issues se crean igual, sin añadirlas a ningún proyecto."
    else
      echo "   Proyecto número $PROYECTO"
    fi
  fi

  # El script del backlog crea las etiquetas, las 8 épicas, las 20 historias de
  # usuario y las 12 historias técnicas, con su texto y sus criterios Gherkin.
  ./docs/Backlog/crear-issues.sh "$REPO" ${PROYECTO:+"$PROYECTO"}
  echo
fi

echo "Todo publicado."
echo "  Código:  https://github.com/$REPO"
echo "  Issues:  https://github.com/$REPO/issues"
