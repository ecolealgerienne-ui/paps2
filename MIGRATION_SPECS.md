# Spécification de Migration - Système de Préférences Fermier (ANI_TRA)

**Version:** 1.0
**Date:** 2024-11-25
**Statut:** MVP - Plan de migration pour mise en œuvre
**Contexte:** Consolidation des données maîtres avec pattern Master Table (scope + farmId)

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Contexte et objectifs](#contexte-et-objectifs)
3. [Architecture cible](#architecture-cible)
4. [Tables impactées](#tables-impactées)
5. [Détail des modifications](#détail-des-modifications)
6. [Champs optionnels par scope](#champs-optionnels-par-scope)
7. [Suppression de tables](#suppression-de-tables)
8. [Considérations MVP](#considérations-mvp)

---

## Vue d'ensemble

### Résumé exécutif

Le système PAPS2 doit passer d'une architecture **dual-table** (Global + Custom) à une architecture **Master Table unifiée** pour simplifier :
- La gestion des données maîtres (référentiels globaux)
- Les préférences fermier (sélections personnelles)
- Les données farm-spécifiques (créées par le fermier)

**3 tables consolidées** utilisant le pattern **scope + farmId**:
1. `veterinarians` (déjà existante, à adapter)
2. `medical_products` (consolide GlobalMedicalProduct + CustomMedicalProduct)
3. `vaccines` (consolide VaccineGlobal + CustomVaccine)

**9 autres tables** à mettre à jour pour utiliser les nouvelles FKs.

**4 tables** à supprimer (anciennes tables duales).

---

## Contexte et objectifs

### Problème actuel

L'application PAPS2 gère les données agricoles des fermiers avec une architecture **fragmentée** :

```
Situation AVANT:
├── Données globales
│   ├── GlobalMedicalProduct (catalogue international)
│   ├── VaccineGlobal (catalogue international)
│   └── Veterinarian (multi-tenant, tous farm-spécifiques)
│
├── Données farm-spécifiques
│   ├── CustomMedicalProduct (créées par fermier)
│   ├── CustomVaccine (créées par fermier)
│   └── (pas de vétérinaires farm-spécifiques)
│
└── Préférences fermier
    ├── FarmProductPreference (XOR: globalProductId | customProductId)
    ├── FarmVaccinePreference (XOR: globalVaccineId | customVaccineId)
    ├── FarmVeterinarianPreference
    └── FarmBreedPreference
```

**Problèmes**:
- 2 tables séparées pour produits et vaccins → logique XOR complexe
- Pas de vétérinaires globaux (tous farm-spécifiques actuellement)
- Les données transactionnelles (Treatment, Vaccination, Lot, PersonalCampaign) n'ont pas de FKs cohérents
- Requêtes complexes pour récupérer "les données du fermier"

### Objectif de migration

Consolider vers une architecture **propre et scalable**:

```
Situation APRÈS:
├── Données unifiées (Master Table Pattern)
│   ├── veterinarians (scope + farmId nullable)
│   ├── medical_products (scope + farmId nullable)
│   └── vaccines (scope + farmId nullable)
│
└── Préférences fermier (simplifié)
    ├── FarmVeterinarianPreference (FK simple)
    ├── FarmProductPreference (FK simple, pas XOR)
    ├── FarmVaccinePreference (FK simple, pas XOR)
    └── FarmBreedPreference
```

**Avantages**:
- Logique uniforme : une seule table par entité
- Scope pattern : distingue global (admin) vs local (fermier)
- FKs cohérents dans toutes les tables transactionnelles
- Requêtes simplifiées pour les préférences fermier
- Scalabilité : ajouter un type de donnée maître = ajouter 1 table

---

## Architecture cible

### Master Table Pattern

Chaque table maître consolidée suit le pattern:

```prisma
model VotreMaitreTable {
  id       String    @id @default(uuid())

  // 🆕 SCOPE PATTERN
  scope    String    // "global" | "local"
  farmId   String?   // NULL si global, SET si local (farm-spécifique)

  // Champs métier
  code     String    @unique  // Unique globalement
  name     String
  // ... autres champs

  // Métadonnées
  isActive Boolean   @default(true)
  version  Int       @default(1)
  deletedAt DateTime? // Soft delete
  createdAt, updatedAt DateTime

  // Relations
  farm     Farm?     @relation(fields: [farmId], references: [id], onDelete: Cascade)

  // Indexes
  @@index([scope])
  @@index([farmId])
  @@index([scope, farmId])

  @@map("table_name")
}
```

### Logique scope

| Scope | farmId | Créé par | Utilisable par | Exemple |
|-------|--------|----------|----------------|---------|
| `global` | NULL | Admin | Toutes les fermes | Vétérinaire national |
| `local` | SET | Fermier | Ferme spécifique | Vétérinaire local |

---

## Tables impactées

### Résumé des changements

**Total: 13 tables impactées**

| Type | Tables | Nombre |
|------|--------|--------|
| **À consolider/restructurer** | veterinarians, medical_products, vaccines | 3 |
| **FKs à mettre à jour** | treatments, vaccinations, lots, personal_campaigns, farm_product_preferences, farm_vaccine_preferences, product_countries, vaccine_countries | 8 |
| **À supprimer** | global_medical_products, custom_medical_products, vaccines_global, custom_vaccines | 4 |

---

## Détail des modifications

### 1. VETERINARIANS - Master Table (Multi-scope)

**Statut**: Existante, à adapter
**Impact**: Moyenne
**Phase**: Implémentation

#### Changements structurels

**Ajouter colonnes**:
```prisma
scope   String   // "global" | "local"
farmId  String?  @map("farm_id")  // Rendre NULLABLE (actuellement NOT NULL)
```

**Contrainte**:
- Si `scope='global'` → `farmId` MUST be NULL
- Si `scope='local'` → `farmId` MUST be NOT NULL

**Index à ajouter**:
```prisma
@@index([scope])
@@index([scope, farmId])  // Pour requêtes "vétérinaires de cette ferme"
```

#### Champs obligatoires par scope

**Pour scope='global'** (créé par admin):
- `firstName`, `lastName` → NOT NULL
- `licenseNumber` → NOT NULL
- `phone` → NOT NULL
- `specialties` → NOT NULL

**Pour scope='local'** (créé par fermier):
- `firstName`, `lastName` → NOT NULL
- `licenseNumber` → **NULLABLE**
- `phone` → **NULLABLE**
- `specialties` → **NULLABLE**

#### Champs affectés

| Champ | Actuel | Changement | Raison |
|-------|--------|-----------|--------|
| `farmId` | NOT NULL | → NULLABLE | Permettre vétérinaires globaux |
| `licenseNumber` | NOT NULL | → NULLABLE | Fermier peut ne pas avoir de licence |
| `specialties` | NOT NULL | → NULLABLE | Fermier peut ne pas catégoriser |
| `phone` | NOT NULL | → NULLABLE | Contact optionnel pour farm-spécifique |

#### Migration

```
AVANT (exemple):
id: uuid-1
farmId: "farm-123"  ← farm-spécifique (Dr. Marie pour Ferme 123)
firstName: "Marie"
licenseNumber: "VET-12345"

APRÈS:
id: uuid-1
scope: "local"
farmId: "farm-123"  ← toujours farm-spécifique
firstName: "Marie"
licenseNumber: "VET-12345"  ← optionnel, peut être NULL

APRÈS (nouveau vétérinaire global créé par admin):
id: uuid-2
scope: "global"
farmId: NULL  ← utilisable par toutes les fermes
firstName: "Pierre"
licenseNumber: "VET-67890"  ← obligatoire pour global
```

---

### 2. MEDICAL_PRODUCTS - Master Table (Consolidation)

**Statut**: Existe (`medical_products`), restructuration nécessaire
**Impact**: Haute
**Phase**: Implémentation

#### Consolidation des tables sources

Consolide:
- `global_medical_products` (scope='global', farmId=NULL)
- `custom_medical_products` (scope='local', farmId=SET)

#### Changements structurels

**Ajouter colonnes**:
```prisma
scope   String              // "global" | "local"
farmId  String?  @map("farm_id")  // NULL si global, SET si farm-spécifique
```

**Index à ajouter**:
```prisma
@@index([scope])
@@index([farmId])
@@index([scope, farmId])
@@index([scope, isActive])  // Pour requêtes de catalogue
```

#### Champs obligatoires par scope

**Pour scope='global'** (admin - GlobalMedicalProduct):
- `code` → NOT NULL, UNIQUE
- `nameFr`, `nameEn`, `nameAr` → NOT NULL
- `type` (MedicalProductType ENUM) → NOT NULL
- `withdrawalPeriodMeat`, `withdrawalPeriodMilk` → NOT NULL (jours)
- `stockUnit` → NOT NULL

**Pour scope='local'** (fermier - CustomMedicalProduct):
- `nameFr` (ou `name`) → NOT NULL (au minimum le nom)
- `type` → **NULLABLE** (fermier peut ne pas catégoriser précisément)
- `code` → **NULLABLE ou UNIQUE par farm** (fermier n'a pas de code)
- `withdrawalPeriodMeat`, `withdrawalPeriodMilk` → **NULLABLE** (fermier peut ne pas connaître)
- `stockUnit` → **NULLABLE** (optionnel pour fermier)
- `category` → rester NOT NULL (au moins une catégorie)

#### Champs affectés

| Champ | Changement | Raison |
|-------|-----------|--------|
| `scope` | Nouveau | Distinguer global vs local |
| `farmId` | Nouveau | Identifier propriétaire farm-spécifique |
| `code` | Optionnel pour local | Fermier n'utilise pas de code |
| `type` | Optionnel pour local | Simplification saisie fermier |
| `withdrawalPeriodMeat` | Optionnel pour local | Fermier peut ne pas connaître |
| `withdrawalPeriodMilk` | Optionnel pour local | Fermier peut ne pas connaître |
| `stockUnit` | Optionnel pour local | Simplifié pour fermier |

#### Migration

```
AVANT:
Table: global_medical_products
id: uuid-1
code: "enrofloxacine-100"
nameFr: "Enrofloxacine 100mg"
type: "antibiotic"
withdrawalPeriodMeat: 7
withdrawalPeriodMilk: 36

Table: custom_medical_products
id: uuid-2
farmId: "farm-123"
name: "Antibio local"
category: "antibiotic"
withdrawalPeriodMeat: 5
withdrawalPeriodMilk: 24

APRÈS (table unifiée: medical_products):
id: uuid-1
scope: "global"
farmId: NULL
code: "enrofloxacine-100"
nameFr: "Enrofloxacine 100mg"
type: "antibiotic"
withdrawalPeriodMeat: 7
withdrawalPeriodMilk: 36

id: uuid-2
scope: "local"
farmId: "farm-123"
code: NULL  ← optionnel pour local
nameFr: "Antibio local"
type: "antibiotic"  ← peut rester ou devenir NULL
withdrawalPeriodMeat: 5
withdrawalPeriodMilk: 24
```

---

### 3. VACCINES - Master Table (Consolidation)

**Statut**: Existe (`vaccines`), restructuration nécessaire
**Impact**: Haute
**Phase**: Implémentation

#### Consolidation des tables sources

Consolide:
- `vaccines_global` (scope='global', farmId=NULL)
- `custom_vaccines` (scope='local', farmId=SET)

#### Changements structurels

**Ajouter colonnes**:
```prisma
scope   String              // "global" | "local"
farmId  String?  @map("farm_id")  // NULL si global, SET si farm-spécifique
```

**Index à ajouter**:
```prisma
@@index([scope])
@@index([farmId])
@@index([scope, farmId])
@@index([scope, isActive])
```

#### Champs obligatoires par scope

**Pour scope='global'** (admin - VaccineGlobal):
- `code` → NOT NULL, UNIQUE
- `nameFr`, `nameEn`, `nameAr` → NOT NULL
- `targetDisease` (VaccineTargetDisease ENUM) → NOT NULL
- `dosageRecommande`, `dureeImmunite` → déjà optionnels

**Pour scope='local'** (fermier - CustomVaccine):
- `nameFr` (ou `name`) → NOT NULL
- `targetDisease` → **NULLABLE** (fermier peut ne pas connaître le nom exact)
- `code` → **NULLABLE ou UNIQUE par farm** (fermier n'a pas de code)
- `laboratoire` → **NULLABLE** (optionnel pour fermier)
- Autres champs → déjà optionnels

#### Champs affectés

| Champ | Changement | Raison |
|-------|-----------|--------|
| `scope` | Nouveau | Distinguer global vs local |
| `farmId` | Nouveau | Identifier propriétaire farm-spécifique |
| `code` | Optionnel pour local | Fermier n'utilise pas de code |
| `targetDisease` | Optionnel pour local | Fermier peut ne pas connaître |
| `laboratoire` | Optionnel pour local | Optionnel pour fermier |

#### Migration

```
AVANT:
Table: vaccines_global
id: uuid-1
code: "fmd-boehringer"
nameFr: "Vaccin FMD - Boehringer"
targetDisease: "foot_and_mouth"
laboratoire: "Boehringer Ingelheim"

Table: custom_vaccines
id: uuid-2
farmId: "farm-123"
name: "Mon vaccin local"
targetDisease: "rabies"
laboratoire: NULL

APRÈS (table unifiée: vaccines):
id: uuid-1
scope: "global"
farmId: NULL
code: "fmd-boehringer"
nameFr: "Vaccin FMD - Boehringer"
targetDisease: "foot_and_mouth"
laboratoire: "Boehringer Ingelheim"

id: uuid-2
scope: "local"
farmId: "farm-123"
code: NULL  ← optionnel pour local
nameFr: "Mon vaccin local"
targetDisease: "rabies"  ← peut rester ou devenir NULL
laboratoire: NULL
```

---

### 4. TREATMENTS - Mettre à jour FK

**Statut**: Existante, à adapter
**Impact**: Moyenne
**Phase**: Implémentation

#### Changement FK

**Avant**:
```prisma
productId       String   @map("product_id")
product         CustomMedicalProduct? @relation(fields: [productId], references: [id])
```

**Après**:
```prisma
productId       String   @map("product_id")
product         MedicalProduct? @relation(fields: [productId], references: [id])
```

**Raison**: Unifier la FK vers la table consolidée `medical_products`

#### Compatibilité

- Garder `productName` pour traçabilité historique
- La FK peut référencer produits globaux ou farm-spécifiques

---

### 5. VACCINATIONS - Ajouter FK vers vaccines

**Statut**: Existante, à compléter
**Impact**: Haute (FK manquante)
**Phase**: Implémentation

#### Changement principal

**Avant**:
```prisma
vaccineName     String    @map("vaccine_name")  // ← String, pas FK!
// Pas de relation vers les vaccins
```

**Après**:
```prisma
vaccineId       String?   @map("vaccine_id")    // ← FK
vaccineName     String    @map("vaccine_name")  // Garder pour compatibilité
vaccine         Vaccine?  @relation(fields: [vaccineId], references: [id])
```

**Raison**: Créer un lien structuré vers les vaccins (global ou farm-spécifique)

#### Impact

- Permet de tracer quel vaccin exact a été utilisé
- Facilite les requêtes de validation (ex: vaccin doit être actif)
- Améliore l'intégrité des données

---

### 6. LOTS - Ajouter FK vers medical_products

**Statut**: Existante, à compléter
**Impact**: Moyenne
**Phase**: Implémentation

#### Changement

**Avant**:
```prisma
productId       String?   @map("product_id")  // ← String, pas FK
productName     String?   @map("product_name")
// Pas de relation
```

**Après**:
```prisma
productId       String?   @map("product_id")  // ← FK
productName     String?   @map("product_name")  // Garder pour compatibilité
product         MedicalProduct? @relation(fields: [productId], references: [id])
```

**Raison**: Lier le lot au produit médical spécifique

---

### 7. PERSONAL_CAMPAIGNS - Ajouter FK vers medical_products

**Statut**: Existante, à compléter
**Impact**: Moyenne
**Phase**: Implémentation

#### Changement

**Avant**:
```prisma
productId       String    @map("product_id")  // ← String, pas FK
productName     String    @map("product_name")
// Pas de relation
```

**Après**:
```prisma
productId       String    @map("product_id")  // ← FK
productName     String    @map("product_name")  // Garder pour compatibilité
product         MedicalProduct @relation(fields: [productId], references: [id])
```

**Raison**: Lier la campagne au produit médical spécifique

---

### 8. FARM_PRODUCT_PREFERENCES - Simplifier XOR

**Statut**: Existante, à restructurer
**Impact**: Moyenne
**Phase**: Implémentation

#### Changement pattern

**Avant** (XOR):
```prisma
globalProductId  String?   @map("global_product_id")  // ← Soit l'un,
customProductId  String?   @map("custom_product_id")  // soit l'autre
// XOR constraint: exactly one must be filled
```

**Après** (FK simple):
```prisma
productId        String    @map("product_id")  // ← Une seule FK
product          MedicalProduct @relation(fields: [productId], references: [id])
```

**Raison**:
- Simplifier la logique (plus de vérification XOR)
- Une seule FK vers table consolidée
- Peut référencer produit global ou farm-spécifique

#### Migration des données

```
AVANT:
id: uuid-1, farmId: "farm-1", globalProductId: "prod-global-1", customProductId: NULL
id: uuid-2, farmId: "farm-1", globalProductId: NULL, customProductId: "prod-custom-2"

APRÈS:
id: uuid-1, farmId: "farm-1", productId: "prod-global-1" (produit global)
id: uuid-2, farmId: "farm-1", productId: "prod-custom-2" (produit farm-spécifique)
```

---

### 9. FARM_VACCINE_PREFERENCES - Simplifier XOR

**Statut**: Existante, à restructurer
**Impact**: Moyenne
**Phase**: Implémentation

#### Changement pattern

**Avant** (XOR):
```prisma
globalVaccineId  String?   @map("global_vaccine_id")  // ← Soit l'un,
customVaccineId  String?   @map("custom_vaccine_id")  // soit l'autre
// XOR constraint
```

**Après** (FK simple):
```prisma
vaccineId        String    @map("vaccine_id")  // ← Une seule FK
vaccine          Vaccine @relation(fields: [vaccineId], references: [id])
```

**Raison**: Identique à FarmProductPreference

#### Migration des données

```
AVANT:
id: uuid-1, farmId: "farm-1", globalVaccineId: "vac-global-1", customVaccineId: NULL
id: uuid-2, farmId: "farm-1", globalVaccineId: NULL, customVaccineId: "vac-custom-2"

APRÈS:
id: uuid-1, farmId: "farm-1", vaccineId: "vac-global-1" (vaccin global)
id: uuid-2, farmId: "farm-1", vaccineId: "vac-custom-2" (vaccin farm-spécifique)
```

---

### 10. PRODUCT_COUNTRIES - Mettre à jour FK

**Statut**: Existante, à adapter
**Impact**: Basse
**Phase**: Implémentation

#### Changement FK

**Avant**:
```prisma
productId   String    @map("product_id")
product     GlobalMedicalProduct @relation(fields: [productId], references: [id], onDelete: Cascade)
```

**Après**:
```prisma
productId   String    @map("product_id")
product     MedicalProduct @relation(fields: [productId], references: [id], onDelete: Cascade)
```

**Raison**: Pointe vers table consolidée `medical_products`

#### Considération

- Après migration, cette table ne contiendra que des produits globaux (scope='global', farmId=NULL)
- Les produits farm-spécifiques (scope='local') ne sont pas liés à des pays

---

### 11. VACCINE_COUNTRIES - Mettre à jour FK

**Statut**: Existante, à adapter
**Impact**: Basse
**Phase**: Implémentation

#### Changement FK

**Avant**:
```prisma
vaccineId   String    @map("vaccine_id")
vaccine     VaccineGlobal @relation(fields: [vaccineId], references: [id], onDelete: Cascade)
```

**Après**:
```prisma
vaccineId   String    @map("vaccine_id")
vaccine     Vaccine @relation(fields: [vaccineId], references: [id], onDelete: Cascade)
```

**Raison**: Pointe vers table consolidée `vaccines`

#### Considération

- Après migration, ne contiendra que vaccins globaux (scope='global', farmId=NULL)

---

## Champs optionnels par scope

### Résumé complet

| Table | Champ | Global (admin) | Local (fermier) |
|-------|-------|--------|---------|
| **veterinarians** | `firstName` | NOT NULL | NOT NULL |
| | `lastName` | NOT NULL | NOT NULL |
| | `licenseNumber` | NOT NULL | **NULLABLE** |
| | `specialties` | NOT NULL | **NULLABLE** |
| | `phone` | NOT NULL | **NULLABLE** |
| **medical_products** | `nameFr` | NOT NULL | NOT NULL |
| | `code` | NOT NULL, UNIQUE | **NULLABLE** |
| | `type` | NOT NULL | **NULLABLE** |
| | `withdrawalPeriodMeat` | NOT NULL | **NULLABLE** |
| | `withdrawalPeriodMilk` | NOT NULL | **NULLABLE** |
| | `stockUnit` | NOT NULL | **NULLABLE** |
| **vaccines** | `nameFr` | NOT NULL | NOT NULL |
| | `code` | NOT NULL, UNIQUE | **NULLABLE** |
| | `targetDisease` | NOT NULL | **NULLABLE** |
| | `laboratoire` | NULLABLE | **NULLABLE** |

---

## Suppression de tables

### Tables à supprimer (après migration)

Une fois les données consolidées dans les tables Master Table, supprimer:

1. **`global_medical_products`**
   - Données migrées vers `medical_products` (scope='global')
   - Toutes FKs mises à jour

2. **`custom_medical_products`**
   - Données migrées vers `medical_products` (scope='local')
   - Toutes FKs mises à jour

3. **`vaccines_global`**
   - Données migrées vers `vaccines` (scope='global')
   - Toutes FKs mises à jour

4. **`custom_vaccines`**
   - Données migrées vers `vaccines` (scope='local')
   - Toutes FKs mises à jour

### Ordre de suppression

```
1. Supprimer les relations des tables enfant (ProductCountry, VaccineCountry)
2. Supprimer global_medical_products et custom_medical_products
3. Supprimer vaccines_global et custom_vaccines
```

---

## Considérations MVP

### Pas de migration de données complexe

**MVP = Pas de preservation des données existantes**

```
Stratégie:
1. Supprimer les données des tables concernées (safe en MVP)
2. Créer les nouvelles structures
3. Les développeurs remplissent manuellement avec les données qui comptent
```

### Tables non affectées

**36 tables totales, 13 impactées, 23 inchangées:**

Tables qui gardent leur structure:
- `species`, `breeds`, `breed_countries`
- `countries`, `national_campaigns`, `campaign_countries`
- `animals`, `farm`, `weights`, `movements`, `documents`
- `administration_routes`, `alert_templates`, `alert_configurations`
- `farm_preferences`, `farm_breed_preferences`, `farm_national_campaign_preferences`
- `sync_queue_items`, `sync_logs`, et autres tables de support

### Validation pendant implémentation

Avant de considérer la migration complète:

```
✅ Vérifier relations FKs cohérentes
✅ Tester requêtes de filtrage par scope
✅ Valider indexes de performance
✅ Confirmer soft deletes fonctionnent
✅ Vérifier contraintes scope (global/local)
```

---

## Checklist d'implémentation

### Phase 1: Structuration (Prisma Schema)

- [ ] Ajouter `scope` et `farmId` à `veterinarians`
- [ ] Ajouter `scope` et `farmId` à `medical_products`
- [ ] Ajouter `scope` et `farmId` à `vaccines`
- [ ] Créer indexes par scope
- [ ] Ajouter FK vers `medical_products` à `treatments`
- [ ] Ajouter FK vers `vaccines` à `vaccinations`
- [ ] Ajouter FK vers `medical_products` à `lots`
- [ ] Ajouter FK vers `medical_products` à `personal_campaigns`
- [ ] Remplacer XOR par FK simple dans `farm_product_preferences`
- [ ] Remplacer XOR par FK simple dans `farm_vaccine_preferences`
- [ ] Mettre à jour FK dans `product_countries`
- [ ] Mettre à jour FK dans `vaccine_countries`
- [ ] Marquer anciennes tables pour suppression (`global_medical_products`, etc.)

### Phase 2: Validation

- [ ] Générer migration Prisma
- [ ] Tester contraintes scope
- [ ] Vérifier relationships
- [ ] Valider indexes
- [ ] Tester soft deletes et versioning

### Phase 3: Backend API

- [ ] Ajouter logique scope dans les queries
- [ ] Créer endpoints pour scope='global' (admin)
- [ ] Créer endpoints pour scope='local' (fermier)
- [ ] Implémenter filtrage par farmId
- [ ] Ajouter validation scope

### Phase 4: Suppression

- [ ] Confirmer aucune FK orpheline
- [ ] Supprimer `global_medical_products`
- [ ] Supprimer `custom_medical_products`
- [ ] Supprimer `vaccines_global`
- [ ] Supprimer `custom_vaccines`

---

## Annexe: Exemples de requêtes cibles

### Récupérer les vétérinaires disponibles pour une ferme

```sql
-- Vétérinaires globaux + vétérinaires de cette ferme
SELECT * FROM veterinarians
WHERE scope = 'global' OR farmId = 'farm-123'
AND isActive = true
ORDER BY lastName, firstName;
```

### Récupérer les produits de préférence d'une ferme

```sql
SELECT p.*
FROM medical_products p
JOIN farm_product_preferences fpp ON p.id = fpp.product_id
WHERE fpp.farm_id = 'farm-123'
AND p.isActive = true
ORDER BY fpp.display_order;
```

### Récupérer produits globaux (admin)

```sql
SELECT * FROM medical_products
WHERE scope = 'global'
AND isActive = true
ORDER BY nameFr;
```

### Récupérer produits farm-spécifiques

```sql
SELECT * FROM medical_products
WHERE scope = 'local' AND farmId = 'farm-123'
AND isActive = true;
```

---

## Document validé

**Créé par**: Analyse système
**Date**: 2024-11-25
**Statut**: Prêt pour implémentation MVP
**Approuvé pour**: Mise en œuvre développement
