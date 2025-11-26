# Étape 1 : Builder (TypeScript → JavaScript)
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# Étape 2 : Runner (image plus légère)
FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copier uniquement le dist
COPY --from=builder /app/dist ./dist

EXPOSE 10000

CMD ["node", "dist/index.js"]
