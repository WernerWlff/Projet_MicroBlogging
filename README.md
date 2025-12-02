# Projet MicroBlogging

Application de microblogging construite avec NestJS (backend) et Next.js (frontend) dans un monorepo.

## 🚀 Démarrage rapide

### Prérequis

- Docker et Docker Compose installés
- Node.js 18+ (pour le développement local)

### Build et lancement avec Docker

#### 1. Construire les images Docker

```bash
# Construire tous les services
docker-compose build

# Ou avec --no-cache pour forcer un rebuild complet
docker-compose build --no-cache
```

#### 2. Lancer les services

```bash
# Lancer tous les services en mode détaché (arrière-plan)
docker-compose up -d

# Ou lancer en mode attaché (voir les logs en direct)
docker-compose up
```

#### 3. Accéder à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001
- **PostgreSQL** : localhost:5432

### Commandes utiles

#### Voir les logs

```bash
# Tous les services
docker-compose logs

# Un service spécifique
docker-compose logs frontend
docker-compose logs backend
docker-compose logs db

# Suivre les logs en temps réel
docker-compose logs -f frontend
```

#### Arrêter les services

```bash
# Arrêter les services
docker-compose stop

# Arrêter et supprimer les conteneurs
docker-compose down

# Arrêter et supprimer les conteneurs + volumes (⚠️ supprime les données)
docker-compose down -v
```

#### Redémarrer un service

```bash
# Redémarrer un service spécifique
docker-compose restart frontend

# Redémarrer tous les services
docker-compose restart
```

#### Rebuild et relancer

```bash
# Rebuild et relancer
docker-compose up -d --build

# Rebuild un service spécifique
docker-compose build frontend
docker-compose up -d frontend
```

### Développement local (sans Docker)

#### Installation des dépendances

```bash
npm install
```

#### Lancer le backend

```bash
cd apps/backend
npm run dev
```

#### Lancer le frontend

```bash
cd apps/frontend
npm run dev
```

#### Lancer tout avec Turbo

```bash
# À la racine du projet
npm run dev
```

### Base de données

#### Connexion à PostgreSQL

```bash
# Via Docker
docker-compose exec db psql -U user -d microblogging

# Ou depuis l'extérieur
psql -h localhost -U user -d microblogging
# Mot de passe: password
```

#### Migrations Prisma

```bash
# Générer le client Prisma
cd apps/backend
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# Voir la base de données
npx prisma studio
```

### Structure du projet

```
Projet_MicroBlogging/
├── apps/
│   ├── backend/          # API NestJS
│   └── frontend/         # Application Next.js
├── packages/
│   └── shared/           # Code partagé
├── docker-compose.yml    # Configuration Docker
└── Dockerfile           # Dockerfile principal
```

### Variables d'environnement

Les variables d'environnement sont définies dans `docker-compose.yml`. Pour le développement local, créez un fichier `.env` :

```env
DATABASE_URL=postgresql://user:password@localhost:5432/microblogging?schema=public
NODE_ENV=development
```

### Troubleshooting

#### Port déjà utilisé

Si un port est déjà utilisé, modifiez les ports dans `docker-compose.yml` :

```yaml
ports:
  - "3002:3001"  # Changer le port externe
```

#### Erreur de connexion à la base de données

Assurez-vous que le service `db` est démarré avant le backend :

```bash
docker-compose up db
# Attendre quelques secondes
docker-compose up backend frontend
```

#### Rebuild complet

Si vous rencontrez des problèmes, faites un rebuild complet :

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Scripts disponibles

```bash
# Build
npm run build

# Développement
npm run dev

# Lint
npm run lint

# Tests
npm run test

# Format
npm run format
```
