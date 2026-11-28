#!/usr/bin/env bash
# Exporta el contrato OpenAPI de cada servicio a su propio docs/api.yml.
#
# El contrato se GENERA desde el codigo con los decoradores de NestJS, no se
# escribe a mano: asi no puede quedar desactualizado respecto a lo que el
# servicio hace de verdad. Este script solo lo vuelca a un archivo para que
# quede versionado en cada repositorio.
#
# Requiere el sistema levantado:  make start
#
# Uso:  bash scripts/exportar-contratos.sh   (o: make contratos)

set -uo pipefail
cd "$(dirname "$0")/.."

declare -A COMPONENTES=(
  [services/ms-auth]=3001
  [services/ms-galerias]=3002
  [services/ms-media]=3003
  [services/ms-seleccion]=3004
  [services/ms-notificaciones]=3005
  [gateway]=3000
)

convertir() {
  if command -v python3 >/dev/null 2>&1; then
    python3 -c "import sys,json,yaml; yaml.safe_dump(json.load(sys.stdin), sys.stdout, allow_unicode=True, sort_keys=False)" 2>/dev/null && return 0
  fi
  cat   # sin PyYAML se guarda el JSON tal cual: OpenAPI admite los dos formatos
}

fallos=0
for ruta in "${!COMPONENTES[@]}"; do
  puerto="${COMPONENTES[$ruta]}"
  printf "  %-30s " "$ruta"

  json=$(curl -sf --max-time 10 "http://localhost:$puerto/docs-json" || true)
  if [ -z "$json" ]; then
    echo "sin respuesta en el puerto $puerto (levanta el sistema con 'make start')"
    fallos=$((fallos + 1))
    continue
  fi

  mkdir -p "$ruta/docs"
  echo "$json" | convertir > "$ruta/docs/api.yml"
  echo "docs/api.yml  ($(wc -c < "$ruta/docs/api.yml") bytes)"
done

echo
echo "ms-pagos esta en Go y mantiene su api.yml a mano: services/ms-pagos/docs/api.yml"
[ "$fallos" -eq 0 ] && echo "Contratos exportados." || echo "Faltaron $fallos; comprueba que el sistema este levantado."
