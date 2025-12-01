# Dockerfile principal pour le monorepo MicroBlogging
# Ce Dockerfile peut être utilisé pour construire l'ensemble du projet
# ou comme base pour des builds personnalisés

FROM node:18-alpine AS base

# Installer OpenSSL et les dépendances nécessaires pour Prisma
# Prisma nécessite OpenSSL pour fonctionner correctement
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Installer Turbo globalement
RUN npm install -g turbo@^1.11.2

# ============================================
# Stage: Backend Builder
# ============================================
FROM base AS backend-builder
WORKDIR /app

# Copier tous les fichiers pour turbo prune
COPY . .

# Pruner le monorepo pour isoler le backend
RUN turbo prune --scope=backend --docker

# ============================================
# Stage: Backend Installer
# ============================================
FROM base AS backend-installer
WORKDIR /app

# Copier les fichiers prunés
COPY --from=backend-builder /app/out/json/ .
COPY --from=backend-builder /app/out/package-lock.json ./package-lock.json

# Installer les dépendances
RUN npm ci

# Copier le reste des fichiers prunés
COPY --from=backend-builder /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.base.json tsconfig.base.json

# Générer le client Prisma avec OpenSSL 3.x
RUN cd apps/backend && PRISMA_OPENSSL_LIBRARY=/usr/lib/libssl.so.3 PRISMA_OPENSSL_BINARY=/usr/bin/openssl npx prisma generate

# Build du backend
RUN turbo run build --filter=backend...

# ============================================
# Stage: Frontend Builder
# ============================================
FROM base AS frontend-builder
WORKDIR /app

# Copier tous les fichiers pour turbo prune
COPY . .

# Pruner le monorepo pour isoler le frontend
RUN turbo prune --scope=frontend --docker

# ============================================
# Stage: Frontend Installer
# ============================================
FROM base AS frontend-installer
WORKDIR /app

# Copier les fichiers prunés
COPY --from=frontend-builder /app/out/json/ .
COPY --from=frontend-builder /app/out/package-lock.json ./package-lock.json

# Installer les dépendances
RUN npm ci

# Copier le reste des fichiers prunés
COPY --from=frontend-builder /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.base.json tsconfig.base.json

# Créer le dossier public s'il n'existe pas (Next.js en a besoin)
RUN mkdir -p ./apps/frontend/public

# Build du frontend
RUN turbo run build --filter=frontend...

# Vérifier la structure générée (pour debug)
RUN echo "=== Structure .next/standalone ===" && \
    ls -la /app/apps/frontend/.next/standalone/ 2>/dev/null || echo "standalone not found" && \
    find /app/apps/frontend/.next/standalone -name "server.js" -type f 2>/dev/null || echo "server.js not found in standalone"

# ============================================
# Stage final: Backend
# ============================================
FROM node:18-alpine AS backend
WORKDIR /app

# Installer OpenSSL, netcat et les dépendances nécessaires pour Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat netcat-openbsd

# Installer Prisma CLI globalement pour le script de démarrage
RUN npm install -g prisma@^5.0.0

# Copier les fichiers buildés et nécessaires
COPY --from=backend-installer /app/apps/backend/dist ./apps/backend/dist
COPY --from=backend-installer /app/apps/backend/package.json ./apps/backend/
COPY --from=backend-installer /app/node_modules ./node_modules
COPY --from=backend-installer /app/apps/backend/prisma ./apps/backend/prisma

# Copier le script wait-for-db depuis le stage installer
COPY --from=backend-installer /app/apps/backend/wait-for-db.sh ./apps/backend/wait-for-db.sh
RUN chmod +x ./apps/backend/wait-for-db.sh

# Créer le script de démarrage qui attend la DB, génère Prisma et applique les migrations
RUN mkdir -p ./apps/backend && \
    echo '#!/bin/sh' > ./apps/backend/docker-entrypoint.sh && \
    echo 'set -e' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'cd /app/apps/backend' >> ./apps/backend/docker-entrypoint.sh && \
    echo '' >> ./apps/backend/docker-entrypoint.sh && \
    echo '# Générer le client Prisma si nécessaire' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'if [ ! -d "node_modules/.prisma/client" ]; then' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  echo "Generating Prisma client..."' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  PRISMA_OPENSSL_LIBRARY=/usr/lib/libssl.so.3 PRISMA_OPENSSL_BINARY=/usr/bin/openssl npx prisma generate' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'fi' >> ./apps/backend/docker-entrypoint.sh && \
    echo '' >> ./apps/backend/docker-entrypoint.sh && \
    echo '# Attendre que la base de données soit prête' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'echo "Waiting for database to be ready..."' >> ./apps/backend/docker-entrypoint.sh && \
    echo './wait-for-db.sh db 5432 sh -c "echo Database is ready!"' >> ./apps/backend/docker-entrypoint.sh && \
    echo '' >> ./apps/backend/docker-entrypoint.sh && \
    echo '# Appliquer les migrations Prisma' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'echo "Running Prisma migrations..."' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'PRISMA_OPENSSL_LIBRARY=/usr/lib/libssl.so.3 PRISMA_OPENSSL_BINARY=/usr/bin/openssl npx prisma migrate deploy || echo "Migrations failed or already applied"' >> ./apps/backend/docker-entrypoint.sh && \
    echo '' >> ./apps/backend/docker-entrypoint.sh && \
    echo '# Démarrer l''application' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'echo "Starting application..."' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'exec node dist/main' >> ./apps/backend/docker-entrypoint.sh && \
    chmod +x ./apps/backend/docker-entrypoint.sh

WORKDIR /app/apps/backend
CMD ["./docker-entrypoint.sh"]

# ============================================
# Stage final: Frontend
# ============================================
FROM node:18-alpine AS frontend
WORKDIR /app

# Copier les fichiers buildés Next.js standalone
# Next.js standalone crée: .next/standalone/ avec server.js à l'intérieur
# On copie le contenu de standalone à la racine
COPY --from=frontend-installer /app/apps/frontend/.next/standalone ./

# Copier les fichiers statiques (Next.js les attend à .next/static par rapport au serveur)
COPY --from=frontend-installer /app/apps/frontend/.next/static ./.next/static

# Créer le dossier public (Next.js les attend à public/)
RUN mkdir -p ./public

# Créer un script de démarrage qui trouve server.js
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "Looking for server.js..."' >> /app/start.sh && \
    echo 'if [ -f "/app/server.js" ]; then' >> /app/start.sh && \
    echo '  echo "Found server.js at /app/server.js"' >> /app/start.sh && \
    echo '  cd /app && exec node server.js' >> /app/start.sh && \
    echo 'elif [ -f "/app/apps/frontend/server.js" ]; then' >> /app/start.sh && \
    echo '  echo "Found server.js at /app/apps/frontend/server.js"' >> /app/start.sh && \
    echo '  cd /app/apps/frontend && exec node server.js' >> /app/start.sh && \
    echo 'elif [ -f "/app/.next/standalone/server.js" ]; then' >> /app/start.sh && \
    echo '  echo "Found server.js at /app/.next/standalone/server.js"' >> /app/start.sh && \
    echo '  cd /app/.next/standalone && exec node server.js' >> /app/start.sh && \
    echo 'else' >> /app/start.sh && \
    echo '  echo "Error: server.js not found. Listing /app:"' >> /app/start.sh && \
    echo '  ls -la /app' >> /app/start.sh && \
    echo '  echo "Listing /app/.next:"' >> /app/start.sh && \
    echo '  ls -la /app/.next 2>/dev/null || echo ".next not found"' >> /app/start.sh && \
    echo '  find /app -name "server.js" -type f 2>/dev/null || echo "No server.js found"' >> /app/start.sh && \
    echo '  exit 1' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    chmod +x /app/start.sh

WORKDIR /app
CMD ["/app/start.sh"]

# ============================================
# Stage par défaut: Build complet
# ============================================
FROM base AS default
WORKDIR /app

# Copier les fichiers de configuration
COPY package.json package-lock.json* ./
COPY turbo.json ./
COPY tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

# Installer les dépendances
RUN npm ci

# Copier le reste des fichiers
COPY . .

# Build complet
RUN turbo run build

CMD ["npm", "run", "dev"]

