FROM node:20

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Exposer le port paramétré
EXPOSE 5000

# Commande de démarrage
CMD ["node", "dist/index.js"]
