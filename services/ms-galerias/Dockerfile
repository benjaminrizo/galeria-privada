# Multistage build (capítulo 8, Guideline 6c).
#
#   target: dev   -> imagen con compilador y recarga en caliente, para trabajar
#   target: prod  -> imagen mínima, sin dependencias de desarrollo ni código
#                    fuente, ejecutable tal cual en Kubernetes o Swarm
#
# Se elige una u otra con "target:" en docker-compose.

# --------------------------------------------------------------- dependencias
FROM node:20-alpine AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------- compilación
FROM dependencias AS construccion
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

# ---------------------------------------------------------------- desarrollo
# El código se edita en el host y se ejecuta aquí (Guideline 6a): docker-compose
# monta ./src encima de /app/src, y tsc -w + node --watch recompilan y
# reinician solos al guardar (Guideline 6d).
FROM dependencias AS dev
WORKDIR /app
COPY tsconfig.json ./
COPY src ./src
ENV NODE_ENV=development
EXPOSE 3002
# El puerto 9229 queda abierto para enganchar el depurador de Node.
EXPOSE 9229
CMD ["npm", "run", "start:dev"]

# ---------------------------------------------------------------- producción
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S aplicacion && adduser -S aplicacion -G aplicacion
COPY --from=construccion /app/node_modules ./node_modules
COPY --from=construccion /app/dist ./dist
COPY --from=construccion /app/package.json ./
USER aplicacion
EXPOSE 3002
CMD ["node", "dist/main.js"]
