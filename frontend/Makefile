# Targets estandarizados (capitulo 8, Guideline 10).
# Son los mismos en los 9 repositorios, sin importar el lenguaje: quien cambia
# de equipo no tiene que aprender comandos nuevos.
.PHONY: start stop build test lint clean logs migrate help
.DEFAULT_GOAL := help

start:   ## Levanta el servicio con sus dependencias
	docker compose up -d --build

stop:    ## Detiene el servicio
	docker compose down

build:   ## Construye la imagen de produccion
	docker build --target prod -t frontend:latest .

test:    ## Ejecuta las pruebas con cobertura
	npm test

lint:    ## Analisis estatico
	npm run lint

clean:   ## Borra contenedores, volumenes y artefactos de compilacion
	docker compose down -v
	rm -rf dist node_modules coverage

logs:    ## Muestra los logs
	docker compose logs -f frontend

migrate: ## Migraciones de base de datos
	@echo "Este componente no tiene base de datos propia: no hay migraciones que aplicar."

help:    ## Muestra esta ayuda
	@grep -E '^[a-z-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'
