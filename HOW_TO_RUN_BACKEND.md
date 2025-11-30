# Comment Lancer et Tester le Backend

> Guide complet pour lancer, tester et valider le backend après une migration

---

## 🚀 Lancement du Backend

### Option 1 : Mode Développement (Recommandé)

```bash
# Démarre le backend en mode watch (rechargement automatique)
npm run start:dev
```

**Avantages** :
- ✅ Rechargement automatique à chaque changement de fichier
- ✅ Logs détaillés
- ✅ Idéal pour développement et tests

**Ce que vous devriez voir** :
```
[Nest] 12345  - 30/11/2025, 10:00:00     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 30/11/2025, 10:00:00     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 30/11/2025, 10:00:00     LOG [InstanceLoader] PrismaModule dependencies initialized
[Nest] 12345  - 30/11/2025, 10:00:00     LOG [InstanceLoader] CountriesModule dependencies initialized
...
[Nest] 12345  - 30/11/2025, 10:00:01     LOG [RoutesResolver] CountriesController {/api/v1/countries}:
[Nest] 12345  - 30/11/2025, 10:00:01     LOG [RouterExplorer] Mapped {/api/v1/countries, POST} route
[Nest] 12345  - 30/11/2025, 10:00:01     LOG [RouterExplorer] Mapped {/api/v1/countries, GET} route
[Nest] 12345  - 30/11/2025, 10:00:01     LOG [RouterExplorer] Mapped {/api/v1/countries/regions, GET} route
[Nest] 12345  - 30/11/2025, 10:00:01     LOG [RouterExplorer] Mapped {/api/v1/countries/region/:region, GET} route
[Nest] 12345  - 30/11/2025, 10:00:01     LOG [RouterExplorer] Mapped {/api/v1/countries/:code, GET} route
[Nest] 12345  - 30/11/2025, 10:00:01     LOG [RouterExplorer] Mapped {/api/v1/countries/:code, PATCH} route
[Nest] 12345  - 30/11/2025, 10:00:01     LOG [RouterExplorer] Mapped {/api/v1/countries/:code/toggle-active, PATCH} route
[Nest] 12345  - 30/11/2025, 10:00:01     LOG [RouterExplorer] Mapped {/api/v1/countries/:code, DELETE} route
[Nest] 12345  - 30/11/2025, 10:00:01     LOG [NestApplication] Nest application successfully started
[Nest] 12345  - 30/11/2025, 10:00:01     LOG Application is running on: http://localhost:3000
```

---

### Option 2 : Mode Production

```bash
# Build l'application
npm run build

# Lance en mode production
npm run start:prod
```

**Utiliser pour** :
- Tests de performance
- Validation avant déploiement
- Vérification bundle final

---

### Option 3 : Mode Debug (VSCode)

```bash
# Lance en mode debug
npm run start:debug
```

**Avantages** :
- ✅ Breakpoints fonctionnels
- ✅ Inspection variables
- ✅ Call stack

**Configuration VSCode** (`.vscode/launch.json`) :
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach NestJS",
      "port": 9229,
      "restart": true,
      "stopOnEntry": false,
      "sourceMaps": true
    }
  ]
}
```

---

## ✅ Vérifications au Démarrage

### 1. Le serveur démarre sans erreur

**✅ BON** :
```
[Nest] ... LOG [NestApplication] Nest application successfully started
[Nest] ... LOG Application is running on: http://localhost:3000
```

**❌ MAUVAIS** :
```
[Nest] ... ERROR [ExceptionHandler] Cannot find module '@nestjs/common'
Error: Cannot find module '@nestjs/common'
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:...)
```

**Solution si erreur** :
```bash
# Réinstaller les dépendances
npm install

# Vider cache si nécessaire
rm -rf node_modules package-lock.json
npm install
```

---

### 2. Les routes sont correctement mappées

**Vérifier dans les logs** :
```
[Nest] ... LOG [RouterExplorer] Mapped {/api/v1/countries, GET} route
```

**Si routes manquantes** :
- Vérifier que le module est importé dans `app.module.ts`
- Vérifier que le controller a le bon `@Controller()` decorator
- Vérifier qu'il n'y a pas d'erreur d'import

---

### 3. Prisma connecté à la DB

**Vérifier dans les logs** :
```
[Nest] ... LOG [PrismaModule] dependencies initialized
```

**Si erreur de connexion** :
```
Error: Can't reach database server at `localhost:5432`
```

**Solution** :
- Vérifier que PostgreSQL est lancé
- Vérifier `.env` : `DATABASE_URL` correct
- Tester connexion : `npx prisma db pull`

---

## 🧪 Tests Manuels Rapides

### Test 1 : Health Check

```bash
# Vérifier que le serveur répond
curl http://localhost:3000

# Ou avec httpie
http http://localhost:3000
```

**Réponse attendue** : 200 OK ou redirection Swagger

---

### Test 2 : Swagger UI

**Ouvrir dans le navigateur** :
```
http://localhost:3000/api
```

**Vérifier** :
- ✅ Swagger UI s'affiche
- ✅ Section "Countries" visible
- ✅ 8 endpoints listés
- ✅ Schémas DTOs visibles

---

### Test 3 : GET All Countries

```bash
# Sans pagination
curl http://localhost:3000/api/v1/countries

# Avec pagination
curl "http://localhost:3000/api/v1/countries?page=1&limit=10"

# Avec recherche
curl "http://localhost:3000/api/v1/countries?search=alg"

# Avec tri
curl "http://localhost:3000/api/v1/countries?orderBy=nameFr&order=ASC"
```

**Réponse attendue** :
```json
{
  "data": [
    {
      "code": "DZ",
      "nameFr": "Algérie",
      "nameEn": "Algeria",
      "nameAr": "الجزائر",
      "region": "Africa",
      "isActive": true,
      "createdAt": "2025-11-30T10:00:00.000Z",
      "updatedAt": "2025-11-30T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

### Test 4 : GET Country by Code

```bash
curl http://localhost:3000/api/v1/countries/DZ
```

**Réponse attendue** :
```json
{
  "code": "DZ",
  "nameFr": "Algérie",
  ...
}
```

**Cas d'erreur (404)** :
```bash
curl http://localhost:3000/api/v1/countries/ZZ
```

**Réponse attendue** :
```json
{
  "statusCode": 404,
  "message": "Country with code \"ZZ\" not found",
  "error": "Not Found"
}
```

---

### Test 5 : POST Create Country (Admin)

**IMPORTANT** : Nécessite authentification en mode production

```bash
# En mode MVP (pas besoin de token)
curl -X POST http://localhost:3000/api/v1/countries \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TN",
    "nameFr": "Tunisie",
    "nameEn": "Tunisia",
    "nameAr": "تونس",
    "region": "Africa"
  }'
```

**Réponse attendue (201 Created)** :
```json
{
  "code": "TN",
  "nameFr": "Tunisie",
  ...
  "createdAt": "2025-11-30T10:05:00.000Z"
}
```

**Cas d'erreur validation (400)** :
```bash
curl -X POST http://localhost:3000/api/v1/countries \
  -H "Content-Type: application/json" \
  -d '{
    "code": "ABC",
    "nameFr": "Test"
  }'
```

**Réponse attendue** :
```json
{
  "statusCode": 400,
  "message": [
    "Code must be ISO 3166-1 alpha-2 (2 uppercase letters)",
    "nameEn should not be empty",
    "nameAr should not be empty"
  ],
  "error": "Bad Request"
}
```

---

## 🔍 Debugging Courant

### Problème : "Cannot find module"

**Symptôme** :
```
Error: Cannot find module '@nestjs/common'
```

**Solutions** :
```bash
# 1. Réinstaller dépendances
npm install

# 2. Vérifier node_modules existe
ls node_modules/@nestjs/common

# 3. Vérifier version Node.js
node --version  # Devrait être >= 16

# 4. Nettoyer cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

### Problème : Port déjà utilisé

**Symptôme** :
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions** :
```bash
# Option 1 : Tuer le processus sur le port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Option 2 : Changer le port dans .env
PORT=3001
```

---

### Problème : Base de données inaccessible

**Symptôme** :
```
Error: Can't reach database server at `localhost:5432`
```

**Solutions** :
```bash
# 1. Vérifier PostgreSQL lancé
# Windows
services.msc  # Chercher PostgreSQL

# Linux/Mac
sudo systemctl status postgresql
# ou
pg_isready

# 2. Vérifier .env
cat .env | grep DATABASE_URL

# 3. Tester connexion Prisma
npx prisma db pull

# 4. Vérifier réseau Docker si DB en container
docker ps | grep postgres
```

---

### Problème : Erreurs TypeScript au runtime

**Symptôme** :
```
TypeError: Cannot read property 'findMany' of undefined
```

**Solutions** :
```bash
# 1. Rebuild complet
npm run build

# 2. Vérifier imports
# S'assurer que PrismaService est bien injecté

# 3. Vérifier module config
# PrismaModule doit être importé dans le module qui l'utilise

# 4. Nettoyer dist/
rm -rf dist
npm run build
```

---

## 📊 Monitoring et Logs

### Logs Détaillés

```bash
# Activer logs debug (dans .env)
LOG_LEVEL=debug

# Ou via flag
npm run start:dev -- --debug
```

### Logs Structurés

Les logs NestJS affichent :
- **Timestamp** : Heure de l'événement
- **Context** : Module/Service concerné
- **Level** : LOG, WARN, ERROR, DEBUG
- **Message** : Description

**Exemple** :
```
[Nest] 12345  - 30/11/2025, 10:00:00   LOG [RouterExplorer] Mapped {/api/v1/countries, GET} route
       ^PID          ^Timestamp         ^Level ^Context              ^Message
```

---

## 🎯 Checklist de Validation Complète

Après migration d'une entité :

### Build & Démarrage
- [ ] `npm run build` → 0 erreur TypeScript
- [ ] `npm run start:dev` → Serveur démarre sans erreur
- [ ] Logs affichent routes mappées correctement
- [ ] Swagger UI accessible : http://localhost:3000/api

### Tests Endpoints GET (Public)
- [ ] GET all items : retourne liste + pagination
- [ ] GET by ID : retourne item
- [ ] GET by ID (404) : retourne erreur 404
- [ ] Filtrage fonctionne (si applicable)
- [ ] Recherche fonctionne (si applicable)
- [ ] Tri fonctionne (si applicable)

### Tests Endpoints Write (Admin - en MVP mode)
- [ ] POST : crée ressource (201)
- [ ] POST validation error : retourne 400
- [ ] POST duplicate : retourne 409 (si applicable)
- [ ] PATCH : modifie ressource (200)
- [ ] DELETE : supprime ressource (200)

### Swagger Documentation
- [ ] Section entité visible
- [ ] Tous les endpoints listés
- [ ] Schémas DTOs corrects
- [ ] Query parameters documentés
- [ ] Exemples présents

### Performance & Stabilité
- [ ] Pas de memory leak (observer mémoire)
- [ ] Temps de réponse < 200ms pour GET simple
- [ ] Pas d'erreurs dans les logs
- [ ] Reconnexion DB fonctionne si perte connexion

---

## 🚀 Commandes Utiles

### Développement
```bash
npm run start:dev        # Mode développement (watch)
npm run start:debug      # Mode debug (port 9229)
npm run build            # Build TypeScript
npm run start:prod       # Mode production
```

### Tests
```bash
npm run test             # Tests unitaires
npm run test:watch       # Tests en mode watch
npm run test:cov         # Tests avec couverture
npm run test:e2e         # Tests E2E
```

### Database
```bash
npx prisma migrate dev   # Migrations dev
npx prisma db push       # Push schema sans migration
npx prisma db pull       # Pull schema depuis DB
npx prisma studio        # UI pour explorer DB
npx prisma generate      # Générer Prisma Client
```

### Debugging
```bash
npm run build -- --verbose     # Build verbose
npm run start:dev -- --debug   # Logs debug
```

---

## 📝 Exemple de Session Complète

```bash
# 1. Build
npm run build
# ✅ Compiled successfully

# 2. Démarrage
npm run start:dev
# ✅ Application is running on: http://localhost:3000

# 3. Test Swagger
# Ouvrir http://localhost:3000/api dans navigateur
# ✅ Swagger UI s'affiche

# 4. Test GET
curl http://localhost:3000/api/v1/countries
# ✅ Retourne liste avec pagination

# 5. Test GET by ID
curl http://localhost:3000/api/v1/countries/DZ
# ✅ Retourne pays Algérie

# 6. Test 404
curl http://localhost:3000/api/v1/countries/ZZ
# ✅ Retourne erreur 404

# 7. Test POST (MVP mode - pas besoin auth)
curl -X POST http://localhost:3000/api/v1/countries \
  -H "Content-Type: application/json" \
  -d '{"code":"TN","nameFr":"Tunisie","nameEn":"Tunisia","nameAr":"تونس"}'
# ✅ Retourne 201 Created

# 8. Tout est vert ✅
# → Commit et passer à l'entité suivante
```

---

**Dernière mise à jour** : 2025-11-30
