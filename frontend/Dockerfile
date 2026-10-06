# Étape 1 : Build (compilation React)

FROM node:20-alpine AS build
WORKDIR /app

# Copier les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Compiler l'app React (génère le dossier /dist)
RUN npm run build

# Étape 2 : Runtime (serveur Nginx)

FROM nginx:alpine

# Copier la config Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers compilés 
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]