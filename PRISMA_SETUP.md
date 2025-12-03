# Configuration Prisma - Projet MicroBlogging

## 📋 Fichiers de configuration

### Schema Prisma
Le fichier `apps/backend/prisma/schema.prisma` contient la définition des modèles de données.

### Variables d'environnement
La variable `DATABASE_URL` doit être définie dans `docker-compose.yml` ou dans un fichier `.env`.

Format : `postgresql://user:password@host:port/database?schema=public`

## 🚀 Commandes Prisma utiles

### Générer le client Prisma
```bash
cd apps/backend
npx prisma generate
```

### Créer une migration
```bash
cd apps/backend
npx prisma migrate dev --name nom_de_la_migration
```

### Appliquer les migrations (production)
```bash
cd apps/backend
npx prisma migrate deploy
```

### Voir la base de données avec Prisma Studio
```bash
cd apps/backend
npx prisma studio
```

### Réinitialiser la base de données
```bash
cd apps/backend
npx prisma migrate reset
```

## 🐳 Dans Docker

Le script de démarrage du backend (généré automatiquement dans le Dockerfile) :
1. Attend que la base de données soit prête (via `nc` - netcat)
2. Génère le client Prisma si nécessaire
3. Applique les migrations automatiquement
4. Démarre l'application

## 📝 Créer la première migration

Pour créer la première migration basée sur votre schema :

```bash
cd apps/backend
npx prisma migrate dev --name init
```

Cela créera :
- Un dossier `prisma/migrations/` avec la migration
- Appliquera la migration à la base de données
- Régénérera le client Prisma

## ⚠️ Notes importantes

- Les migrations sont appliquées automatiquement au démarrage du conteneur
- Le client Prisma est généré automatiquement si nécessaire
- La base de données doit être accessible avant le démarrage du backend (healthcheck configuré)

