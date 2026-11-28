# Dos etapas (capítulo 8, Guideline 6c):
#
#   construccion -> tiene el compilador de Go. Es la imagen de trabajo.
#   prod         -> solo el binario, sobre Alpine. Pesa unos pocos megabytes.

FROM golang:1.23-alpine AS construccion
WORKDIR /app
COPY go.mod ./
COPY *.go ./
# go mod tidy resuelve y fija las dependencias dentro de la imagen.
RUN go mod tidy && go build -o /tmp/ms-pagos .
EXPOSE 3006
# En desarrollo el código se monta desde tu máquina. Go compila en segundo y
# medio, así que para ver un cambio basta con:  docker compose restart ms-pagos
CMD ["go", "run", "."]

FROM alpine:3.20 AS prod
COPY --from=construccion /tmp/ms-pagos /usr/local/bin/ms-pagos
# No corre como administrador.
RUN adduser -D aplicacion
USER aplicacion
EXPOSE 3006
CMD ["ms-pagos"]
