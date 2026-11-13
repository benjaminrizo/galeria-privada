FROM node:20-alpine

WORKDIR /app

# Las dependencias se instalan primero para aprovechar la caché de Docker.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

CMD ["node", "dist/main.js"]
