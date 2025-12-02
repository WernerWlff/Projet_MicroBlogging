# Dockerfile principal pour le monorepo MicroBlogging
# Ce Dockerfile peut être utilisé pour construire l'ensemble du projet
# ou comme base pour des builds personnalisés

FROM node:20-alpine AS base

# Installer OpenSSL et les dépendances nécessaires pour Prisma
# Prisma nécessite OpenSSL pour fonctionner correctement
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Installer Turbo globalement
RUN npm install -g turbo@^2.3.3

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

# Installer les dépendances (utiliser npm install pour régénérer le lock file si nécessaire)
RUN npm install

# Copier le reste des fichiers prunés
COPY --from=backend-builder /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.base.json tsconfig.base.json

# S'assurer que @prisma/client et prisma CLI sont installés avant de générer
# Prisma generate essaie d'installer @prisma/client automatiquement si ce n'est pas le cas
RUN cd /app && \
    echo "Installing @prisma/client and prisma CLI if needed..." && \
    npm install @prisma/client@6.1.0 prisma@6.1.0 --no-save --legacy-peer-deps && \
    echo "Verifying installation..." && \
    ls -la node_modules/@prisma/client/package.json 2>/dev/null && \
    ls -la node_modules/.bin/prisma 2>/dev/null && \
    echo "Prisma CLI version:" && \
    node_modules/.bin/prisma --version && \
    cd apps/backend && \
    echo "Generating Prisma client..." && \
    PRISMA_SKIP_POSTINSTALL_GENERATE=1 \
    PRISMA_OPENSSL_LIBRARY=/usr/lib/libssl.so.3 \
    PRISMA_OPENSSL_BINARY=/usr/bin/openssl \
    /app/node_modules/.bin/prisma generate

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

# Installer les dépendances (utiliser npm install pour régénérer le lock file si nécessaire)
RUN npm install

# Copier le reste des fichiers prunés
COPY --from=frontend-builder /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.base.json tsconfig.base.json

# Créer le dossier public s'il n'existe pas (Next.js en a besoin)
RUN mkdir -p ./apps/frontend/public

# Build du frontend
RUN turbo run build --filter=frontend...

# Vérifier la structure générée (debug)
RUN echo "=== Structure standalone ===" && \
    find /app/apps/frontend/.next/standalone -name "server.js" -type f 2>/dev/null && \
    echo "=== Contenu standalone ===" && \
    ls -la /app/apps/frontend/.next/standalone/ 2>/dev/null | head -15

# ============================================
# Stage final: Backend
# ============================================
FROM node:20-alpine AS backend
WORKDIR /app

# Installer OpenSSL, netcat et les dépendances nécessaires pour Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat netcat-openbsd

# Installer Prisma CLI globalement pour le script de démarrage
RUN npm install -g prisma@6.1.0

# Copier les fichiers buildés et nécessaires
# Vérifier que le build a bien créé dist/main.js
COPY --from=backend-installer /app/apps/backend/dist ./apps/backend/dist
COPY --from=backend-installer /app/apps/backend/package.json ./apps/backend/
COPY --from=backend-installer /app/node_modules ./node_modules
COPY --from=backend-installer /app/apps/backend/prisma ./apps/backend/prisma
# Copier le script de seed
COPY --from=backend-installer /app/apps/backend/prisma/seed.ts ./apps/backend/prisma/seed.ts
# Installer ts-node dans l'image finale pour pouvoir exécuter le seed
RUN npm install -g ts-node typescript
# Installer ts-node dans l'image finale pour pouvoir exécuter le seed
RUN npm install -g ts-node typescript

# Créer le script de démarrage qui attend la DB, génère Prisma et applique les migrations
RUN mkdir -p ./apps/backend && \
    echo '#!/bin/sh' > ./apps/backend/docker-entrypoint.sh && \
    echo 'set -e' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'cd /app/apps/backend' >> ./apps/backend/docker-entrypoint.sh && \
    echo '' >> ./apps/backend/docker-entrypoint.sh && \
    echo '# Générer le client Prisma si nécessaire' >> ./apps/backend/docker-entrypoint.sh && \
    echo '# Désactiver l''installation automatique de Prisma' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'export PRISMA_SKIP_POSTINSTALL_GENERATE=1' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'if [ ! -d "node_modules/.prisma/client" ]; then' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  echo "Generating Prisma client..."' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  if [ -f "/app/node_modules/.bin/prisma" ]; then' >> ./apps/backend/docker-entrypoint.sh && \
    echo '    PRISMA_OPENSSL_LIBRARY=/usr/lib/libssl.so.3 PRISMA_OPENSSL_BINARY=/usr/bin/openssl /app/node_modules/.bin/prisma generate;' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  else' >> ./apps/backend/docker-entrypoint.sh && \
    echo '    echo "Using global Prisma installation";' >> ./apps/backend/docker-entrypoint.sh && \
    echo '    PRISMA_OPENSSL_LIBRARY=/usr/lib/libssl.so.3 PRISMA_OPENSSL_BINARY=/usr/bin/openssl prisma generate;' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  fi' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'fi' >> ./apps/backend/docker-entrypoint.sh && \
    echo '' >> ./apps/backend/docker-entrypoint.sh && \
    echo '# Attendre que la base de données soit prête' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'echo "Waiting for database to be ready..."' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'until nc -z db 5432; do' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  echo "PostgreSQL is unavailable - sleeping"' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  sleep 1' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'done' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'echo "PostgreSQL is up - executing command"' >> ./apps/backend/docker-entrypoint.sh && \
    echo '' >> ./apps/backend/docker-entrypoint.sh && \
    echo '# Appliquer les migrations Prisma' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'echo "Running Prisma migrations..."' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'export PRISMA_SKIP_POSTINSTALL_GENERATE=1' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'if [ -f "/app/node_modules/.bin/prisma" ]; then' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  PRISMA_OPENSSL_LIBRARY=/usr/lib/libssl.so.3 PRISMA_OPENSSL_BINARY=/usr/bin/openssl /app/node_modules/.bin/prisma migrate deploy || echo "Migrations failed or already applied";' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'else' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  PRISMA_OPENSSL_LIBRARY=/usr/lib/libssl.so.3 PRISMA_OPENSSL_BINARY=/usr/bin/openssl prisma migrate deploy || echo "Migrations failed or already applied";' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'fi' >> ./apps/backend/docker-entrypoint.sh && \
    echo '' >> ./apps/backend/docker-entrypoint.sh && \
    echo '# Exécuter le seed si la base est vide (optionnel - commentez si vous ne voulez pas de données de test)' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'if [ "$RUN_SEED" = "true" ]; then' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  echo "Running Prisma seed..."' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  cd /app/apps/backend && PRISMA_OPENSSL_LIBRARY=/usr/lib/libssl.so.3 PRISMA_OPENSSL_BINARY=/usr/bin/openssl ts-node --transpile-only prisma/seed.ts || echo "Seed failed or already executed"' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'fi' >> ./apps/backend/docker-entrypoint.sh && \
    echo '' >> ./apps/backend/docker-entrypoint.sh && \
    echo '# Démarrer l''application' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'echo "Starting application..."' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'if [ -f "dist/main.js" ]; then' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  exec node dist/main.js' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'elif [ -f "dist/src/main.js" ]; then' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  exec node dist/src/main.js' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'elif [ -f "dist/main" ]; then' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  exec node dist/main' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'else' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  echo "Error: dist/main.js or dist/main not found"' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  echo "Files in dist/:"' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  ls -laR dist/ 2>/dev/null || echo "dist/ directory does not exist"' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  echo "Trying to find main.js..."' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  find . -name "main.js" -type f 2>/dev/null' >> ./apps/backend/docker-entrypoint.sh && \
    echo '  exit 1' >> ./apps/backend/docker-entrypoint.sh && \
    echo 'fi' >> ./apps/backend/docker-entrypoint.sh && \
    chmod +x ./apps/backend/docker-entrypoint.sh

WORKDIR /app/apps/backend
CMD ["./docker-entrypoint.sh"]

# ============================================
# Stage final: Frontend
# ============================================
FROM node:20-alpine AS frontend
WORKDIR /app

# Copier le contenu de standalone (qui contient déjà la structure complète)
# En mode standalone, Next.js crée: .next/standalone/ avec la structure complète
# La structure peut être: standalone/apps/frontend/server.js ou standalone/server.js
COPY --from=frontend-installer /app/apps/frontend/.next/standalone ./

# Copier les fichiers statiques - Next.js standalone les met dans standalone/.next/static
# Mais on doit aussi les copier à la racine ET dans apps/frontend/.next/static pour que le serveur les trouve
COPY --from=frontend-installer /app/apps/frontend/.next/static ./.next/static
# Copier aussi dans apps/frontend/.next/static si le serveur s'exécute depuis apps/frontend/
RUN mkdir -p ./apps/frontend/.next && \
    cp -r ./.next/static ./apps/frontend/.next/static 2>/dev/null || true

# Créer le dossier public (sera vide si le dossier source n'existe pas)
RUN mkdir -p ./public

# Script de démarrage qui trouve server.js et s'assure que les fichiers statiques sont accessibles
# En mode standalone monorepo, la structure est généralement: apps/frontend/server.js
# Next.js cherche les fichiers statiques à .next/static depuis le répertoire où server.js s'exécute
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'if [ -f "/app/apps/frontend/server.js" ]; then' >> /app/start.sh && \
    echo '  cd /app/apps/frontend' >> /app/start.sh && \
    echo '  # Créer un lien symbolique vers les fichiers statiques depuis la racine' >> /app/start.sh && \
    echo '  if [ ! -d ".next/static" ] && [ -d "/app/.next/static" ]; then' >> /app/start.sh && \
    echo '    ln -sf /app/.next/static ./.next/static' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '  # Vérifier que les fichiers statiques sont accessibles' >> /app/start.sh && \
    echo '  if [ -d ".next/static" ]; then' >> /app/start.sh && \
    echo '    echo "Static files found at .next/static"' >> /app/start.sh && \
    echo '  else' >> /app/start.sh && \
    echo '    echo "Warning: Static files not found at .next/static"' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '  exec node server.js' >> /app/start.sh && \
    echo 'elif [ -f "/app/server.js" ]; then' >> /app/start.sh && \
    echo '  cd /app' >> /app/start.sh && \
    echo '  exec node server.js' >> /app/start.sh && \
    echo 'else' >> /app/start.sh && \
    echo '  echo "Error: server.js not found"' >> /app/start.sh && \
    echo '  echo "Searching for server.js..."' >> /app/start.sh && \
    echo '  find /app -name "server.js" -type f 2>/dev/null' >> /app/start.sh && \
    echo '  echo "Contents of /app:"' >> /app/start.sh && \
    echo '  ls -la /app' >> /app/start.sh && \
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

# Installer les dépendances (utiliser npm install pour régénérer le lock file si nécessaire)
RUN npm install

# Copier le reste des fichiers
COPY . .

# Build complet
RUN turbo run build

CMD ["npm", "run", "dev"]

