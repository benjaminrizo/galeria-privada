# Dos etapas (capítulo 8, Guideline 6c):
#
#   construccion -> Vite con recarga en caliente. Es la imagen de trabajo.
#   prod         -> los archivos estáticos servidos por nginx.

FROM node:20-alpine AS construccion
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY vite.config.js index.html ./
COPY src ./src
RUN npm run build
EXPOSE 80
# Mismo puerto que nginx, para que la dirección no cambie entre modos.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "80"]

FROM nginx:1.25-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=construccion /app/dist /usr/share/nginx/html
EXPOSE 80
