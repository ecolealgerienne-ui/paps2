# 📚 Spécifications des Tables de Référence - PAPS2

**Date** : 2025-11-23
**Version** : 1.0
**Auteur** : Analyse technique du schéma Prisma

---

## Table des matières

1. [Species (Espèces)](#1-species-espèces)
2. [Breeds (Races)](#2-breeds-races)
3. [MedicalProducts (Produits médicaux)](#3-medicalproducts-produits-médicaux)
4. [Vaccines (Vaccins)](#4-vaccines-vaccins)
5. [Veterinarians (Vétérinaires)](#5-veterinarians-vétérinaires)
6. [Campaigns (Campagnes)](#6-campaigns-campagnes)
7. [FarmPreferences (Préférences ferme)](#7-farmpreferences-préférences-ferme)
8. [AlertConfiguration (Configuration alertes)](#8-alertconfiguration-configuration-alertes)
9. [Farms (Fermes)](#9-farms-fermes)

---

# 1. Species (Espèces)

## 1.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom de la table** | `species` |
| **Modèle Prisma** | `Species` |
| **Type** | Table de référence globale (non multi-tenant) |
| **Description** | Référentiel des espèces animales disponibles dans le système (bovins, ovins, caprins, équins, volailles, etc.) |
| **Usage** | Utilisée pour classifier les animaux par espèce et filtrer les races disponibles |

## 1.2. Structure des champs

| Champ | Type DB | Type TS | Obligatoire | Défaut | Description | Contraintes |
|-------|---------|---------|-------------|--------|-------------|-------------|
| `id` | VARCHAR | string | ✅ Oui | - | Identifiant unique de l'espèce | PRIMARY KEY |
| `nameFr` | VARCHAR | string | ✅ Oui | - | Nom de l'espèce en français | - |
| `nameEn` | VARCHAR | string | ✅ Oui | - | Nom de l'espèce en anglais | - |
| `nameAr` | VARCHAR | string | ✅ Oui | - | Nom de l'espèce en arabe | - |
| `icon` | VARCHAR | string | ✅ Oui | - | Code/nom de l'icône | - |
| `displayOrder` | INTEGER | number | ✅ Oui | `0` | Ordre d'affichage dans les listes | >= 0 |

**Mapping colonnes** : `name_fr`, `name_ar`, `name_en`, `display_order`

## 1.3. Relations

### Relations sortantes (1:N)

| Relation | Modèle cible | Type | Description |
|----------|--------------|------|-------------|
| `animals` | `Animal[]` | One-to-Many | Liste des animaux de cette espèce |
| `breeds` | `Breed[]` | One-to-Many | Liste des races disponibles pour cette espèce |

### Relations entrantes

Aucune (table racine du référentiel)

## 1.4. Index et clés

| Type | Champs | Description |
|------|--------|-------------|
| PRIMARY KEY | `id` | Identifiant unique |

**Aucun index secondaire défini**

## 1.5. 🚨 Problèmes identifiés

### ❌ Problèmes critiques

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 1 | **Pas de soft delete** (`deletedAt`) | Impossible de supprimer une espèce utilisée par des animaux sans casser les références. Perte de données si suppression forcée. | 🔴 URGENT |
| 2 | **Pas de timestamps** (`createdAt`, `updatedAt`) | Impossible de tracer quand une espèce a été ajoutée ou modifiée. Problèmes d'audit. | 🔴 URGENT |
| 3 | **Pas de versioning** (`version`) | Pas de gestion des conflits lors de la synchronisation offline. Risque d'écrasement de données. | 🟡 IMPORTANT |

### ⚠️ Problèmes mineurs

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 4 | **Pas de champ `isActive`** | Impossible de désactiver temporairement une espèce sans la supprimer. Mauvaise UX. | 🟡 IMPORTANT |
| 5 | **Pas d'index sur `displayOrder`** | Performances dégradées lors du tri des espèces pour l'affichage. | 🟢 AMÉLIORATION |

## 1.6. 🔧 Recommandations

### Migration nécessaire

```prisma
model Species {
  id           String    @id
  nameFr       String    @map("name_fr")
  nameEn       String    @map("name_en")
  nameAr       String    @map("name_ar")
  icon         String
  displayOrder Int       @default(0) @map("display_order")

  // 🆕 AJOUTS RECOMMANDÉS
  isActive     Boolean   @default(true) @map("is_active")
  version      Int       @default(1)
  deletedAt    DateTime? @map("deleted_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  animals Animal[]
  breeds  Breed[]

  @@index([deletedAt])
  @@index([displayOrder])
  @@map("species")
}
```

## 1.7. Notes techniques

- **Multi-tenant** : Non (données partagées entre toutes les fermes)
- **Données de seed** : Oui (données pré-remplies lors de l'initialisation)
- **Modifiable par l'utilisateur** : Non (sauf admin système)
- **Synchronisation** : Non nécessaire (données statiques côté serveur)

---

# 2. Breeds (Races)

## 2.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom de la table** | `breeds` |
| **Modèle Prisma** | `Breed` |
| **Type** | Table de référence globale (non multi-tenant) |
| **Description** | Référentiel des races animales par espèce (Montbéliarde, Holstein, Mérinos, Alpine, etc.) |
| **Usage** | Utilisée pour affiner la classification des animaux au sein d'une espèce |

## 2.2. Structure des champs

| Champ | Type DB | Type TS | Obligatoire | Défaut | Description | Contraintes |
|-------|---------|---------|-------------|--------|-------------|-------------|
| `id` | VARCHAR | string | ✅ Oui | - | Identifiant unique de la race | PRIMARY KEY |
| `speciesId` | VARCHAR | string | ✅ Oui | - | ID de l'espèce parente | FOREIGN KEY → species.id |
| `nameFr` | VARCHAR | string | ✅ Oui | - | Nom de la race en français | - |
| `nameEn` | VARCHAR | string | ✅ Oui | - | Nom de la race en anglais | - |
| `nameAr` | VARCHAR | string | ✅ Oui | - | Nom de la race en arabe | - |
| `description` | TEXT | string \| null | ❌ Non | `null` | Description de la race | - |
| `displayOrder` | INTEGER | number | ✅ Oui | `0` | Ordre d'affichage dans les listes | >= 0 |
| `isActive` | BOOLEAN | boolean | ✅ Oui | `true` | Indique si la race est active | - |

**Mapping colonnes** : `species_id`, `name_fr`, `name_en`, `name_ar`, `display_order`, `is_active`

## 2.3. Relations

### Relations sortantes (1:N)

| Relation | Modèle cible | Type | Description |
|----------|--------------|------|-------------|
| `animals` | `Animal[]` | One-to-Many | Liste des animaux de cette race |

### Relations entrantes (N:1)

| Relation | Modèle source | Type | Description |
|----------|---------------|------|-------------|
| `species` | `Species` | Many-to-One | Espèce parente de cette race |

## 2.4. Index et clés

| Type | Champs | Description |
|------|--------|-------------|
| PRIMARY KEY | `id` | Identifiant unique |
| FOREIGN KEY | `speciesId` → `species.id` | Référence à l'espèce |

**Aucun index secondaire défini**

## 2.5. 🚨 Problèmes identifiés

### ❌ Problèmes critiques

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 1 | **Pas de soft delete** (`deletedAt`) | Impossible de supprimer une race utilisée par des animaux sans casser les références. | 🔴 URGENT |
| 2 | **Pas de timestamps** (`createdAt`, `updatedAt`) | Impossible de tracer quand une race a été ajoutée ou modifiée. | 🔴 URGENT |
| 3 | **Pas de versioning** (`version`) | Pas de gestion des conflits lors de la synchronisation offline. | 🟡 IMPORTANT |

### ⚠️ Problèmes mineurs

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 4 | **Pas d'index sur `speciesId`** | Performances dégradées lors du filtrage des races par espèce. | 🟡 IMPORTANT |
| 5 | **Pas d'index sur `displayOrder`** | Performances dégradées lors du tri des races. | 🟢 AMÉLIORATION |

## 2.6. 🔧 Recommandations

### Migration nécessaire

```prisma
model Breed {
  id           String    @id
  speciesId    String    @map("species_id")
  nameFr       String    @map("name_fr")
  nameEn       String    @map("name_en")
  nameAr       String    @map("name_ar")
  description  String?
  displayOrder Int       @default(0) @map("display_order")
  isActive     Boolean   @default(true) @map("is_active")

  // 🆕 AJOUTS RECOMMANDÉS
  version      Int       @default(1)
  deletedAt    DateTime? @map("deleted_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  species Species  @relation(fields: [speciesId], references: [id])
  animals Animal[]

  @@index([speciesId])
  @@index([deletedAt])
  @@index([displayOrder])
  @@map("breeds")
}
```

## 2.7. Notes techniques

- **Multi-tenant** : Non (données partagées entre toutes les fermes)
- **Données de seed** : Oui (données pré-remplies lors de l'initialisation)
- **Modifiable par l'utilisateur** : Non (sauf admin système)
- **Synchronisation** : Non nécessaire (données statiques côté serveur)

---

# 3. MedicalProducts (Produits médicaux)

## 3.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom de la table** | `medical_products` |
| **Modèle Prisma** | `MedicalProduct` |
| **Type** | Table de référence **multi-tenant** (par ferme) |
| **Description** | Catalogue des produits médicaux et médicaments utilisés dans la ferme |
| **Usage** | Gestion des stocks, traitements, délais de retrait, et calculs de dosage |

## 3.2. Structure des champs

| Champ | Type DB | Type TS | Obligatoire | Défaut | Description | Contraintes |
|-------|---------|---------|-------------|--------|-------------|-------------|
| `id` | UUID | string | ✅ Oui | `uuid()` | Identifiant unique | PRIMARY KEY |
| `farmId` | VARCHAR | string | ✅ Oui | - | ID de la ferme propriétaire | FOREIGN KEY → farms.id |
| `name` | VARCHAR | string | ✅ Oui | - | Nom du produit | - |
| `commercialName` | VARCHAR | string \| null | ❌ Non | `null` | Nom commercial | - |
| `category` | VARCHAR | string | ✅ Oui | - | Catégorie (antibiotic, anti-inflammatory, etc.) | - |
| `activeIngredient` | VARCHAR | string \| null | ❌ Non | `null` | Principe actif | - |
| `manufacturer` | VARCHAR | string \| null | ❌ Non | `null` | Fabricant | - |
| `form` | VARCHAR | string \| null | ❌ Non | `null` | Forme (tablet, injection, powder, etc.) | - |
| `dosage` | FLOAT | number \| null | ❌ Non | `null` | Dosage | - |
| `dosageUnit` | VARCHAR | string \| null | ❌ Non | `null` | Unité de dosage | - |
| `withdrawalPeriodMeat` | INTEGER | number | ✅ Oui | - | Délai retrait viande (jours) | >= 0 |
| `withdrawalPeriodMilk` | INTEGER | number | ✅ Oui | - | Délai retrait lait (jours) | >= 0 |
| `currentStock` | FLOAT | number | ✅ Oui | `0` | Stock actuel | >= 0 |
| `minStock` | FLOAT | number | ✅ Oui | `0` | Stock minimum | >= 0 |
| `stockUnit` | VARCHAR | string | ✅ Oui | - | Unité de stock | - |
| `unitPrice` | FLOAT | number \| null | ❌ Non | `null` | Prix unitaire | >= 0 |
| `currency` | VARCHAR | string \| null | ❌ Non | `null` | Devise | - |
| `batchNumber` | VARCHAR | string \| null | ❌ Non | `null` | Numéro de lot | - |
| `expiryDate` | TIMESTAMP | Date \| null | ❌ Non | `null` | Date d'expiration | - |
| `storageConditions` | TEXT | string \| null | ❌ Non | `null` | Conditions de stockage | - |
| `prescription` | TEXT | string \| null | ❌ Non | `null` | Notes de prescription | - |
| `type` | VARCHAR | string | ✅ Oui | `"treatment"` | Type (treatment, vaccine) | - |
| `targetSpecies` | VARCHAR | string | ✅ Oui | `""` | Espèces cibles | - |
| `standardCureDays` | INTEGER | number \| null | ❌ Non | `null` | Durée standard du traitement | >= 0 |
| `administrationFrequency` | VARCHAR | string \| null | ❌ Non | `null` | Fréquence d'administration | - |
| `dosageFormula` | VARCHAR | string \| null | ❌ Non | `null` | Formule de calcul du dosage | - |
| `vaccinationProtocol` | TEXT | string \| null | ❌ Non | `null` | Protocole de vaccination | - |
| `reminderDays` | VARCHAR | string \| null | ❌ Non | `null` | Jours de rappel (comma-separated) | - |
| `defaultAdministrationRoute` | VARCHAR | string \| null | ❌ Non | `null` | Voie d'administration par défaut | - |
| `defaultInjectionSite` | VARCHAR | string \| null | ❌ Non | `null` | Site d'injection par défaut | - |
| `notes` | TEXT | string \| null | ❌ Non | `null` | Notes diverses | - |
| `isActive` | BOOLEAN | boolean | ✅ Oui | `true` | Produit actif | - |
| `version` | INTEGER | number | ✅ Oui | `1` | Version (optimistic locking) | >= 1 |
| `deletedAt` | TIMESTAMP | Date \| null | ❌ Non | `null` | Date de suppression (soft delete) | - |
| `createdAt` | TIMESTAMP | Date | ✅ Oui | `now()` | Date de création | - |
| `updatedAt` | TIMESTAMP | Date | ✅ Oui | `now()` | Date de dernière modification | - |

**Mapping colonnes** : `farm_id`, `commercial_name`, `active_ingredient`, `withdrawal_period_meat`, `withdrawal_period_milk`, `current_stock`, `min_stock`, `stock_unit`, `unit_price`, `batch_number`, `expiry_date`, `storage_conditions`, `target_species`, `standard_cure_days`, `administration_frequency`, `dosage_formula`, `vaccination_protocol`, `reminder_days`, `default_administration_route`, `default_injection_site`, `is_active`, `deleted_at`, `created_at`, `updated_at`, `dosage_unit`

## 3.3. Relations

### Relations sortantes (1:N)

| Relation | Modèle cible | Type | Description |
|----------|--------------|------|-------------|
| `treatments` | `Treatment[]` | One-to-Many | Liste des traitements utilisant ce produit |

### Relations entrantes (N:1)

| Relation | Modèle source | Type | Description |
|----------|---------------|------|-------------|
| `farm` | `Farm` | Many-to-One | Ferme propriétaire (CASCADE delete) |

## 3.4. Index et clés

| Type | Champs | Description |
|------|--------|-------------|
| PRIMARY KEY | `id` | Identifiant unique |
| INDEX | `farmId` | Filtrage par ferme |
| INDEX | `deletedAt` | Filtrage des éléments supprimés |

## 3.5. 🚨 Problèmes identifiés

### ✅ Bonne conception

Cette table est **bien conçue** avec :
- ✅ Soft delete (`deletedAt`)
- ✅ Timestamps complets (`createdAt`, `updatedAt`)
- ✅ Versioning (`version`)
- ✅ `isActive` pour désactivation temporaire
- ✅ Index appropriés

### ⚠️ Points d'amélioration

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 1 | **Pas d'index sur `expiryDate`** | Performances dégradées pour les alertes de péremption | 🟡 IMPORTANT |
| 2 | **Pas d'index sur `isActive`** | Performances dégradées lors du filtrage des produits actifs | 🟢 AMÉLIORATION |
| 3 | **Champ `targetSpecies` en VARCHAR** | Devrait être JSON ou relation Many-to-Many pour flexibilité | 🟢 AMÉLIORATION |

## 3.6. 🔧 Recommandations

### Migration suggérée

```prisma
model MedicalProduct {
  // ... tous les champs existants

  @@index([farmId])
  @@index([deletedAt])
  @@index([expiryDate]) // 🆕 AJOUT
  @@index([isActive])   // 🆕 AJOUT
  @@map("medical_products")
}
```

## 3.7. Notes techniques

- **Multi-tenant** : Oui (isolé par `farmId`)
- **Données de seed** : Non (créées par l'utilisateur)
- **Modifiable par l'utilisateur** : Oui
- **Synchronisation** : Oui (gestion offline avec versioning)

---

# 4. Vaccines (Vaccins)

## 4.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom de la table** | `vaccines` |
| **Modèle Prisma** | `Vaccine` |
| **Type** | Table de référence **multi-tenant** (par ferme) |
| **Description** | Catalogue des vaccins disponibles dans la ferme |
| **Usage** | Gestion des protocoles de vaccination et des rappels |

## 4.2. Structure des champs

| Champ | Type DB | Type TS | Obligatoire | Défaut | Description | Contraintes |
|-------|---------|---------|-------------|--------|-------------|-------------|
| `id` | UUID | string | ✅ Oui | `uuid()` | Identifiant unique | PRIMARY KEY |
| `farmId` | VARCHAR | string | ✅ Oui | - | ID de la ferme propriétaire | FOREIGN KEY → farms.id |
| `name` | VARCHAR | string | ✅ Oui | - | Nom du vaccin | - |
| `description` | TEXT | string \| null | ❌ Non | `null` | Description | - |
| `manufacturer` | VARCHAR | string \| null | ❌ Non | `null` | Fabricant | - |
| `targetSpecies` | JSON | any \| null | ❌ Non | `null` | Espèces cibles (JSON array) | - |
| `targetDiseases` | JSON | any \| null | ❌ Non | `null` | Maladies cibles (JSON array) | - |
| `standardDose` | FLOAT | number \| null | ❌ Non | `null` | Dose standard | >= 0 |
| `injectionsRequired` | INTEGER | number | ✅ Oui | `1` | Nombre d'injections requises | >= 1 |
| `injectionIntervalDays` | INTEGER | number \| null | ❌ Non | `null` | Intervalle entre injections (jours) | >= 0 |
| `meatWithdrawalDays` | INTEGER | number \| null | ❌ Non | `null` | Délai retrait viande (jours) | >= 0 |
| `milkWithdrawalDays` | INTEGER | number \| null | ❌ Non | `null` | Délai retrait lait (jours) | >= 0 |
| `administrationRoute` | VARCHAR | string \| null | ❌ Non | `null` | Voie d'administration | - |
| `isActive` | BOOLEAN | boolean | ✅ Oui | `true` | Vaccin actif | - |
| `version` | INTEGER | number | ✅ Oui | `1` | Version (optimistic locking) | >= 1 |
| `deletedAt` | TIMESTAMP | Date \| null | ❌ Non | `null` | Date de suppression (soft delete) | - |
| `createdAt` | TIMESTAMP | Date | ✅ Oui | `now()` | Date de création | - |
| `updatedAt` | TIMESTAMP | Date | ✅ Oui | `now()` | Date de dernière modification | - |

**Mapping colonnes** : `farm_id`, `target_species`, `target_diseases`, `standard_dose`, `injections_required`, `injection_interval_days`, `meat_withdrawal_days`, `milk_withdrawal_days`, `administration_route`, `is_active`, `deleted_at`, `created_at`, `updated_at`

## 4.3. Relations

### Relations entrantes (N:1)

| Relation | Modèle source | Type | Description |
|----------|---------------|------|-------------|
| `farm` | `Farm` | Many-to-One | Ferme propriétaire (CASCADE delete) |

## 4.4. Index et clés

| Type | Champs | Description |
|------|--------|-------------|
| PRIMARY KEY | `id` | Identifiant unique |
| INDEX | `farmId` | Filtrage par ferme |
| INDEX | `deletedAt` | Filtrage des éléments supprimés |

## 4.5. 🚨 Problèmes identifiés

### ✅ Bonne conception

Cette table est **bien conçue** avec :
- ✅ Soft delete (`deletedAt`)
- ✅ Timestamps complets (`createdAt`, `updatedAt`)
- ✅ Versioning (`version`)
- ✅ `isActive` pour désactivation temporaire
- ✅ Utilisation de JSON pour les arrays

### ⚠️ Points d'amélioration

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 1 | **Pas d'index sur `isActive`** | Performances dégradées lors du filtrage des vaccins actifs | 🟢 AMÉLIORATION |

## 4.6. 🔧 Recommandations

### Migration suggérée

```prisma
model Vaccine {
  // ... tous les champs existants

  farm Farm @relation(fields: [farmId], references: [id], onDelete: Cascade)

  @@index([farmId])
  @@index([deletedAt])
  @@index([isActive]) // 🆕 AJOUT
  @@map("vaccines")
}
```

## 4.7. Notes techniques

- **Multi-tenant** : Oui (isolé par `farmId`)
- **Données de seed** : Non (créées par l'utilisateur)
- **Modifiable par l'utilisateur** : Oui
- **Synchronisation** : Oui (gestion offline avec versioning)

---

# 5. Veterinarians (Vétérinaires)

## 5.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom de la table** | `veterinarians` |
| **Modèle Prisma** | `Veterinarian` |
| **Type** | Table de référence **multi-tenant** (par ferme) |
| **Description** | Répertoire des vétérinaires associés à la ferme |
| **Usage** | Gestion des contacts vétérinaires, tarifs, et historique d'interventions |

## 5.2. Structure des champs

| Champ | Type DB | Type TS | Obligatoire | Défaut | Description | Contraintes |
|-------|---------|---------|-------------|--------|-------------|-------------|
| `id` | UUID | string | ✅ Oui | `uuid()` | Identifiant unique | PRIMARY KEY |
| `farmId` | VARCHAR | string | ✅ Oui | - | ID de la ferme propriétaire | FOREIGN KEY → farms.id |
| `firstName` | VARCHAR | string | ✅ Oui | - | Prénom | - |
| `lastName` | VARCHAR | string | ✅ Oui | - | Nom | - |
| `title` | VARCHAR | string \| null | ❌ Non | `null` | Titre (Dr., Pr., etc.) | - |
| `licenseNumber` | VARCHAR | string | ✅ Oui | - | Numéro d'ordre | - |
| `specialties` | VARCHAR | string | ✅ Oui | - | Spécialités (comma-separated or JSON) | - |
| `clinic` | VARCHAR | string \| null | ❌ Non | `null` | Nom de la clinique | - |
| `phone` | VARCHAR | string | ✅ Oui | - | Téléphone | - |
| `mobile` | VARCHAR | string \| null | ❌ Non | `null` | Mobile | - |
| `email` | VARCHAR | string \| null | ❌ Non | `null` | Email | - |
| `address` | TEXT | string \| null | ❌ Non | `null` | Adresse | - |
| `city` | VARCHAR | string \| null | ❌ Non | `null` | Ville | - |
| `postalCode` | VARCHAR | string \| null | ❌ Non | `null` | Code postal | - |
| `country` | VARCHAR | string \| null | ❌ Non | `null` | Pays | - |
| `isAvailable` | BOOLEAN | boolean | ✅ Oui | `true` | Disponible | - |
| `emergencyService` | BOOLEAN | boolean | ✅ Oui | `false` | Service d'urgence | - |
| `workingHours` | TEXT | string \| null | ❌ Non | `null` | Horaires de travail | - |
| `consultationFee` | FLOAT | number \| null | ❌ Non | `null` | Tarif consultation | >= 0 |
| `emergencyFee` | FLOAT | number \| null | ❌ Non | `null` | Tarif urgence | >= 0 |
| `currency` | VARCHAR | string \| null | ❌ Non | `null` | Devise | - |
| `notes` | TEXT | string \| null | ❌ Non | `null` | Notes | - |
| `isPreferred` | BOOLEAN | boolean | ✅ Oui | `false` | Vétérinaire préféré | - |
| `isDefault` | BOOLEAN | boolean | ✅ Oui | `false` | Vétérinaire par défaut | - |
| `rating` | INTEGER | number | ✅ Oui | `5` | Note (1-5) | 1 <= rating <= 5 |
| `totalInterventions` | INTEGER | number | ✅ Oui | `0` | Nombre total d'interventions | >= 0 |
| `lastInterventionDate` | TIMESTAMP | Date \| null | ❌ Non | `null` | Date dernière intervention | - |
| `isActive` | BOOLEAN | boolean | ✅ Oui | `true` | Vétérinaire actif | - |
| `version` | INTEGER | number | ✅ Oui | `1` | Version (optimistic locking) | >= 1 |
| `deletedAt` | TIMESTAMP | Date \| null | ❌ Non | `null` | Date de suppression (soft delete) | - |
| `createdAt` | TIMESTAMP | Date | ✅ Oui | `now()` | Date de création | - |
| `updatedAt` | TIMESTAMP | Date | ✅ Oui | `now()` | Date de dernière modification | - |

**Mapping colonnes** : `farm_id`, `first_name`, `last_name`, `license_number`, `postal_code`, `is_available`, `emergency_service`, `working_hours`, `consultation_fee`, `emergency_fee`, `is_preferred`, `is_default`, `total_interventions`, `last_intervention_date`, `is_active`, `deleted_at`, `created_at`, `updated_at`

## 5.3. Relations

### Relations sortantes (1:N)

| Relation | Modèle cible | Type | Description |
|----------|--------------|------|-------------|
| `treatments` | `Treatment[]` | One-to-Many | Traitements réalisés par ce vétérinaire |
| `vaccinations` | `Vaccination[]` | One-to-Many | Vaccinations réalisées par ce vétérinaire |

### Relations entrantes (N:1)

| Relation | Modèle source | Type | Description |
|----------|---------------|------|-------------|
| `farm` | `Farm` | Many-to-One | Ferme propriétaire (CASCADE delete) |

## 5.4. Index et clés

| Type | Champs | Description |
|------|--------|-------------|
| PRIMARY KEY | `id` | Identifiant unique |
| INDEX | `farmId` | Filtrage par ferme |
| INDEX | `deletedAt` | Filtrage des éléments supprimés |

## 5.5. 🚨 Problèmes identifiés

### ✅ Bonne conception

Cette table est **bien conçue** avec :
- ✅ Soft delete (`deletedAt`)
- ✅ Timestamps complets (`createdAt`, `updatedAt`)
- ✅ Versioning (`version`)
- ✅ `isActive` pour désactivation temporaire
- ✅ Métriques d'utilisation (`totalInterventions`, `lastInterventionDate`)

### ⚠️ Points d'amélioration

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 1 | **Champ `specialties` en VARCHAR** | Devrait être JSON pour flexibilité | 🟢 AMÉLIORATION |
| 2 | **Pas d'index sur `isActive`** | Performances dégradées lors du filtrage | 🟢 AMÉLIORATION |
| 3 | **Pas d'index sur `isDefault`** | Performances dégradées lors de la recherche du vétérinaire par défaut | 🟢 AMÉLIORATION |

## 5.6. 🔧 Recommandations

### Migration suggérée

```prisma
model Veterinarian {
  // ... tous les champs existants

  farm Farm @relation(fields: [farmId], references: [id], onDelete: Cascade)
  treatments Treatment[]
  vaccinations Vaccination[]

  @@index([farmId])
  @@index([deletedAt])
  @@index([isActive])  // 🆕 AJOUT
  @@index([isDefault]) // 🆕 AJOUT
  @@map("veterinarians")
}
```

## 5.7. Notes techniques

- **Multi-tenant** : Oui (isolé par `farmId`)
- **Données de seed** : Non (créées par l'utilisateur)
- **Modifiable par l'utilisateur** : Oui
- **Synchronisation** : Oui (gestion offline avec versioning)

---

# 6. Campaigns (Campagnes)

## 6.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom de la table** | `campaigns` |
| **Modèle Prisma** | `Campaign` |
| **Type** | Table de référence **multi-tenant** (par ferme) |
| **Description** | Gestion des campagnes de vaccination/traitement de masse |
| **Usage** | Organisation et suivi des interventions collectives sur un groupe d'animaux |

## 6.2. Structure des champs

| Champ | Type DB | Type TS | Obligatoire | Défaut | Description | Contraintes |
|-------|---------|---------|-------------|--------|-------------|-------------|
| `id` | UUID | string | ✅ Oui | `uuid()` | Identifiant unique | PRIMARY KEY |
| `farmId` | VARCHAR | string | ✅ Oui | - | ID de la ferme propriétaire | FOREIGN KEY → farms.id |
| `lotId` | VARCHAR | string \| null | ❌ Non | `null` | ID du lot concerné | FOREIGN KEY → lots.id |
| `name` | VARCHAR | string | ✅ Oui | - | Nom de la campagne | - |
| `productId` | VARCHAR | string | ✅ Oui | - | ID du produit utilisé | - |
| `productName` | VARCHAR | string | ✅ Oui | - | Nom du produit (dénormalisé) | - |
| `type` | VARCHAR | string \| null | ❌ Non | `null` | Type (vaccination, treatment, weighing, identification) | - |
| `campaignDate` | TIMESTAMP | Date | ✅ Oui | - | Date de la campagne | - |
| `withdrawalEndDate` | TIMESTAMP | Date | ✅ Oui | - | Date de fin de retrait | - |
| `veterinarianId` | VARCHAR | string \| null | ❌ Non | `null` | ID du vétérinaire | - |
| `veterinarianName` | VARCHAR | string \| null | ❌ Non | `null` | Nom du vétérinaire (dénormalisé) | - |
| `animalIdsJson` | TEXT | string | ✅ Oui | - | IDs des animaux (JSON string) | - |
| `status` | VARCHAR | string | ✅ Oui | `"planned"` | Statut (planned, in_progress, completed, cancelled) | - |
| `startDate` | TIMESTAMP | Date \| null | ❌ Non | `null` | Date de début | - |
| `endDate` | TIMESTAMP | Date \| null | ❌ Non | `null` | Date de fin | - |
| `targetCount` | INTEGER | number \| null | ❌ Non | `null` | Nombre d'animaux ciblés | >= 0 |
| `completedCount` | INTEGER | number | ✅ Oui | `0` | Nombre d'animaux traités | >= 0 |
| `completed` | BOOLEAN | boolean | ✅ Oui | `false` | Campagne terminée | - |
| `notes` | TEXT | string \| null | ❌ Non | `null` | Notes | - |
| `version` | INTEGER | number | ✅ Oui | `1` | Version (optimistic locking) | >= 1 |
| `deletedAt` | TIMESTAMP | Date \| null | ❌ Non | `null` | Date de suppression (soft delete) | - |
| `createdAt` | TIMESTAMP | Date | ✅ Oui | `now()` | Date de création | - |
| `updatedAt` | TIMESTAMP | Date | ✅ Oui | `now()` | Date de dernière modification | - |

**Mapping colonnes** : `farm_id`, `lot_id`, `product_id`, `product_name`, `campaign_date`, `withdrawal_end_date`, `veterinarian_id`, `veterinarian_name`, `animal_ids_json`, `start_date`, `end_date`, `target_count`, `completed_count`, `deleted_at`, `created_at`, `updated_at`

## 6.3. Relations

### Relations entrantes (N:1)

| Relation | Modèle source | Type | Description |
|----------|---------------|------|-------------|
| `farm` | `Farm` | Many-to-One | Ferme propriétaire (CASCADE delete) |
| `lot` | `Lot` | Many-to-One | Lot associé (optionnel) |

## 6.4. Index et clés

| Type | Champs | Description |
|------|--------|-------------|
| PRIMARY KEY | `id` | Identifiant unique |
| INDEX | `farmId` | Filtrage par ferme |
| INDEX | `startDate` | Filtrage par date de début |
| INDEX | `deletedAt` | Filtrage des éléments supprimés |

## 6.5. 🚨 Problèmes identifiés

### ✅ Bonne conception

Cette table est **bien conçue** avec :
- ✅ Soft delete (`deletedAt`)
- ✅ Timestamps complets (`createdAt`, `updatedAt`)
- ✅ Versioning (`version`)
- ✅ Utilisation de `status` pour le cycle de vie

### ⚠️ Points d'amélioration

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 1 | **Pas de champ `isActive`** | Utilise `status` à la place, ce qui est acceptable mais moins standard | 🟢 AMÉLIORATION |
| 2 | **Pas d'index sur `status`** | Performances dégradées lors du filtrage par statut | 🟡 IMPORTANT |
| 3 | **Pas d'index sur `campaignDate`** | Performances dégradées pour les recherches par date de campagne | 🟡 IMPORTANT |

## 6.6. 🔧 Recommandations

### Migration suggérée

```prisma
model Campaign {
  // ... tous les champs existants

  farm Farm @relation(fields: [farmId], references: [id], onDelete: Cascade)
  lot Lot? @relation(fields: [lotId], references: [id])

  @@index([farmId])
  @@index([startDate])
  @@index([deletedAt])
  @@index([status])       // 🆕 AJOUT
  @@index([campaignDate]) // 🆕 AJOUT
  @@map("campaigns")
}
```

## 6.7. Notes techniques

- **Multi-tenant** : Oui (isolé par `farmId`)
- **Données de seed** : Non (créées par l'utilisateur)
- **Modifiable par l'utilisateur** : Oui
- **Synchronisation** : Oui (gestion offline avec versioning)
- **Dénormalisation** : `productName`, `veterinarianName` pour performances

---

# 7. FarmPreferences (Préférences ferme)

## 7.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom de la table** | `farm_preferences` |
| **Modèle Prisma** | `FarmPreferences` |
| **Type** | Table de configuration **multi-tenant** (1:1 avec Farm) |
| **Description** | Configuration personnalisée de la ferme (langue, unités, valeurs par défaut) |
| **Usage** | Paramétrage de l'interface et des valeurs par défaut pour l'utilisateur |

## 7.2. Structure des champs

| Champ | Type DB | Type TS | Obligatoire | Défaut | Description | Contraintes |
|-------|---------|---------|-------------|--------|-------------|-------------|
| `id` | UUID | string | ✅ Oui | `uuid()` | Identifiant unique | PRIMARY KEY |
| `farmId` | VARCHAR | string | ✅ Oui | - | ID de la ferme (relation 1:1) | UNIQUE, FOREIGN KEY → farms.id |
| `defaultVeterinarianId` | VARCHAR | string \| null | ❌ Non | `null` | Vétérinaire par défaut | - |
| `defaultSpeciesId` | VARCHAR | string \| null | ❌ Non | `null` | Espèce par défaut | - |
| `defaultBreedId` | VARCHAR | string \| null | ❌ Non | `null` | Race par défaut | - |
| `weightUnit` | VARCHAR | string | ✅ Oui | `"kg"` | Unité de poids | - |
| `currency` | VARCHAR | string | ✅ Oui | `"DZD"` | Devise | - |
| `language` | VARCHAR | string | ✅ Oui | `"fr"` | Langue (fr, en, ar) | - |
| `dateFormat` | VARCHAR | string | ✅ Oui | `"DD/MM/YYYY"` | Format de date | - |
| `enableNotifications` | BOOLEAN | boolean | ✅ Oui | `true` | Activer les notifications | - |
| `version` | INTEGER | number | ✅ Oui | `1` | Version (optimistic locking) | >= 1 |
| `deletedAt` | TIMESTAMP | Date \| null | ❌ Non | `null` | Date de suppression (soft delete) | - |
| `createdAt` | TIMESTAMP | Date | ✅ Oui | `now()` | Date de création | - |
| `updatedAt` | TIMESTAMP | Date | ✅ Oui | `now()` | Date de dernière modification | - |

**Mapping colonnes** : `farm_id`, `default_veterinarian_id`, `default_species_id`, `default_breed_id`, `weight_unit`, `date_format`, `enable_notifications`, `deleted_at`, `created_at`, `updated_at`

## 7.3. Relations

### Relations entrantes (1:1)

| Relation | Modèle source | Type | Description |
|----------|---------------|------|-------------|
| `farm` | `Farm` | One-to-One | Ferme propriétaire (CASCADE delete) |

## 7.4. Index et clés

| Type | Champs | Description |
|------|--------|-------------|
| PRIMARY KEY | `id` | Identifiant unique |
| UNIQUE | `farmId` | Un seul enregistrement par ferme (relation 1:1) |
| INDEX | `deletedAt` | Filtrage des éléments supprimés |

## 7.5. 🚨 Problèmes identifiés

### ✅ Bonne conception

Cette table est **bien conçue** avec :
- ✅ Timestamps complets (`createdAt`, `updatedAt`)
- ✅ Versioning (`version`)
- ✅ Relation 1:1 correcte avec Farm

### ⚠️ Points d'amélioration

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 1 | **Soft delete peu utile** | Relation 1:1 avec Farm : si Farm est supprimée, les préférences aussi (cascade). Le `deletedAt` n'apporte pas de valeur. | 🟢 AMÉLIORATION |
| 2 | **Pas de contrainte sur `language`** | Devrait être ENUM ('fr', 'en', 'ar') pour éviter les valeurs invalides | 🟡 IMPORTANT |
| 3 | **Pas de contrainte sur `weightUnit`** | Devrait être ENUM pour limiter les valeurs possibles | 🟢 AMÉLIORATION |

## 7.6. 🔧 Recommandations

### Migration suggérée

```prisma
model FarmPreferences {
  id                     String    @id @default(uuid())
  farmId                 String    @unique @map("farm_id")
  defaultVeterinarianId  String?   @map("default_veterinarian_id")
  defaultSpeciesId       String?   @map("default_species_id")
  defaultBreedId         String?   @map("default_breed_id")
  weightUnit             String    @default("kg") @map("weight_unit") // TODO: ENUM
  currency               String    @default("DZD")
  language               String    @default("fr") // TODO: ENUM ('fr', 'en', 'ar')
  dateFormat             String    @default("DD/MM/YYYY") @map("date_format")
  enableNotifications    Boolean   @default(true) @map("enable_notifications")
  version                Int       @default(1)
  // deletedAt peut être retiré (peu utile en 1:1)
  createdAt              DateTime  @default(now()) @map("created_at")
  updatedAt              DateTime  @updatedAt @map("updated_at")

  farm Farm @relation(fields: [farmId], references: [id], onDelete: Cascade)

  @@map("farm_preferences")
}
```

## 7.7. Notes techniques

- **Multi-tenant** : Oui (relation 1:1 avec Farm)
- **Données de seed** : Oui (créées automatiquement lors de la création d'une ferme)
- **Modifiable par l'utilisateur** : Oui
- **Synchronisation** : Oui (gestion offline avec versioning)

---

# 8. AlertConfiguration (Configuration alertes)

## 8.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom de la table** | `alert_configurations` |
| **Modèle Prisma** | `AlertConfiguration` |
| **Type** | Table de configuration **multi-tenant** (par ferme) |
| **Description** | Paramétrage des alertes et notifications pour la ferme |
| **Usage** | Gestion des seuils d'alerte, types de notifications, et priorités |

## 8.2. Structure des champs

| Champ | Type DB | Type TS | Obligatoire | Défaut | Description | Contraintes |
|-------|---------|---------|-------------|--------|-------------|-------------|
| `id` | UUID | string | ✅ Oui | `uuid()` | Identifiant unique | PRIMARY KEY |
| `farmId` | VARCHAR | string | ✅ Oui | - | ID de la ferme propriétaire | FOREIGN KEY → farms.id |
| `evaluationType` | VARCHAR | string | ✅ Oui | - | Type d'évaluation | - |
| `type` | VARCHAR | string | ✅ Oui | - | Type (urgent, important, routine) | - |
| `category` | VARCHAR | string | ✅ Oui | - | Catégorie de l'alerte | - |
| `titleKey` | VARCHAR | string | ✅ Oui | - | Clé i18n du titre | - |
| `messageKey` | VARCHAR | string | ✅ Oui | - | Clé i18n du message | - |
| `severity` | INTEGER | number | ✅ Oui | `5` | Sévérité (1-10) | 1 <= severity <= 10 |
| `iconName` | VARCHAR | string | ✅ Oui | - | Nom de l'icône | - |
| `colorHex` | VARCHAR | string | ✅ Oui | - | Couleur en hexadécimal | - |
| `enabled` | BOOLEAN | boolean | ✅ Oui | `true` | Alerte activée | - |
| `alertType` | VARCHAR | string \| null | ❌ Non | `null` | Type d'alerte (vaccination_due, treatment_due, etc.) | - |
| `isEnabled` | BOOLEAN | boolean | ✅ Oui | `true` | Alerte activée (doublon avec `enabled`) | - |
| `daysBeforeDue` | INTEGER | number | ✅ Oui | `7` | Jours avant échéance | >= 0 |
| `priority` | VARCHAR | string | ✅ Oui | `"medium"` | Priorité (low, medium, high) | - |
| `version` | INTEGER | number | ✅ Oui | `1` | Version (optimistic locking) | >= 1 |
| `deletedAt` | TIMESTAMP | Date \| null | ❌ Non | `null` | Date de suppression (soft delete) | - |
| `createdAt` | TIMESTAMP | Date | ✅ Oui | `now()` | Date de création | - |
| `updatedAt` | TIMESTAMP | Date | ✅ Oui | `now()` | Date de dernière modification | - |

**Mapping colonnes** : `farm_id`, `evaluation_type`, `title_key`, `message_key`, `icon_name`, `color_hex`, `alert_type`, `is_enabled`, `days_before_due`, `deleted_at`, `created_at`, `updated_at`

## 8.3. Relations

### Relations entrantes (N:1)

| Relation | Modèle source | Type | Description |
|----------|---------------|------|-------------|
| `farm` | `Farm` | Many-to-One | Ferme propriétaire (CASCADE delete) |

## 8.4. Index et clés

| Type | Champs | Description |
|------|--------|-------------|
| PRIMARY KEY | `id` | Identifiant unique |
| INDEX | `farmId` | Filtrage par ferme |
| INDEX | `deletedAt` | Filtrage des éléments supprimés |

## 8.5. 🚨 Problèmes identifiés

### ✅ Bonne conception

Cette table est **bien conçue** avec :
- ✅ Soft delete (`deletedAt`)
- ✅ Timestamps complets (`createdAt`, `updatedAt`)
- ✅ Versioning (`version`)
- ✅ Support i18n (titleKey, messageKey)

### ❌ Problèmes critiques

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 1 | **Duplication : `enabled` ET `isEnabled`** | Deux champs font la même chose. Risque d'incohérence. | 🔴 URGENT |

### ⚠️ Points d'amélioration

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 2 | **Pas d'index sur `isEnabled`** | Performances dégradées lors du filtrage des alertes actives | 🟢 AMÉLIORATION |
| 3 | **Pas de contrainte ENUM sur `type`** | Devrait être ENUM pour limiter les valeurs | 🟡 IMPORTANT |
| 4 | **Pas de contrainte ENUM sur `priority`** | Devrait être ENUM ('low', 'medium', 'high') | 🟡 IMPORTANT |

## 8.6. 🔧 Recommandations

### Migration suggérée

```prisma
model AlertConfiguration {
  id              String    @id @default(uuid())
  farmId          String    @map("farm_id")
  evaluationType  String    @map("evaluation_type")
  type            String    // TODO: ENUM (urgent, important, routine)
  category        String
  titleKey        String    @map("title_key")
  messageKey      String    @map("message_key")
  severity        Int       @default(5)
  iconName        String    @map("icon_name")
  colorHex        String    @map("color_hex")
  // 🔴 SUPPRIMER `enabled` (garder seulement `isEnabled`)
  alertType       String?   @map("alert_type")
  isEnabled       Boolean   @default(true) @map("is_enabled")
  daysBeforeDue   Int       @default(7) @map("days_before_due")
  priority        String    @default("medium") // TODO: ENUM (low, medium, high)
  version         Int       @default(1)
  deletedAt       DateTime? @map("deleted_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  farm Farm @relation(fields: [farmId], references: [id], onDelete: Cascade)

  @@index([farmId])
  @@index([deletedAt])
  @@index([isEnabled]) // 🆕 AJOUT
  @@map("alert_configurations")
}
```

## 8.7. Notes techniques

- **Multi-tenant** : Oui (isolé par `farmId`)
- **Données de seed** : Oui (configurations par défaut lors de la création d'une ferme)
- **Modifiable par l'utilisateur** : Oui
- **Synchronisation** : Oui (gestion offline avec versioning)

---

# 9. Farms (Fermes)

## 9.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom de la table** | `farms` |
| **Modèle Prisma** | `Farm` |
| **Type** | Table centrale **multi-tenant** |
| **Description** | Table principale représentant une ferme/exploitation agricole |
| **Usage** | Point central de toutes les données de l'application (animaux, lots, traitements, etc.) |

## 9.2. Structure des champs

| Champ | Type DB | Type TS | Obligatoire | Défaut | Description | Contraintes |
|-------|---------|---------|-------------|--------|-------------|-------------|
| `id` | VARCHAR | string | ✅ Oui | - | Identifiant unique de la ferme | PRIMARY KEY |
| `name` | VARCHAR | string | ✅ Oui | - | Nom de la ferme | - |
| `location` | VARCHAR | string | ✅ Oui | - | Localisation | - |
| `ownerId` | VARCHAR | string | ✅ Oui | - | ID du propriétaire | - |
| `cheptelNumber` | VARCHAR | string \| null | ❌ Non | `null` | Numéro de cheptel | - |
| `groupId` | VARCHAR | string \| null | ❌ Non | `null` | ID du groupe (multi-fermes) | - |
| `groupName` | VARCHAR | string \| null | ❌ Non | `null` | Nom du groupe | - |
| `isDefault` | BOOLEAN | boolean | ✅ Oui | `false` | Ferme par défaut pour l'utilisateur | - |
| `createdAt` | TIMESTAMP | Date | ✅ Oui | `now()` | Date de création | - |
| `updatedAt` | TIMESTAMP | Date | ✅ Oui | `now()` | Date de dernière modification | - |

**Mapping colonnes** : `owner_id`, `cheptel_number`, `group_id`, `group_name`, `is_default`, `created_at`, `updated_at`

## 9.3. Relations

### Relations sortantes (1:N)

| Relation | Modèle cible | Type | Description |
|----------|--------------|------|-------------|
| `animals` | `Animal[]` | One-to-Many | Animaux de la ferme |
| `lots` | `Lot[]` | One-to-Many | Lots de la ferme |
| `movements` | `Movement[]` | One-to-Many | Mouvements d'animaux |
| `campaigns` | `Campaign[]` | One-to-Many | Campagnes de vaccination/traitement |
| `documents` | `Document[]` | One-to-Many | Documents de la ferme |
| `weights` | `Weight[]` | One-to-Many | Pesées |
| `treatments` | `Treatment[]` | One-to-Many | Traitements médicaux |
| `vaccinations` | `Vaccination[]` | One-to-Many | Vaccinations |
| `breedings` | `Breeding[]` | One-to-Many | Reproductions |
| `lotAnimals` | `LotAnimal[]` | One-to-Many | Associations lot-animal |
| `veterinarians` | `Veterinarian[]` | One-to-Many | Vétérinaires |
| `medicalProducts` | `MedicalProduct[]` | One-to-Many | Produits médicaux |
| `vaccines` | `Vaccine[]` | One-to-Many | Vaccins |
| `alertConfigurations` | `AlertConfiguration[]` | One-to-Many | Configurations d'alertes |

### Relations sortantes (1:1)

| Relation | Modèle cible | Type | Description |
|----------|--------------|------|-------------|
| `preferences` | `FarmPreferences?` | One-to-One | Préférences de la ferme |

## 9.4. Index et clés

| Type | Champs | Description |
|------|--------|-------------|
| PRIMARY KEY | `id` | Identifiant unique |

**Aucun index secondaire défini**

## 9.5. 🚨 Problèmes identifiés

### ❌ Problèmes critiques

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 1 | **Pas de soft delete** (`deletedAt`) | **TRÈS PROBLÉMATIQUE** : Impossible de "fermer" une ferme sans perdre tout l'historique. Toutes les données liées (animaux, traitements, etc.) seraient supprimées en cascade. | 🔴 URGENT |
| 2 | **Pas de versioning** (`version`) | Pas de gestion des conflits lors de la synchronisation offline. Risque de perte de données. | 🔴 URGENT |
| 3 | **Pas de champ `isActive`** | Impossible de désactiver temporairement une ferme sans la supprimer. | 🔴 URGENT |

### ⚠️ Points d'amélioration

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 4 | **Pas d'index sur `ownerId`** | Performances dégradées lors de la recherche des fermes d'un utilisateur | 🟡 IMPORTANT |
| 5 | **Pas d'index sur `groupId`** | Performances dégradées pour les groupes multi-fermes | 🟢 AMÉLIORATION |
| 6 | **Pas d'index sur `isDefault`** | Performances dégradées pour trouver la ferme par défaut d'un utilisateur | 🟢 AMÉLIORATION |

## 9.6. 🔧 Recommandations

### Migration nécessaire

```prisma
model Farm {
  id            String    @id
  name          String
  location      String
  ownerId       String    @map("owner_id")
  cheptelNumber String?   @map("cheptel_number")
  groupId       String?   @map("group_id")
  groupName     String?   @map("group_name")
  isDefault     Boolean   @default(false) @map("is_default")

  // 🆕 AJOUTS RECOMMANDÉS
  isActive      Boolean   @default(true) @map("is_active")
  version       Int       @default(1)
  deletedAt     DateTime? @map("deleted_at")

  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  animals Animal[]
  lots Lot[]
  movements Movement[]
  campaigns Campaign[]
  documents Document[]
  weights Weight[]
  treatments Treatment[]
  vaccinations Vaccination[]
  breedings Breeding[]
  lotAnimals LotAnimal[]
  veterinarians Veterinarian[]
  medicalProducts MedicalProduct[]
  vaccines Vaccine[]
  preferences FarmPreferences?
  alertConfigurations AlertConfiguration[]

  @@index([ownerId])   // 🆕 AJOUT
  @@index([groupId])   // 🆕 AJOUT
  @@index([isDefault]) // 🆕 AJOUT
  @@index([isActive])  // 🆕 AJOUT
  @@index([deletedAt]) // 🆕 AJOUT
  @@map("farms")
}
```

## 9.7. Notes techniques

- **Multi-tenant** : OUI - C'est la table racine du multi-tenancy
- **Données de seed** : Non (créées par l'utilisateur lors de l'inscription)
- **Modifiable par l'utilisateur** : Oui
- **Synchronisation** : Oui (gestion offline avec versioning)
- **Importance critique** : Cette table est le point central de toute l'application

---

# 📊 Résumé des priorités

## 🔴 URGENT (Bloquant)

1. ✅ Ajouter soft delete à **Species** (utilisée par Animal)
2. ✅ Ajouter soft delete à **Breeds** (utilisée par Animal)
3. ✅ Ajouter soft delete à **Farms** (table centrale)
4. ✅ Ajouter timestamps à Species/Breeds
5. ✅ Ajouter versioning à Species/Breeds/Farms
6. ✅ Ajouter `isActive` à Species/Farms
7. ✅ Supprimer le doublon `enabled`/`isEnabled` dans AlertConfiguration

## 🟡 IMPORTANT (Stabilité)

8. Ajouter index sur `speciesId` dans Breeds
9. Ajouter index sur `ownerId`, `groupId` dans Farms
10. Ajouter index sur `expiryDate` dans MedicalProducts
11. Ajouter index sur `status`, `campaignDate` dans Campaigns
12. Ajouter contraintes ENUM sur `language`, `priority`, `type`

## 🟢 AMÉLIORATION (Qualité)

13. Ajouter index sur `isActive` dans plusieurs tables
14. Changer `specialties` de VARCHAR à JSON dans Veterinarians
15. Changer `targetSpecies` de VARCHAR à JSON dans MedicalProducts
16. Retirer `deletedAt` de FarmPreferences (peu utile en 1:1)

---

**Fin du document de spécifications**
