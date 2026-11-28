# Dos etapas (capítulo 8, Guideline 6c):
#
#   construccion -> tiene el compilador y todas las dependencias.
#                   Es la imagen con la que se TRABAJA.
#   prod         -> solo lo necesario para ejecutar.
#                   Es la imagen que se DESPLIEGA.
#
# Se elige una u otra con "target:" en docker-compose.

FROM node:20-alpine AS construccion
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
EXPOSE 3003
# En desarrollo el código se monta desde tu máquina y esto lo recompila y
# reinicia al guardar (Guideline 6a y 6d).
CMD ["npm", "run", "start:dev"]

FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=construccion /app/dist ./dist
# No corre como administrador.
RUN adduser -D aplicacion
USER aplicacion
EXPOSE 3003
CMD ["node", "dist/main.js"]
