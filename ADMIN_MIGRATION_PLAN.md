# Plan de Migration - Admin Reference Data Standardization

> **Objectif** : Standardiser toutes les entités de données de référence admin selon un pattern uniforme
>
> **Mode** : Big Bang (Breaking changes, pas de backward compatibility)
>
> **Version API cible** : `/api/v1/`
>
> **Date de début** : 2025-11-30
>
> **Date de fin estimée** : TBD

---

## 📋 TABLE DES MATIÈRES

1. [Contexte & Objectifs](#contexte--objectifs)
2. [Problèmes Identifiés](#problèmes-identifiés)
3. [Décisions Architecturales](#décisions-architecturales)
4. [Stratégie de Migration](#stratégie-de-migration)
5. [Inventaire des Entités](#inventaire-des-entités)
6. [Phases de Migration](#phases-de-migration)
7. [Template de Migration](#template-de-migration)
8. [Critères de Validation](#critères-de-validation)
9. [Risques & Mitigations](#risques--mitigations)

---

## 🎯 CONTEXTE & OBJECTIFS

### Contexte

Le système PAPS2 contient actuellement **16+ entités de données de référence** avec plusieurs incohérences :
- 4 patterns différents de versioning API
- Champs manquants entre DB et API (ex: `Species.scientificName`)
- Constantes en dur dans le code
- Gestion I18n incohérente
- Transactions manquantes
- Validation DTO incomplète

### Objectifs

✅ **Standardiser** toutes les entités selon un pattern uniforme
✅ **Corriger** les incohérences structure DB ↔️ API
✅ **Améliorer** la qualité du code (validation, erreurs, i18n)
✅ **Optimiser** les performances (N+1 queries, indexes)
✅ **Documenter** avec Swagger
✅ **Tester** (unitaires + E2E)

---

## 🐛 PROBLÈMES IDENTIFIÉS

### 1. Versioning API Incohérent

| Pattern | Exemples | Problème |
|---------|----------|----------|
| `/api/v1/{resource}` | species, breeds, products | ✅ Correct |
| `/api/{resource}` | national-campaigns, farms | ❌ Pas de version |
| `/{resource}` | countries, age-categories, units | ❌ Aucun préfixe |
| `/farms/:farmId/{resource}` | veterinarians, products | ❌ Pas de `/api/v1/` |

**Impact** : Impossible d'introduire v2, confusion pour les clients

---

### 2. Champs Manquants (DB vs API)

| Entité | Champ DB | Présent dans DTO | Impact |
|--------|----------|------------------|--------|
| Species | `scientificName` | ❌ Non | Données inaccessibles |

**Impact** : Fonctionnalités incomplètes

---

### 3. Constantes en Dur

- Types de campagnes en string
- Statuts en boolean au lieu d'enums
- Codes pays en dur

**Impact** : Maintenance difficile, risque d'erreurs

---

### 4. Transactions Manquantes

- Création d'entités avec relations sans transaction
- Risque de données partielles en cas d'erreur

**Impact** : Intégrité des données compromise

---

### 5. Validation Incomplète

- DTOs sans `class-validator`
- Champs optionnels non marqués `@IsOptional()`
- Pas de validation métier (formats, longueurs)

**Impact** : Données invalides en base

---

### 6. I18n Incohérent

- Messages d'erreur en dur (anglais)
- Champs multilingues manquants
- Pas de support ar (arabe) partout

**Impact** : UX dégradée pour utilisateurs non-anglophones

---

## 🏗️ DÉCISIONS ARCHITECTURALES

### ✅ Validées

| Décision | Choix | Raison |
|----------|-------|--------|
| **Versioning API** | `/api/v1/` partout | Standard, évolutif |
| **Architecture Admin** | Option B (standardisation simple) | Moins de breaking changes |
| **Migration** | Big Bang | MVP, pas de legacy à supporter |
| **Naming Convention** | `camelCase` dans JSON | Standard REST moderne |
| **Pattern Scope** | Gardé (veterinarians, products) | Logique métier validée |
| **displayOrder** | Auto-increment `max + 1` | Simple, efficace |
| **Response Wrapper** | Post-MVP | Pas critique |
| **Bulk Operations** | Post-MVP | Pas critique |
| **Seed Data** | OUI (critiques) | Nécessaire pour démo/dev |

---

### Pattern Global vs Farm-Scoped

#### Entités GLOBALES (Admin)
```
GET    /api/v1/{resource}              # Liste toutes
POST   /api/v1/{resource}              # Créer (admin only)
GET    /api/v1/{resource}/:id          # Détail
PUT    /api/v1/{resource}/:id          # Update (admin only)
DELETE /api/v1/{resource}/:id          # Soft delete (admin only)
```

**Guards** : `@UseGuards(JwtAuthGuard, AdminGuard)`

**Exemples** :
- `/api/v1/species`
- `/api/v1/breeds`
- `/api/v1/countries`
- `/api/v1/national-campaigns`

---

#### Entités FARM-SCOPED
```
GET    /api/v1/farms/:farmId/{resource}
POST   /api/v1/farms/:farmId/{resource}
GET    /api/v1/farms/:farmId/{resource}/:id
PUT    /api/v1/farms/:farmId/{resource}/:id
DELETE /api/v1/farms/:farmId/{resource}/:id
```

**Guards** : `@UseGuards(JwtAuthGuard, FarmOwnerGuard)`

**Exemples** :
- `/api/v1/farms/:farmId/animals`
- `/api/v1/farms/:farmId/treatments`

---

#### Entités MASTER TABLE (Scope mixte)

**2 endpoints séparés** :

**1. Endpoint Global (Admin)**
```
GET    /api/v1/veterinarians              # Tous (global + local)
POST   /api/v1/veterinarians              # Créer GLOBAL (admin only)
GET    /api/v1/veterinarians/:id
PUT    /api/v1/veterinarians/:id          # Update GLOBAL only
DELETE /api/v1/veterinarians/:id          # Delete GLOBAL only
```

**2. Endpoint Farm-Scoped (User)**
```
GET    /api/v1/farms/:farmId/veterinarians        # Global + local de la ferme
POST   /api/v1/farms/:farmId/veterinarians        # Créer LOCAL
PUT    /api/v1/farms/:farmId/veterinarians/:id    # Update LOCAL only
DELETE /api/v1/farms/:farmId/veterinarians/:id    # Delete LOCAL only
```

**Logique** :
- `scope='global'` + `farmId=null` → Vétérinaire admin
- `scope='local'` + `farmId=XXX` → Vétérinaire de la ferme

**Entités concernées** :
- `veterinarians`
- `products`

---

## 📊 INVENTAIRE DES ENTITÉS

### Entités de Référence (16 totales)

| # | Entité | Type | Endpoint Actuel | Endpoint Cible | Priorité |
|---|--------|------|----------------|----------------|----------|
| 1 | **countries** | Global | `/countries` | `/api/v1/countries` | 🔴 P1 |
| 2 | **age-categories** | Global | `/age-categories` | `/api/v1/age-categories` | 🔴 P1 |
| 3 | **units** | Global | `/units` | `/api/v1/units` | 🔴 P1 |
| 4 | **administration-routes** | Global | `/administration-routes` | `/api/v1/administration-routes` | 🔴 P1 |
| 5 | **alert-templates** | Global | `/alert-templates` | `/api/v1/alert-templates` | 🔴 P1 |
| 6 | **species** | Global | `/api/v1/species` ✅ | `/api/v1/species` (fix scientificName) | 🟡 P2 |
| 7 | **active-substances** | Global | `/active-substances` | `/api/v1/active-substances` | 🟡 P2 |
| 8 | **therapeutic-indications** | Global | `/therapeutic-indications` | `/api/v1/therapeutic-indications` | 🟡 P2 |
| 9 | **product-categories** | Global | `/product-categories` | `/api/v1/product-categories` | 🟡 P2 |
| 10 | **product-packagings** | Global | `/product-packagings` | `/api/v1/product-packagings` | 🟡 P2 |
| 11 | **breeds** | Global | `/api/v1/breeds` ✅ | `/api/v1/breeds` (vérifier) | 🟠 P3 |
| 12 | **breed-countries** | Global | `/api/v1/breed-countries` ✅ | `/api/v1/breed-countries` (vérifier) | 🟠 P3 |
| 13 | **national-campaigns** | Global | `/api/national-campaigns` | `/api/v1/national-campaigns` | 🟠 P3 |
| 14 | **campaign-countries** | Global | `/api/v1/campaign-countries` ✅ | `/api/v1/campaign-countries` (vérifier) | 🟠 P3 |
| 15 | **veterinarians** | Master Table | `/farms/:farmId/veterinarians` | `/api/v1/veterinarians` + `/api/v1/farms/:farmId/veterinarians` | 🟣 P4 |
| 16 | **products** | Master Table | `/farms/:farmId/products` + `/api/v1/products` | `/api/v1/products` + `/api/v1/farms/:farmId/products` | 🟣 P4 |

---

### Entités Farm-Scoped (Non concernées par cette migration)

Ces entités suivent déjà le pattern farm-scoped, mais doivent être migrées vers `/api/v1/farms/:farmId/...` :

- animals
- treatments
- weights
- movements
- breedings
- lots
- alerts
- farm-veterinarian-preferences
- farm-national-campaign-preferences
- farm-breed-preferences
- product-preferences

**Note** : Migration farm-scoped = Phase 5 (après référence data)

---

## 🚀 PHASES DE MIGRATION

### Phase 1 : Données Simples (5 entités) - Priorité 🔴

**Objectif** : Migrer les entités sans relations complexes

**Durée estimée** : 1-2 jours

| # | Entité | Complexité | Endpoint Actuel | Breaking Change |
|---|--------|------------|-----------------|-----------------|
| 1 | countries | ⭐ Simple | `/countries` | ✅ OUI |
| 2 | age-categories | ⭐ Simple | `/age-categories` | ✅ OUI |
| 3 | units | ⭐ Simple | `/units` | ✅ OUI |
| 4 | administration-routes | ⭐ Simple | `/administration-routes` | ✅ OUI |
| 5 | alert-templates | ⭐⭐ Moyen | `/alert-templates` | ✅ OUI |

**Livrables** :
- ✅ 5 entités migrées vers `/api/v1/`
- ✅ Checklist 33 points validée pour chacune
- ✅ Pattern documenté et réplicable
- ✅ Tests E2E passent
- ✅ Seed data créés pour countries

**Validation** : `countries` sert d'exemple complet

---

### Phase 2 : Données Métier (5 entités) - Priorité 🟡

**Objectif** : Migrer les données de référence métier

**Durée estimée** : 2-3 jours

| # | Entité | Complexité | Notes |
|---|--------|------------|-------|
| 6 | species | ⭐⭐ Moyen | ✅ Déjà `/api/v1/`, fix `scientificName` |
| 7 | active-substances | ⭐⭐ Moyen | Migration endpoint |
| 8 | therapeutic-indications | ⭐⭐ Moyen | Migration endpoint |
| 9 | product-categories | ⭐⭐ Moyen | Migration endpoint |
| 10 | product-packagings | ⭐⭐ Moyen | Migration endpoint |

**Livrables** :
- ✅ 5 entités migrées
- ✅ Species avec `scientificName` complet
- ✅ Validation renforcée (codes, enums)

---

### Phase 3 : Données avec Relations (4 entités) - Priorité 🟠

**Objectif** : Migrer les entités avec relations complexes

**Durée estimée** : 2-3 jours

| # | Entité | Complexité | Relations |
|---|--------|------------|-----------|
| 11 | breeds | ⭐⭐⭐ Complexe | → species |
| 12 | breed-countries | ⭐⭐⭐ Complexe | → breeds, → countries |
| 13 | national-campaigns | ⭐⭐⭐ Complexe | Enum CampaignType |
| 14 | campaign-countries | ⭐⭐⭐ Complexe | → campaigns, → countries |

**Livrables** :
- ✅ 4 entités migrées
- ✅ Relations validées (FK checks)
- ✅ Transactions pour créations atomiques
- ✅ Cascade delete/update correct

---

### Phase 4 : Master Table Pattern (2 entités) - Priorité 🟣

**Objectif** : Migrer les entités avec scope global/local

**Durée estimée** : 3-4 jours

| # | Entité | Complexité | Endpoints |
|---|--------|------------|-----------|
| 15 | veterinarians | ⭐⭐⭐⭐ Très complexe | 2 endpoints (global + farm) |
| 16 | products | ⭐⭐⭐⭐ Très complexe | 2 endpoints (global + farm) |

**Architecture** :

**Veterinarians** :
```
GET/POST/PUT/DELETE /api/v1/veterinarians              # Admin, scope='global'
GET/POST/PUT/DELETE /api/v1/farms/:farmId/veterinarians # User, scope='local'
```

**Products** :
```
GET/POST/PUT/DELETE /api/v1/products                   # Admin, scope='global'
GET/POST/PUT/DELETE /api/v1/farms/:farmId/products     # User, scope='local'
```

**Livrables** :
- ✅ 2 entités migrées
- ✅ 2 endpoints par entité fonctionnels
- ✅ Logique scope correcte
- ✅ Guards (AdminGuard, FarmOwnerGuard)
- ✅ Tests exhaustifs (scope isolation)

---

### Phase 5 : Farm-Scoped Endpoints (Optionnel)

**Objectif** : Migrer tous les endpoints farm-scoped vers `/api/v1/farms/:farmId/...`

**Durée estimée** : 5-7 jours

**Entités concernées** : animals, treatments, weights, movements, etc.

**Note** : Peut être post-MVP

---

## 📝 TEMPLATE DE MIGRATION (Par Entité)

### Étapes Standard

#### 1️⃣ PRÉPARATION
- [ ] Copier `ADMIN_REMEDIATION_CHECKLIST.md` → `checklist-[entity].md`
- [ ] Lire le schema Prisma de l'entité
- [ ] Identifier les champs manquants (DB vs API)
- [ ] Lister les relations et FK
- [ ] Identifier les enums

#### 2️⃣ AUDIT
- [ ] Lire controller actuel
- [ ] Lire service actuel
- [ ] Lire DTOs actuels
- [ ] Identifier les constantes en dur
- [ ] Identifier les transactions manquantes
- [ ] Identifier les N+1 queries

#### 3️⃣ MIGRATION ENDPOINT
- [ ] Changer `@Controller('xxx')` → `@Controller('api/v1/xxx')`
- [ ] Supprimer ancien endpoint (Big Bang)
- [ ] Tester que l'endpoint répond

#### 4️⃣ DTOs
- [ ] Créer/Mettre à jour `CreateDto`
  - Tous les champs créables
  - `class-validator` sur tous
  - Champs optionnels avec `@IsOptional()`
- [ ] Créer/Mettre à jour `UpdateDto`
  - Extends `PartialType(CreateDto)`
  - Validation cohérente
- [ ] Créer/Mettre à jour `ResponseDto`
  - Tous les champs DB
  - Métadonnées (id, createdAt, updatedAt, version, deletedAt)
  - Swagger `@ApiProperty()`
  - ⚠️ **IMPORTANT** : Utiliser `type | null` (pas `type?`) pour les champs nullable Prisma

#### 4️⃣-bis VÉRIFICATION TYPES (CRITIQUE)
- [ ] **Vérifier cohérence types Prisma ↔️ DTOs**
  - Prisma `String?` → DTO `string | null` (PAS `string?` qui = `string | undefined`)
  - Prisma `Int?` → DTO `number | null`
  - Prisma `Boolean?` → DTO `boolean | null`
- [ ] Exporter les interfaces utilisées dans le controller
  - Si interface dans service utilisée par controller → `export interface`
- [ ] Ajouter types de retour explicites sur méthodes controller
  - Exemple : `findAll(): Promise<PaginatedResponse>`

#### 5️⃣ SERVICE
- [ ] Ajouter soft delete : `where: { deletedAt: null }`
- [ ] Ajouter transactions si multiples opérations
- [ ] Optimiser queries (include, select)
- [ ] Ajouter pagination (findAll)
- [ ] Ajouter filtrage (isActive, search, etc.)
- [ ] Ajouter tri (orderBy, order)
- [ ] Calculer displayOrder auto (max + 1)
- [ ] Versioning optimiste (version check)

#### 6️⃣ CONTROLLER
- [ ] Ajouter guards appropriés
- [ ] Ajouter Swagger decorators
- [ ] Gestion erreurs standardisée
- [ ] Messages i18n
- [ ] Validation query params

#### 7️⃣ CONSTANTES & ENUMS
- [ ] Extraire constantes en dur
- [ ] Créer enums si nécessaire
- [ ] Synchroniser Prisma ↔️ TypeScript

#### 8️⃣ I18N
- [ ] Ajouter clés dans `fr.json`, `en.json`, `ar.json`
- [ ] Messages d'erreur
- [ ] Messages de validation
- [ ] Vérifier champs multilingues (nameFr, nameEn, nameAr)

#### 9️⃣ INDEXES & PERFORMANCE
- [ ] Ajouter `@unique` sur codes
- [ ] Ajouter `@@index` sur FK
- [ ] Ajouter `@@index` sur champs de recherche

#### 🔟 TESTS
- [ ] Tests unitaires (CRUD)
- [ ] Tests validation
- [ ] Tests errors (404, 409)
- [ ] Tests E2E
- [ ] Couverture > 80%

#### 1️⃣1️⃣ SEED DATA (si critique)
- [ ] Créer script seed
- [ ] Tester idempotence
- [ ] Enregistrer dans package.json

#### 1️⃣2️⃣ VALIDATION FINALE
- [ ] Checklist 33 points complète
- [ ] Code review
- [ ] Tests passent
- [ ] Swagger validé
- [ ] **🔥 BUILD TypeScript : `npm run build`** (OBLIGATOIRE)
  - Vérifier 0 erreur de compilation
  - Corriger immédiatement si erreurs
- [ ] **🔥 TEST démarrage backend : `npm run start:dev`** (OBLIGATOIRE)
  - Vérifier que le serveur démarre sans erreur
  - Vérifier les logs de démarrage
  - Tester manuellement 1-2 endpoints (GET)
- [ ] Commit + Push
- [ ] Mettre à jour `ADMIN_MIGRATION_TRACKER.md`

**⚠️ RÈGLE CRITIQUE** : Ne JAMAIS passer à l'entité suivante sans :
1. Build réussi (0 erreur TypeScript)
2. Backend qui démarre correctement
3. Tests manuels basiques OK

---

## ✅ CRITÈRES DE VALIDATION

### Critères de Succès (Par Entité)

#### Fonctionnel
- ✅ CRUD complet fonctionne
- ✅ Endpoint `/api/v1/[entity]` répond
- ✅ Validation DTO fonctionne (erreurs 400)
- ✅ Soft delete fonctionne
- ✅ Pagination fonctionne
- ✅ Filtrage fonctionne
- ✅ Tri fonctionne

#### Technique
- ✅ Checklist 33 points validée
- ✅ Tests unitaires > 80% couverture
- ✅ Tests E2E passent
- ✅ Pas de N+1 queries
- ✅ Transactions utilisées
- ✅ Swagger généré et valide

#### Qualité
- ✅ Code review OK
- ✅ Pas de constantes en dur
- ✅ I18n complet
- ✅ Erreurs standardisées
- ✅ Logs appropriés

---

### Critères de Validation Globaux (Fin de migration)

#### API
- ✅ **16 entités** migrées vers `/api/v1/`
- ✅ Aucun endpoint sans version
- ✅ Pattern uniforme partout
- ✅ Documentation Swagger complète

#### Code
- ✅ Pas de constantes en dur
- ✅ Enums partout
- ✅ Validation complète
- ✅ Transactions appropriées

#### I18n
- ✅ 3 langues supportées (fr, en, ar)
- ✅ Tous les messages externalisés
- ✅ Champs multilingues partout

#### Tests
- ✅ Couverture globale > 80%
- ✅ Tests E2E complets
- ✅ CI/CD passe

#### Documentation
- ✅ Swagger complet
- ✅ README mis à jour
- ✅ Migration guide pour clients API

---

## ⚠️ RISQUES & MITIGATIONS

### Risque 1 : Breaking Changes

**Probabilité** : 🔴 Élevée
**Impact** : 🔴 Élevé

**Description** : Changement des endpoints casse les clients existants

**Mitigation** :
- ✅ Communication claire aux équipes frontend/mobile
- ✅ Migration coordonnée (backend → frontend en même temps)
- ✅ Tests E2E avant déploiement
- ✅ Déploiement synchronisé

---

### Risque 2 : Données Manquantes

**Probabilité** : 🟡 Moyenne
**Impact** : 🔴 Élevé

**Description** : Migration révèle champs manquants critiques

**Mitigation** :
- ✅ Audit complet avant migration
- ✅ Scripts de validation des données
- ✅ Seed data pour combler manques

---

### Risque 3 : Régression

**Probabilité** : 🟡 Moyenne
**Impact** : 🟡 Moyen

**Description** : Bugs introduits lors de la refactorisation

**Mitigation** :
- ✅ Tests exhaustifs (unitaires + E2E)
- ✅ Code review systématique
- ✅ Validation manuelle en staging

---

### Risque 4 : Délai Sous-estimé

**Probabilité** : 🟡 Moyenne
**Impact** : 🟡 Moyen

**Description** : 16 entités × 33 points = beaucoup de travail

**Mitigation** :
- ✅ Priorisation claire (P1 → P4)
- ✅ Template et pattern réplicable
- ✅ Automatisation (scripts, generators)
- ✅ Focus MVP (critiques uniquement)

---

## 🚨 PIÈGES À ÉVITER (Leçons de Countries)

### Piège #1 : Types null vs undefined (CRITIQUE)

**Problème rencontré** :
```typescript
// ❌ ERREUR : Prisma retourne `string | null` mais DTO a `string | undefined`
// schema.prisma
region String? // = string | null en Prisma

// DTO INCORRECT
region?: string; // = string | undefined en TypeScript

// ERREUR TypeScript
// Type 'string | null' is not assignable to type 'string | undefined'
```

**Solution** :
```typescript
// ✅ CORRECT
region: string | null; // Match exactement Prisma
```

**Règle** : Pour les champs nullable Prisma (`String?`, `Int?`, `Boolean?`), utiliser TOUJOURS `type | null` dans les DTOs, JAMAIS `type?`.

---

### Piège #2 : Interfaces non exportées

**Problème rencontré** :
```typescript
// ❌ ERREUR : Interface non exportée utilisée dans controller
// service.ts
interface PaginatedResponse { ... } // PAS exporté

// controller.ts
import { MyService } from './my.service';
findAll(): PaginatedResponse { ... } // TS4053 error
```

**Solution** :
```typescript
// ✅ CORRECT
export interface PaginatedResponse { ... }

// controller.ts
import { MyService, PaginatedResponse } from './my.service';
findAll(): Promise<PaginatedResponse> { ... }
```

**Règle** : Si une interface du service est utilisée comme type de retour dans le controller, elle DOIT être exportée.

---

### Piège #3 : Types de retour manquants

**Problème** :
```typescript
// ❌ Pas de type de retour explicite
findAll(...) {
  return this.service.findAll(...);
}
```

**Solution** :
```typescript
// ✅ Type de retour explicite
findAll(...): Promise<PaginatedResponse> {
  return this.service.findAll(...);
}
```

**Règle** : Toujours spécifier les types de retour explicitement sur les méthodes publiques des controllers.

---

### Piège #4 : Ne pas tester le build

**Problème** : Erreurs TypeScript découvertes seulement au déploiement.

**Solution** :
```bash
# OBLIGATOIRE après chaque migration
npm run build

# Si erreurs → corriger IMMÉDIATEMENT
# Ne PAS passer à l'entité suivante
```

**Règle** : Build + démarrage backend = étapes OBLIGATOIRES avant de committer.

---

### Piège #5 : Ne pas tester le démarrage

**Problème** : Code compile mais backend crash au démarrage (injection dependencies, modules mal configurés, etc.).

**Solution** :
```bash
# Tester le démarrage
npm run start:dev

# Vérifier :
# 1. Serveur démarre sans erreur
# 2. Logs affichent routes correctement
# 3. Tester 1-2 endpoints manuellement
```

**Règle** : Backend doit démarrer proprement avant de committer.

---

### Checklist Anti-Erreurs (Appliquer Systématiquement)

Après chaque modification DTO :
- [ ] Vérifier types Prisma `?` → `type | null` (PAS `type?`)
- [ ] Exporter interfaces si utilisées dans controller
- [ ] Ajouter types de retour explicites sur méthodes controller
- [ ] `npm run build` → 0 erreur
- [ ] `npm run start:dev` → démarrage OK
- [ ] Test manuel 1-2 endpoints
- [ ] Commit uniquement si tout est vert ✅

---

## 📚 DOCUMENTATION ASSOCIÉE

- **Checklist Template** : `ADMIN_REMEDIATION_CHECKLIST.md`
- **Migration Tracker** : `ADMIN_MIGRATION_TRACKER.md`
- **API Signatures** : `API_SIGNATURES_V2.md`

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ Valider ce plan de migration
2. ⏳ Créer `ADMIN_MIGRATION_TRACKER.md`
3. ⏳ Commencer Phase 1 avec `countries` (exemple complet)
4. ⏳ Répliquer pattern sur 4 autres entités P1
5. ⏳ Continuer P2, P3, P4

---

**Plan créé le** : 2025-11-30
**Dernière mise à jour** : 2025-11-30
**Statut** : 🟡 EN VALIDATION
