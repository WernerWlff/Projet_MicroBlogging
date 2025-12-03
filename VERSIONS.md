# Versions des Frameworks et Technologies - Projet MicroBlogging

## 📦 Versions Actuelles

### 🗄️ Base de Données
- **PostgreSQL** : `15` (actuellement)
  - **Souhaité** : `18`
  - **Fichier** : `docker-compose.yml` (ligne 5)

---

### 🟢 Node.js
- **Version** : `20` (dans le Dockerfile principal)
- **Fichier** : 
  - `Dockerfile` (ligne 5) - Dockerfile multi-stage à la racine
- **Note** : Version LTS actuelle recommandée

---

### 🔷 TypeScript
- **Version** : `latest` (non fixée)
- **Fichiers** :
  - `package.json` (racine, ligne 20)
  - `apps/backend/package.json` (ligne 47) : `^5.1.3`
  - `apps/frontend/package.json` (ligne 26)
  - `packages/shared/package.json` (ligne 11)
- **Recommandation** : Fixer à une version spécifique (ex: `^5.3.0`)

---

### 🎯 Backend - NestJS

#### Dependencies
- **@nestjs/common** : `^10.0.0`
- **@nestjs/core** : `^10.0.0`
- **@nestjs/platform-express** : `^10.0.0`
- **@prisma/client** : `^5.0.0`
- **class-transformer** : `^0.5.1`
- **class-validator** : `^0.14.0`
- **helmet** : `^7.0.0`
- **reflect-metadata** : `^0.1.13`
- **rxjs** : `^7.8.1`

#### DevDependencies
- **@nestjs/cli** : `^10.0.0`
- **@nestjs/schematics** : `^10.0.0`
- **@nestjs/testing** : `^10.0.0`
- **@types/express** : `^4.17.17`
- **@types/jest** : `^29.5.2`
- **@types/node** : `^20.3.1`
- **@types/supertest** : `^2.0.12`
- **jest** : `^29.5.0`
- **prisma** : `^5.0.0`
- **source-map-support** : `^0.5.21`
- **supertest** : `^6.3.3`
- **ts-jest** : `^29.1.0`
- **ts-loader** : `^9.4.3`
- **ts-node** : `^10.9.1`
- **tsconfig-paths** : `^4.2.0`
- **typescript** : `^5.1.3`

**Fichier** : `apps/backend/package.json`

---

### ⚛️ Frontend - Next.js & React

#### Dependencies
- **next** : `latest` (non fixée)
- **react** : `latest` (non fixée)
- **react-dom** : `latest` (non fixée)
- **autoprefixer** : `latest` (non fixée)
- **postcss** : `latest` (non fixée)
- **tailwindcss** : `latest` (non fixée)

#### DevDependencies
- **@types/node** : `latest` (non fixée)
- **@types/react** : `latest` (non fixée)
- **@types/react-dom** : `latest` (non fixée)
- **eslint** : `latest` (non fixée)
- **eslint-config-next** : `latest` (non fixée)
- **typescript** : `latest` (non fixée)

**Fichier** : `apps/frontend/package.json`

**Recommandations** :
- **Next.js** : Fixer à `^14.0.0` ou version stable actuelle
- **React** : Fixer à `^18.2.0` (compatible avec Next.js 14)
- **React DOM** : Fixer à `^18.2.0`
- **Tailwind CSS** : Fixer à `^3.3.0`

---

### 📦 Monorepo & Build Tools

#### Racine du projet
- **turbo** : `latest` (non fixée)
- **prettier** : `latest` (non fixée)
- **typescript** : `latest` (non fixée)
- **@types/node** : `latest` (non fixée)
- **packageManager** : `npm@10.0.0`

**Fichier** : `package.json` (racine)

**Recommandations** :
- **Turbo** : Fixer à `^1.11.0` ou version stable actuelle
- **Prettier** : Fixer à `^3.1.0`

---

### 🔧 Package Shared
- **typescript** : `latest` (non fixée)
- **@types/node** : `latest` (non fixée)

**Fichier** : `packages/shared/package.json`

---

## 🔄 Actions Recommandées

### 1. Mise à jour PostgreSQL
```yaml
# docker-compose.yml
services:
  db:
    image: postgres:18  # Changer de 15 à 18
```

### 2. Fixer les versions "latest"
Il est **fortement recommandé** de fixer toutes les versions `latest` à des versions spécifiques pour :
- **Reproductibilité** : Assurer que tous les développeurs utilisent les mêmes versions
- **Stabilité** : Éviter les breaking changes inattendus
- **Sécurité** : Contrôler les mises à jour de sécurité

### 3. Versions recommandées à fixer

#### Frontend
```json
{
  "next": "^14.0.4",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "tailwindcss": "^3.3.6",
  "autoprefixer": "^10.4.16",
  "postcss": "^8.4.32"
}
```

#### Racine
```json
{
  "turbo": "^1.11.2",
  "prettier": "^3.1.1",
  "typescript": "^5.3.3"
}
```

---

## 📋 Résumé des Versions

| Technologie | Version Actuelle | Version Recommandée | Statut |
|------------|------------------|-------------------|--------|
| PostgreSQL | 15 | **18** | ⚠️ À mettre à jour |
| Node.js | 18 | 18 (LTS) | ✅ OK |
| TypeScript | latest / ^5.1.3 | ^5.3.3 | ⚠️ À fixer |
| NestJS | ^10.0.0 | ^10.0.0 | ✅ OK |
| Prisma | ^5.0.0 | ^5.0.0 | ✅ OK |
| Next.js | latest | ^14.0.4 | ⚠️ À fixer |
| React | latest | ^18.2.0 | ⚠️ À fixer |
| React DOM | latest | ^18.2.0 | ⚠️ À fixer |
| Tailwind CSS | latest | ^3.3.6 | ⚠️ À fixer |
| Turbo | latest | ^1.11.2 | ⚠️ À fixer |
| Prettier | latest | ^3.1.1 | ⚠️ À fixer |
| npm | 10.0.0 | 10.0.0 | ✅ OK |

---

## 🚨 Notes Importantes

1. **PostgreSQL 18** : La mise à jour de PostgreSQL 15 à 18 nécessite de vérifier la compatibilité avec Prisma. Prisma 5.0.0 devrait être compatible, mais il est recommandé de tester.

2. **Versions "latest"** : Toutes les dépendances marquées `latest` devraient être fixées à des versions spécifiques pour éviter les problèmes de compatibilité.

3. **Lock file** : Assurez-vous d'avoir un `package-lock.json` à jour après avoir fixé les versions.

4. **Tests** : Après avoir mis à jour les versions, exécutez les tests pour vérifier que tout fonctionne correctement.

---

## 📝 Commandes Utiles

### Vérifier les versions installées
```bash
npm list --depth=0
```

### Mettre à jour les dépendances
```bash
npm update
```

### Vérifier les versions obsolètes
```bash
npm outdated
```

### Fixer les versions
```bash
npm install --save-exact package@version
```

