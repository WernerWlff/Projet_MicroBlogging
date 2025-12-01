#!/bin/sh
set -e

# Générer le client Prisma si nécessaire
if [ ! -d "node_modules/.prisma/client" ]; then
  echo "Generating Prisma client..."
  npx prisma generate
fi

# Appliquer les migrations si nécessaire (optionnel)
# npx prisma migrate deploy

# Lancer l'application
exec node dist/main

