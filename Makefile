# Repositorio sombrilla: targets del SISTEMA COMPLETO.
# Cada componente tiene ademas su propio Makefile con los mismos nombres
# (capitulo 8, Guideline 10).
.PHONY: start dev stop build test lint clean logs ps health migrate clonar help
.DEFAULT_GOAL := help

COMPONENTES := services/ms-auth services/ms-galerias services/ms-media \
               services/ms-seleccion services/ms-notificaciones \
               services/ms-pagos gateway frontend

start:   ## Levanta todo el sistema (imagenes de produccion)
	docker compose up -d --build

dev:     ## Levanta todo en modo desarrollo, con recarga en caliente
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

stop:    ## Detiene el sistema
	docker compose down

build:   ## Construye las imagenes de produccion de todos los componentes
	docker compose build

test:    ## Ejecuta las pruebas de todos los componentes
	@for c in $(COMPONENTES); do echo "== $$c =="; $(MAKE) -C $$c test || exit 1; done

lint:    ## Analisis estatico de todos los componentes
	@for c in $(COMPONENTES); do echo "== $$c =="; $(MAKE) -C $$c lint || exit 1; done

clean:   ## Borra contenedores, volumenes e imagenes del sistema
	docker compose down -v --remove-orphans

logs:    ## Muestra los logs de todo el sistema
	docker compose logs -f

ps:      ## Que contenedores estan corriendo
	docker compose ps

health:  ## Comprueba la salud de cada servicio
	@for p in 3000 3001 3002 3003 3004 3005 3006; do \
		printf "  puerto %s  " $$p; \
		curl -s -o /dev/null -w "%{http_code}\n" http://localhost:$$p/health || echo "sin respuesta"; \
	done

migrate: ## Las migraciones se aplican solas al arrancar cada servicio
	@echo "Cada servicio aplica sus migraciones al arrancar (migrationsRun)."
	@echo "Para forzarlas: make stop && make clean && make start"

clonar:  ## Clona los 8 repositorios de los componentes
	bash scripts/clonar.sh

help:    ## Muestra esta ayuda
	@grep -E '^[a-z-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'
