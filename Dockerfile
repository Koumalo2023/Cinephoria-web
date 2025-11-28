# Étape 1 : Image de build
FROM node:18-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration package
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production --legacy-peer-deps

# Copier le reste du code source
COPY . .

# Construire l'application Angular
RUN npm run build:production

# Étape 2 : Image runtime avec Nginx
FROM nginx:alpine AS runtime

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers construits depuis l'étape de build
COPY --from=build /app/dist/cinephoria-web /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Définir les variables d'environnement
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d

# Health check pour Nginx
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]