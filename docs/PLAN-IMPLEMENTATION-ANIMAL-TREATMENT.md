# PLAN D'IMPLÉMENTATION
## Module: Gestion Animal & Registre de Traitement - CORE

**Date:** 2025-11-29
**Référence:** SPECS-ANIMAL-TREATMENT-REGISTRY.md

---

## RÉSUMÉ DES PHASES

| Phase | Description | Dépendances | Priorité |
|-------|-------------|-------------|----------|
| **1** | Schema Prisma (Enums + Tables) | - | 🔴 Critique |
| **2** | Module AnimalStatusHistory | Phase 1 | 🔴 Critique |
| **3** | Extension FarmProductPreference | Phase 1 | 🔴 Critique |
| **4** | Module FarmerProductLot | Phase 3 | 🔴 Critique |
| **5** | Modification Treatment | Phase 4 | 🟡 Important |
| **6** | Module Alertes | Phases 2, 4, 5 | 🟡 Important |
| **7** | Tests & Validation | Toutes | 🟢 Final |

---

## PHASE 1: SCHEMA PRISMA
**Durée estimée:** Base de données

### 1.1 Nouveaux Enums

**Fichier:** `prisma/schema.prisma`

| Enum | Valeurs | Description |
|------|---------|-------------|
| `AnimalStatusType` | WEIGHT, GESTATION, LACTATION, VET_CHECK | Type statut physiologique |
| `DoseUnitType` | ML_PER_KG, ML_PER_HEAD, MG_PER_KG, G_PER_HEAD | Unité dosage personnalisé |

### 1.2 Nouvelle Table: AnimalStatusHistory

```prisma
model AnimalStatusHistory {
  id, animalId, statusType, startDate, endDate, value, notes,
  version, deletedAt, createdAt, updatedAt

  Relations: Animal
  Indexes: [animalId], [statusType], [animalId, statusType, endDate]
}
```

### 1.3 Nouvelle Table: FarmerProductLot

```prisma
model FarmerProductLot {
  id, configId, nickname, officialLotNumber, expiryDate, isActive,
  version, deletedAt, createdAt, updatedAt

  Relations: FarmProductPreference, Treatment[]
  Unique: [configId, officialLotNumber]
  Indexes: [configId], [configId, isActive], [expiryDate]
}
```

### 1.4 Extension Table: FarmProductPreference

Ajouter les champs:
- `packagingId` (FK → ProductPackaging, optionnel)
- `userDefinedDose` (Decimal, nullable)
- `userDefinedDoseUnit` (Enum DoseUnitType, nullable)
- `userDefinedMeatWithdrawal` (Int, nullable, jours)
- `userDefinedMilkWithdrawal` (Int, nullable, heures)

Ajouter les relations:
- `packaging` → ProductPackaging
- `lots` → FarmerProductLot[]

### 1.5 Modification Table: Treatment

- **Ajouter:** `farmerLotId` (FK → FarmerProductLot, optionnel)
- **Supprimer:** `batchNumber`, `batchExpiryDate`
- **Ajouter relation:** `farmerLot` → FarmerProductLot

### 1.6 Modification Table: Animal

- **Ajouter relation:** `statusHistory` → AnimalStatusHistory[]

### 1.7 Modification Table: ProductPackaging

- **Ajouter relation inverse:** `farmPreferences` → FarmProductPreference[]

### 1.8 Tâches Phase 1

- [ ] 1.1 Ajouter enum `AnimalStatusType`
- [ ] 1.2 Ajouter enum `DoseUnitType`
- [ ] 1.3 Créer model `AnimalStatusHistory`
- [ ] 1.4 Créer model `FarmerProductLot`
- [ ] 1.5 Modifier model `FarmProductPreference` (+5 champs, +2 relations)
- [ ] 1.6 Modifier model `Treatment` (+1 FK, -2 champs)
- [ ] 1.7 Modifier model `Animal` (+1 relation)
- [ ] 1.8 Modifier model `ProductPackaging` (+1 relation)
- [ ] 1.9 Générer migration: `npx prisma migrate dev --name animal_status_and_product_lots`
- [ ] 1.10 Valider migration en local

---

## PHASE 2: MODULE AnimalStatusHistory
**Dépendances:** Phase 1

### 2.1 Structure des Fichiers

```
src/animal-status/
├── animal-status.controller.ts
├── animal-status.service.ts
├── animal-status.module.ts
└── dto/
    ├── create-animal-status.dto.ts
    ├── update-animal-status.dto.ts
    ├── query-animal-status.dto.ts
    └── close-animal-status.dto.ts
```

### 2.2 DTOs à Créer

| DTO | Champs | Validations |
|-----|--------|-------------|
| `CreateAnimalStatusDto` | statusType, startDate, endDate?, value, notes? | @IsEnum, @IsDateString, @IsNotEmpty |
| `UpdateAnimalStatusDto` | Partial<Create> | PartialType |
| `QueryAnimalStatusDto` | statusType?, activeOnly?, page, limit | @IsOptional, pagination |
| `CloseAnimalStatusDto` | endDate, notes? | @IsDateString |

### 2.3 Endpoints API

| Méthode | Route | Action | Description |
|---------|-------|--------|-------------|
| POST | `/farms/:farmId/animals/:animalId/status-history` | create | Créer statut |
| GET | `/farms/:farmId/animals/:animalId/status-history` | findAll | Liste paginée |
| GET | `/farms/:farmId/animals/:animalId/status-history/active` | findActive | Statuts actifs |
| GET | `/farms/:farmId/animals/:animalId/status-history/:id` | findOne | Détail |
| PUT | `/farms/:farmId/animals/:animalId/status-history/:id` | update | Modifier |
| PATCH | `/farms/:farmId/animals/:animalId/status-history/:id/close` | close | Clôturer |
| DELETE | `/farms/:farmId/animals/:animalId/status-history/:id` | remove | Supprimer |

### 2.4 Logique Métier

| Règle | Description | Exception |
|-------|-------------|-----------|
| Unicité statut actif | 1 seul statut actif par type par animal | ConflictException |
| Validation dates | startDate ≤ endDate | BadRequestException |
| Vérif animal | Animal doit appartenir à la ferme | NotFoundException |
| Clôture | Ne peut clôturer un statut déjà clôturé | BadRequestException |

### 2.5 Tâches Phase 2

- [ ] 2.1 Créer dossier `src/animal-status/`
- [ ] 2.2 Créer `dto/create-animal-status.dto.ts`
- [ ] 2.3 Créer `dto/update-animal-status.dto.ts`
- [ ] 2.4 Créer `dto/query-animal-status.dto.ts`
- [ ] 2.5 Créer `dto/close-animal-status.dto.ts`
- [ ] 2.6 Créer `dto/index.ts` (exports)
- [ ] 2.7 Créer `animal-status.service.ts` (CRUD + logique métier)
- [ ] 2.8 Créer `animal-status.controller.ts` (7 endpoints)
- [ ] 2.9 Créer `animal-status.module.ts`
- [ ] 2.10 Enregistrer module dans `app.module.ts`
- [ ] 2.11 Tester manuellement les endpoints

---

## PHASE 3: EXTENSION FarmProductPreference
**Dépendances:** Phase 1

### 3.1 Fichiers à Modifier

```
src/farm-product-preferences/
├── dto/
│   ├── create-farm-product-preference.dto.ts  (modifier)
│   ├── update-farm-product-preference.dto.ts  (modifier)
│   └── update-product-config.dto.ts           (créer)
├── farm-product-preferences.service.ts        (modifier)
└── farm-product-preferences.controller.ts     (modifier)
```

### 3.2 Nouveau DTO: UpdateProductConfigDto

```typescript
export class UpdateProductConfigDto {
  packagingId?: string | null;
  userDefinedDose?: number | null;
  userDefinedDoseUnit?: DoseUnitType | null;
  userDefinedMeatWithdrawal?: number | null;
  userDefinedMilkWithdrawal?: number | null;
}
```

### 3.3 Nouveaux Endpoints

| Méthode | Route | Action | Description |
|---------|-------|--------|-------------|
| GET | `/farms/:farmId/product-preferences/:id/config` | getConfig | Récupérer config |
| PUT | `/farms/:farmId/product-preferences/:id/config` | updateConfig | Modifier config |
| DELETE | `/farms/:farmId/product-preferences/:id/config` | resetConfig | Réinitialiser (NULL) |

### 3.4 Modifications Service

| Méthode | Description |
|---------|-------------|
| `getConfig(id)` | Retourne preference avec packaging et lots |
| `updateConfig(id, dto)` | Met à jour les champs userDefined* |
| `resetConfig(id)` | Remet tous les userDefined* à NULL |

### 3.5 Règles de Validation

| Règle | Condition | Message |
|-------|-----------|---------|
| Dose + Unité | Si dose défini, unité obligatoire | "Unité de dosage requise" |
| Dose positive | userDefinedDose >= 0 | "Dosage doit être positif" |
| Délais positifs | withdrawal >= 0 | "Délai doit être positif" |

### 3.6 Tâches Phase 3

- [ ] 3.1 Créer `dto/update-product-config.dto.ts`
- [ ] 3.2 Exporter dans `dto/index.ts`
- [ ] 3.3 Ajouter méthode `getConfig()` dans service
- [ ] 3.4 Ajouter méthode `updateConfig()` dans service
- [ ] 3.5 Ajouter méthode `resetConfig()` dans service
- [ ] 3.6 Ajouter 3 endpoints dans controller
- [ ] 3.7 Mettre à jour les includes Prisma (packaging, lots)
- [ ] 3.8 Tester manuellement les endpoints

---

## PHASE 4: MODULE FarmerProductLot
**Dépendances:** Phase 3

### 4.1 Structure des Fichiers

```
src/farmer-product-lots/
├── farmer-product-lots.controller.ts
├── farmer-product-lots.service.ts
├── farmer-product-lots.module.ts
└── dto/
    ├── create-farmer-product-lot.dto.ts
    ├── update-farmer-product-lot.dto.ts
    ├── query-farmer-product-lot.dto.ts
    └── index.ts
```

### 4.2 DTOs à Créer

| DTO | Champs | Validations |
|-----|--------|-------------|
| `CreateFarmerProductLotDto` | nickname, officialLotNumber, expiryDate, isActive? | @IsString, @IsDateString, @MaxLength |
| `UpdateFarmerProductLotDto` | Partial<Create> | PartialType |
| `QueryFarmerProductLotDto` | isActive?, excludeExpired?, page, limit | @IsOptional |

### 4.3 Endpoints API

| Méthode | Route | Action | Description |
|---------|-------|--------|-------------|
| POST | `/farms/:farmId/product-configs/:configId/lots` | create | Créer lot |
| GET | `/farms/:farmId/product-configs/:configId/lots` | findAll | Liste lots |
| GET | `/farms/:farmId/product-configs/:configId/lots/active` | findActive | Lots actifs |
| GET | `/farms/:farmId/product-configs/:configId/lots/:id` | findOne | Détail lot |
| PUT | `/farms/:farmId/product-configs/:configId/lots/:id` | update | Modifier |
| PATCH | `.../lots/:id/activate` | activate | Activer |
| PATCH | `.../lots/:id/deactivate` | deactivate | Désactiver |
| DELETE | `/farms/:farmId/product-configs/:configId/lots/:id` | remove | Supprimer |

### 4.4 Logique Métier

| Règle | Description | Exception |
|-------|-------------|-----------|
| Unicité lot | officialLotNumber unique par config | ConflictException |
| Date future (création) | expiryDate > aujourd'hui | BadRequestException |
| Vérif config | Config doit appartenir à la ferme | NotFoundException |

### 4.5 Tâches Phase 4

- [ ] 4.1 Créer dossier `src/farmer-product-lots/`
- [ ] 4.2 Créer `dto/create-farmer-product-lot.dto.ts`
- [ ] 4.3 Créer `dto/update-farmer-product-lot.dto.ts`
- [ ] 4.4 Créer `dto/query-farmer-product-lot.dto.ts`
- [ ] 4.5 Créer `dto/index.ts`
- [ ] 4.6 Créer `farmer-product-lots.service.ts` (CRUD + logique)
- [ ] 4.7 Créer `farmer-product-lots.controller.ts` (8 endpoints)
- [ ] 4.8 Créer `farmer-product-lots.module.ts`
- [ ] 4.9 Enregistrer module dans `app.module.ts`
- [ ] 4.10 Tester manuellement les endpoints

---

## PHASE 5: MODIFICATION TREATMENT
**Dépendances:** Phase 4

### 5.1 Fichiers à Modifier

```
src/treatments/
├── dto/
│   └── index.ts                    (modifier: ajouter farmerLotId)
├── treatments.service.ts           (modifier: include farmerLot)
└── treatments.controller.ts        (aucun changement)
```

### 5.2 Modifications DTO

**CreateTreatmentDto:**
```typescript
// Ajouter
@ApiPropertyOptional({ description: 'ID du lot médicament' })
@IsOptional()
@IsUUID()
farmerLotId?: string;

// Supprimer (après vérification aucune utilisation)
// batchNumber?: string;
// batchExpiryDate?: string;
```

### 5.3 Modifications Service

| Méthode | Modification |
|---------|--------------|
| `create()` | Valider farmerLotId si fourni |
| `findAll()` | Include farmerLot dans select |
| `findOne()` | Include farmerLot |

### 5.4 Tâches Phase 5

- [ ] 5.1 Modifier `CreateTreatmentDto` (+farmerLotId)
- [ ] 5.2 Modifier `UpdateTreatmentDto` (+farmerLotId)
- [ ] 5.3 Modifier service `create()` (validation farmerLotId)
- [ ] 5.4 Modifier service `findAll()` (include farmerLot)
- [ ] 5.5 Modifier service `findOne()` (include farmerLot)
- [ ] 5.6 Supprimer batchNumber/batchExpiryDate des DTOs
- [ ] 5.7 Tester création treatment avec farmerLotId

---

## PHASE 6: MODULE ALERTES
**Dépendances:** Phases 2, 4, 5

### 6.1 Structure des Fichiers

```
src/alerts/
├── alerts.controller.ts
├── alerts.service.ts
├── alerts.module.ts
└── dto/
    ├── check-contraindication.dto.ts
    ├── alert-response.dto.ts
    └── index.ts
```

### 6.2 Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/farms/:farmId/alerts/check-contraindication` | Vérifier contre-indication gestation |
| GET | `/farms/:farmId/alerts/check-withdrawal/:animalId` | Vérifier délais d'attente actifs |
| GET | `/farms/:farmId/alerts/expiring-lots` | Lots proches péremption |

### 6.3 Types d'Alertes

| Type | Condition | Sévérité |
|------|-----------|----------|
| `GESTATION_CONTRAINDICATION` | Gestation active + produit CI | warning |
| `WITHDRAWAL_ACTIVE` | Délai viande/lait non terminé | warning |
| `LOT_EXPIRING` | expiryDate ≤ today + 7j | info |
| `LOT_EXPIRED` | expiryDate < today | warning |

### 6.4 Format Réponse Alerte

```typescript
interface AlertResponse {
  hasAlert: boolean;
  alertType?: string;
  message?: string;         // Clé i18n
  severity?: 'info' | 'warning' | 'error';
  details?: Record<string, any>;
}
```

### 6.5 Tâches Phase 6

- [ ] 6.1 Créer dossier `src/alerts/`
- [ ] 6.2 Créer `dto/check-contraindication.dto.ts`
- [ ] 6.3 Créer `dto/alert-response.dto.ts`
- [ ] 6.4 Créer `dto/index.ts`
- [ ] 6.5 Créer `alerts.service.ts` (3 méthodes check)
- [ ] 6.6 Créer `alerts.controller.ts` (3 endpoints)
- [ ] 6.7 Créer `alerts.module.ts`
- [ ] 6.8 Enregistrer module dans `app.module.ts`
- [ ] 6.9 Tester les 3 types d'alertes

---

## PHASE 7: TESTS & VALIDATION
**Dépendances:** Toutes les phases

### 7.1 Tests Unitaires

| Module | Fichier | Coverage cible |
|--------|---------|----------------|
| AnimalStatus | `animal-status.service.spec.ts` | 80% |
| FarmerProductLot | `farmer-product-lots.service.spec.ts` | 80% |
| FarmProductPreference | `farm-product-preferences.service.spec.ts` | 70% |
| Alerts | `alerts.service.spec.ts` | 80% |

### 7.2 Tests E2E

| Test | Scénario |
|------|----------|
| Animal Status Flow | Créer → Lire → Clôturer → Supprimer |
| Product Config Flow | Ajouter produit → Configurer → Ajouter lot |
| Treatment + Lot | Créer treatment avec farmerLotId |
| Alert Gestation | Créer statut gestation → Vérifier alerte |
| Alert Withdrawal | Créer treatment → Vérifier délai actif |

### 7.3 Tâches Phase 7

- [ ] 7.1 Tests unitaires AnimalStatusService
- [ ] 7.2 Tests unitaires FarmerProductLotsService
- [ ] 7.3 Tests unitaires AlertsService
- [ ] 7.4 Tests E2E animal-status
- [ ] 7.5 Tests E2E farmer-product-lots
- [ ] 7.6 Tests E2E alerts
- [ ] 7.7 Validation manuelle complète
- [ ] 7.8 Documentation API Swagger vérifiée

---

## CHECKLIST GLOBALE

### Phase 1: Schema Prisma
- [ ] Enums créés
- [ ] Tables créées
- [ ] Relations ajoutées
- [ ] Migration générée
- [ ] Migration appliquée

### Phase 2: AnimalStatusHistory
- [ ] DTOs créés
- [ ] Service implémenté
- [ ] Controller implémenté
- [ ] Module enregistré
- [ ] Endpoints testés

### Phase 3: FarmProductPreference
- [ ] DTO config créé
- [ ] Service étendu
- [ ] Controller étendu
- [ ] Endpoints testés

### Phase 4: FarmerProductLot
- [ ] DTOs créés
- [ ] Service implémenté
- [ ] Controller implémenté
- [ ] Module enregistré
- [ ] Endpoints testés

### Phase 5: Treatment
- [ ] DTO modifié
- [ ] Service modifié
- [ ] Tests avec farmerLotId

### Phase 6: Alertes
- [ ] DTOs créés
- [ ] Service implémenté
- [ ] Controller implémenté
- [ ] Module enregistré
- [ ] 3 types d'alertes testés

### Phase 7: Tests
- [ ] Tests unitaires
- [ ] Tests E2E
- [ ] Validation manuelle
- [ ] Documentation à jour

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

```
1. Phase 1 (Prisma) ────────────────────────────────┐
                                                    │
2. Phase 2 (AnimalStatus) ──────────────────────────┤
                                                    ├──→ Phase 6 (Alertes)
3. Phase 3 (FarmProductPreference) ─┐               │
                                    ├──→ Phase 5 ───┤
4. Phase 4 (FarmerProductLot) ──────┘               │
                                                    │
7. Phase 7 (Tests) ←────────────────────────────────┘
```

---

**FIN DU PLAN**
