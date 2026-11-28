# Targets estandarizados (capítulo 8, Guideline 10).
# Son los mismos en los 9 repositorios, sin importar el lenguaje.
.PHONY: start stop build test lint clean logs migrate help
.DEFAULT_GOAL := help

start:   ## Levanta el servicio con su base de datos
	docker compose up -d --build

stop:    ## Detiene el servicio
	docker compose down

build:   ## Construye la imagen de producción
	docker build --target prod -t ms-pagos:latest .

test:    ## Ejecuta las pruebas
	go test -cover ./...

lint:    ## Análisis estático
	go vet ./...
	gofmt -l .

clean:   ## Borra contenedores, volúmenes y artefactos
	docker compose down -v
	rm -rf tmp

logs:    ## Muestra los logs
	docker compose logs -f ms-pagos

migrate: ## MongoDB no necesita migraciones de esquema
	@echo "ms-pagos usa MongoDB (sin esquema fijo): no hay migraciones que aplicar."

help:
	@grep -E '^[a-z-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'
