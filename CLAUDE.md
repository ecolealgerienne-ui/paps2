# CLAUDE.md - Mémoire de Session

## Contexte Projet

**Projet** : AniTra Backend - Application de gestion d'élevage
**Stack** : NestJS v10 + TypeScript v5 + Prisma v6 + PostgreSQL 16
**Architecture** : Multi-tenancy avec isolation par `farmId`
**Environnement Dev** : Windows + PowerShell

---

## Directives Marché

**IMPORTANT - À lire avant chaque session :**

- **Marché prioritaire** : France (FR)
- **Marché secondaire** : Europe (EU)
- **Marché NON ciblé** : Algérie - Ne pas développer de fonctionnalités spécifiques à ce marché

Les développements doivent respecter :
- Réglementations françaises (identification animale, traçabilité)
- Standards européens (EU)
- Langues : FR prioritaire, EN secondaire

---

## Normes de Développement

### Architecture
- Pattern multi-tenancy avec `farmId` obligatoire
- Soft delete uniquement (`deletedAt`)
- Versioning optimistic (`version` field)
- DTOs avec `class-validator` pour toutes les entrées

### API REST
- Base URL : `/api/v1`
- Routes : `/farms/{farmId}/[entity]`
- Pagination : `?page=1&limit=20&sort=createdAt&order=desc`
- Format réponse : `{ success, data, meta }`

### Logging
- `debug()` : Détails techniques
- `audit()` : Opérations métier (toujours actif)
- `error()` : Erreurs (toujours actif)

### Codes d'Erreur
- Utiliser `error-codes.ts` pour la traduction FR/EN

---

## Procédures de Session

### Démarrage de session
1. Vérifier que `main` est à jour (`git fetch origin`)
2. Créer/utiliser la branche de session `claude/*`
3. Lire ce fichier CLAUDE.md pour le contexte

### Récupération des modifications des sessions précédentes
1. Lister les branches `claude/*` distantes : `git branch -r | grep claude/`
2. Identifier celles avec des commits non mergés dans main
3. Les merger dans la nouvelle branche si pertinent

---

## Setup Instructions

### After Pulling New Schema Changes

When new Prisma schema changes are pulled, run the following commands:

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Apply database migrations
npx prisma migrate dev --name <migration_name>

# 3. (Optional) Run data migration if provided
# Check prisma/migrations/manual/ for SQL scripts
```

### MVP Mode - Reset Database (PowerShell)

When making major schema changes during MVP, use `db push` instead of migrations:

```powershell
# Delete existing migrations (if corrupted)
Remove-Item -Recurse -Force prisma/migrations

# Reset database and sync schema
npx prisma db push --force-reset

# Regenerate Prisma client
npx prisma generate

# Load seed data
npx ts-node scripts/seed-reference-data.ts
```

### Known Issues

- **Prisma binary download blocked**: In some environments, Prisma engine downloads may be blocked (403 Forbidden). Ensure network access to `binaries.prisma.sh` or configure a proxy.
- **Prisma migration error P3015**: If you get "Could not find the migration file", delete the `prisma/migrations` folder and use `db push --force-reset` instead.

---

## Sessions Précédentes

### Session 2025-12-14
- **MVP Schema Cleanup**: Suppression des tables/ENUMs non utilisées
  - Tables supprimées: `ActiveSubstance`, `ProductCategory`, `AdministrationRoute`, `TherapeuticIndication`, `ProductPackaging`
  - ENUMs supprimés: `VaccineTargetDisease`, `MedicalProductType`
  - FK supprimées: `categoryId`, `substanceId` de Product; `packagingId`, `indicationId`, `routeId` de Treatment
- **Modules NestJS supprimés** (5 modules):
  - `active-substances/`, `product-categories/`, `administration-routes/`, `therapeutic-indications/`, `product-packagings/`
- **Services simplifiés**:
  - `products.service.ts`: Suppression des includes category/substance
  - `treatments.service.ts`: Utilise directement Product.withdrawalMeatDays/withdrawalMilkHours
- **Données dénormalisées dans Product**: categoryCode, composition, therapeuticForm, dosage, administrationRoute, targetSpecies, withdrawalMeatDays, withdrawalMilkHours, prescriptionRequired
- **Action requise**: Exécuter `npx prisma db push --force-reset` puis `npx ts-node scripts/seed-reference-data.ts`

### Session 2025-12-13
- **Pharmacy Module (P1-P2)**: Added pharmacy stats and alerts endpoints
  - GET /api/v1/farms/:farmId/pharmacy/stats
  - GET /api/v1/farms/:farmId/pharmacy/alerts
- **Stock Management (P3)**: Added to FarmerProductLot
  - Fields: initialQuantity, currentStock, stockUnit, purchaseDate, purchasePrice, supplier
  - Endpoint: PUT /api/v1/farms/:farmId/product-configs/:configId/lots/:id/adjust-stock
- **Schema Simplification (P0)**: Added denormalized fields to replace FK references
  - Product: categoryCode, composition, therapeuticForm, dosage, administrationRoute, targetSpecies, withdrawalMeatDays, withdrawalMilkHours, prescriptionRequired
  - Treatment: administrationRoute
- **Complété en session 2025-12-14**: Schema simplifié, tables supprimées

### Session 2024-12-12
- Analyse des specs évolutions Page Lots
- Implémentation planifiée :
  - P1.1 : `currentLot` dans GET /animals
  - P1.2 : filtre `lotId` dans GET /weights
  - P1.3 : Pagination `/lots/stats`
  - P2.1 : GET `/lots/{id}/stats`
  - P2.2 : GET `/lots/{id}/events`
  - P3 : POST `/lots/transfer-animals`
