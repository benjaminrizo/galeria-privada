# Multistage build (capítulo 8, Guideline 6c): la imagen de producción lleva
# solo el binario compilado; la de desarrollo lleva el compilador y recarga en
# caliente. Se elige una u otra con "target:" en docker-compose.

# ---------------------------------------------------------------- compilación
FROM golang:1.23-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY *.go ./
# go mod tidy resuelve y fija las dependencias dentro de la imagen.
RUN go mod tidy && CGO_ENABLED=0 go build -ldflags="-s -w" -o /bin/ms-pagos .

# --------------------------------------------------------------- desarrollo
# Recarga en caliente: air vigila los archivos y recompila al guardar.
FROM golang:1.23-alpine AS dev
WORKDIR /app
RUN go install github.com/air-verse/air@latest
COPY go.mod ./
COPY *.go ./
RUN go mod tidy
EXPOSE 3006
CMD ["air", "-c", ".air.toml"]

# --------------------------------------------------------------- producción
FROM alpine:3.20 AS prod
RUN adduser -D -u 10001 aplicacion
COPY --from=build /bin/ms-pagos /usr/local/bin/ms-pagos
USER aplicacion
EXPOSE 3006
CMD ["ms-pagos"]
