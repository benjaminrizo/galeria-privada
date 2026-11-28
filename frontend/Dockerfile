# Multistage build (capítulo 8, Guideline 6c).
#
#   target: dev   -> servidor de desarrollo de Vite con recarga en caliente
#   target: prod  -> los archivos estáticos servidos por nginx

# --------------------------------------------------------------- dependencias
FROM node:20-alpine AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------- desarrollo
FROM dependencias AS dev
WORKDIR /app
COPY vite.config.js index.html ./
COPY src ./src
EXPOSE 5173
# --host para que el servidor sea visible desde fuera del contenedor.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# ---------------------------------------------------------------- compilación
FROM dependencias AS construccion
COPY vite.config.js index.html ./
COPY src ./src
RUN npm run build

# ---------------------------------------------------------------- producción
FROM nginx:1.25-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=construccion /app/dist /usr/share/nginx/html
EXPOSE 80
