# 🐳 Configuration Docker pour AniTra API

## 📋 Prérequis

- Docker Desktop installé (Windows/Mac) ou Docker Engine (Linux)
- Docker Compose v3.8+
- Sources sur : `C:\Projects\anitra-backend\api`

---

## 🚀 Démarrage Rapide

### 1. **Cloner/Vérifier le projet**
```bash
cd C:\Projects\anitra-backend\api
```

### 2. **Lancer les services**
```bash
docker-compose up -d
```

### 3. **Vérifier les logs**
```bash
# Logs API
docker-compose logs -f api

# Logs PostgreSQL
docker-compose logs -f postgres
```

### 4. **Accéder à l'API**
- API: http://localhost:3000
- Swagger: http://localhost:3000/api
- Health: http://localhost:3000/health
- PostgreSQL: localhost:5432

---

## 🔥 Hot Reload

Le hot reload est **activé automatiquement** !

Modifie les fichiers dans `src/` et l'API redémarrera automatiquement.

**Fichiers surveillés :**
- `src/**/*.ts` ✅
- `prisma/schema.prisma` ✅

---

## 📦 Structure des Services

```yaml
services:
  postgres:    # Base de données
    - Port: 5432
    - DB: anitra
    - User: anitra
    - Password: anitra123

  api:         # API NestJS
    - Port: 3000
    - Hot Reload: Activé
    - Prisma: Auto-migrate
```

---

## 🛠️ Commandes Utiles

### **Démarrer les services**
```bash
docker-compose up -d
```

### **Arrêter les services**
```bash
docker-compose down
```

### **Arrêter et supprimer les volumes (⚠️ perte de données)**
```bash
docker-compose down -v
```

### **Redémarrer seulement l'API**
```bash
docker-compose restart api
```

### **Voir les logs en temps réel**
```bash
docker-compose logs -f api
```

### **Rebuild après changement de dépendances**
```bash
docker-compose up -d --build
```

### **Exécuter des commandes dans le container API**
```bash
# Shell dans le container
docker-compose exec api sh

# Prisma Studio
docker-compose exec api npx prisma studio

# Migrations
docker-compose exec api npx prisma migrate dev

# Seeds
docker-compose exec api npx prisma db seed
```

---

## 🔧 Configuration CORS

Modifie `docker-compose.yml` section `api.environment.CORS_ORIGIN` :

```yaml
# Angular
- CORS_ORIGIN=http://localhost:4200

# React
- CORS_ORIGIN=http://localhost:3001

# Vue
- CORS_ORIGIN=http://localhost:5173

# Plusieurs origines
- CORS_ORIGIN=http://localhost:4200,http://localhost:3001
```

---

## 🗃️ Accès Direct à PostgreSQL

### **Depuis ton host (Windows)**
```bash
# Avec psql
psql -h localhost -p 5432 -U anitra -d anitra

# Avec DBeaver, pgAdmin, etc.
Host: localhost
Port: 5432
Database: anitra
User: anitra
Password: anitra123
```

### **Depuis le container**
```bash
docker-compose exec postgres psql -U anitra -d anitra
```

---

## 📝 Prisma Commands

### **Créer une migration**
```bash
docker-compose exec api npx prisma migrate dev --name ma-migration
```

### **Appliquer les migrations**
```bash
docker-compose exec api npx prisma migrate deploy
```

### **Générer le client Prisma**
```bash
docker-compose exec api npx prisma generate
```

### **Ouvrir Prisma Studio**
```bash
docker-compose exec api npx prisma studio
# Accessible sur http://localhost:5555
```

### **Reset la DB (⚠️ perte de données)**
```bash
docker-compose exec api npx prisma migrate reset
```

---

## 🐛 Troubleshooting

### **L'API ne démarre pas**
```bash
# Vérifier les logs
docker-compose logs api

# Vérifier que Postgres est prêt
docker-compose logs postgres

# Redémarrer
docker-compose restart api
```

### **Hot reload ne fonctionne pas**
1. Vérifier que les volumes sont bien montés :
   ```bash
   docker-compose exec api ls -la /app/src
   ```

2. Rebuild le container :
   ```bash
   docker-compose up -d --build api
   ```

### **Erreur de connexion à Postgres**
```bash
# Vérifier que Postgres est up
docker-compose ps

# Vérifier la santé
docker-compose exec postgres pg_isready -U anitra
```

### **Port 3000 ou 5432 déjà utilisé**
Modifie les ports dans `docker-compose.yml` :
```yaml
ports:
  - "3001:3000"  # API sur port 3001
  - "5433:5432"  # Postgres sur port 5433
```

### **Problèmes de permissions (Linux/Mac)**
```bash
# Donner les permissions
sudo chown -R $USER:$USER .

# Ou rebuild avec --no-cache
docker-compose build --no-cache
```

---

## 🌐 Connexion depuis la Partie Web

### **Frontend Angular/React/Vue**

```typescript
// config.ts ou environment.ts
export const environment = {
  apiUrl: 'http://localhost:3000/api/v1'
};

// Exemple d'appel
fetch('http://localhost:3000/api/v1/farms')
  .then(res => res.json())
  .then(data => console.log(data));
```

### **Vérifier que CORS fonctionne**
```bash
curl -H "Origin: http://localhost:4200" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:3000/api/v1/farms
```

---

## 📊 Monitoring

### **Logs en temps réel**
```bash
docker-compose logs -f
```

### **Stats des containers**
```bash
docker stats anitra-api anitra-postgres
```

### **Health check**
```bash
curl http://localhost:3000/health
```

---

## 🔒 Sécurité (Production)

⚠️ **Ce setup est pour DÉVELOPPEMENT uniquement !**

Pour la production :
1. Utiliser un Dockerfile multi-stage
2. Variables d'environnement sécurisées
3. Secrets management
4. Network policies
5. Volume encryption

---

## 📚 Ressources

- [Documentation NestJS](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/)

---

## ✅ Checklist Démarrage

- [ ] Docker Desktop démarré
- [ ] Sources dans `C:\Projects\anitra-backend\api`
- [ ] `docker-compose up -d` exécuté
- [ ] API accessible sur http://localhost:3000
- [ ] Swagger accessible sur http://localhost:3000/api
- [ ] Hot reload fonctionne (modifier un fichier dans src/)
- [ ] Frontend peut appeler l'API

---

**Bon développement ! 🚀**
