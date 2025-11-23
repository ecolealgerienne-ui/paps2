# 🔄 BACKEND MIGRATION SPECIFICATIONS - Animal Trace

**Date**: 2025-11-23
**Version**: 1.0
**Type**: Migration complète architecture référentiels
**Auteur**: Architecture discussion + analyse REFERENCE_TABLES_SPECS.md

---

## 📋 Table des matières

1. [Vue d'ensemble de la migration](#1-vue-densemble-de-la-migration)
2. [Tables à recycler (Renommer)](#2-tables-à-recycler-renommer)
   - 2.1. [medical_products → custom_medical_products](#21-medical_products--custom_medical_products)
   - 2.2. [vaccines → custom_vaccines](#22-vaccines--custom_vaccines)
   - 2.3. [campaigns → personal_campaigns](#23-campaigns--personal_campaigns)
3. [Tables existantes à corriger](#3-tables-existantes-à-corriger)
   - 3.1. [Species](#31-species)
   - 3.2. [Breeds](#32-breeds)
   - 3.3. [Farms](#33-farms)
   - 3.4. [Veterinarians](#34-veterinarians)
   - 3.5. [AlertConfiguration](#35-alertconfiguration)
   - 3.6. [FarmPreferences](#36-farmpreferences)
4. [Tables globales nouvelles](#4-tables-globales-nouvelles)
   - 4.1. [medical_products (globale)](#41-medical_products-globale)
   - 4.2. [vaccines (globale)](#42-vaccines-globale)
   - 4.3. [national_campaigns](#43-national_campaigns)
   - 4.4. [alert_templates](#44-alert_templates)
5. [Tables liaison pays nouvelles](#5-tables-liaison-pays-nouvelles)
   - 5.1. [breed_countries](#51-breed_countries)
   - 5.2. [product_countries](#52-product_countries)
   - 5.3. [vaccine_countries](#53-vaccine_countries)
   - 5.4. [campaign_countries](#54-campaign_countries)
6. [Tables préférences ferme nouvelles](#6-tables-préférences-ferme-nouvelles)
   - 6.1. [farm_breed_preferences](#61-farm_breed_preferences)
   - 6.2. [farm_product_preferences](#62-farm_product_preferences)
   - 6.3. [farm_vaccine_preferences](#63-farm_vaccine_preferences)
   - 6.4. [farm_veterinarian_preferences](#64-farm_veterinarian_preferences)
   - 6.5. [farm_national_campaign_preferences](#65-farm_national_campaign_preferences)
7. [Contraintes & règles métier](#7-contraintes--règles-métier)
8. [Plan de migration & priorités](#8-plan-de-migration--priorités)

---

# 1. Vue d'ensemble de la migration

## 1.1. Contexte

**Situation actuelle:**
- Architecture incohérente: Species/Breeds globales MAIS MedicalProducts/Vaccines/Campaigns par ferme
- Erreur de conception initiale identifiée
- MVP sans données production = opportunité de refonte propre

**Objectifs migration:**
- ✅ Architecture cohérente: Référentiels globaux + liaison pays + préférences ferme
- ✅ Recyclage tables existantes (custom_products, custom_vaccines, personal_campaigns)
- ✅ Corrections tables actuelles (soft delete, timestamps, geo fields)
- ✅ Scalabilité: 10K+ fermes avec filtrage géographique intelligent
- ✅ Zéro dette technique dès J1

## 1.2. Principes architecturaux

### **Pattern global + liaison + préférences:**

```
RÉFÉRENTIEL GLOBAL (partagé toutes fermes)
    ↓ (filtré par)
LIAISON PAYS (disponibilité géographique)
    ↓ (configuré par)
PRÉFÉRENCES FERME (espace de travail personnel)
    ↓ (complété par)
CUSTOM PAR FERME (données spécifiques ferme)
```

**Exemple concret - Breeds:**
```
breeds (globale)
├── "Lacaune", "Mérinos", "Charolaise"...

breed_countries (liaison)
├── Lacaune → FR, ES, IT, PT
├── Bizet → FR uniquement

farm_breed_preferences (config ferme FR)
├── Lacaune: visible=true, displayOrder=1
├── Mérinos: visible=true, displayOrder=2
├── Bizet: visible=true, displayOrder=3
├── Manchega: visible=false (race ES, cachée)

custom_breeds (optionnel, ferme FR)
├── "Ma Lacaune Croisée" (custom)
```

### **Séparation setup vs transactionnel:**

**Setup (rare, JOIN acceptables):**
- Charger référentiels globaux
- Filtrer par pays de la ferme
- Configurer préférences

**Transactionnel (fréquent, performance critique):**
- Query directe farm_preferences
- Pas de JOIN avec tables globales
- 100% offline-capable

## 1.3. Impacts par domaine

| Domaine | Tables impactées | Type changement | Complexité |
|---------|-----------------|-----------------|------------|
| **Référence données** | Species, Breeds | Corrections champs | 🟡 Moyenne |
| **Produits médicaux** | medical_products | Renommer + Créer global | 🔴 Élevée |
| **Vaccins** | vaccines | Renommer + Créer global | 🔴 Élevée |
| **Vétérinaires** | veterinarians | Corrections geo | 🟢 Faible |
| **Campagnes** | campaigns | Renommer + Créer national | 🔴 Élevée |
| **Alertes** | alert_configurations | Créer templates | 🟡 Moyenne |
| **Fermes** | farms | Corrections geo | 🟡 Moyenne |

## 1.4. Statistiques migration

**Tables au total:**
- Existantes à corriger: 6
- À recycler (renommer): 3
- Nouvelles à créer: 15
- **Total tables après migration: 24**

**Champs ajoutés:**
- Soft delete (deletedAt): 4 tables
- Timestamps (createdAt, updatedAt): 2 tables
- Versioning (version): 4 tables
- Active status (isActive): 6 tables
- Geo fields (country, department, commune): 2 tables

---

# 2. Tables à recycler (Renommer)

## 2.1. medical_products → custom_medical_products

### 2.1.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom actuel** | `medical_products` |
| **Nouveau nom** | `custom_medical_products` |
| **Type** | Table multi-tenant (par ferme) - CONSERVÉE |
| **Raison recyclage** | Structure complète et bien conçue, devient table des produits custom/personnels de la ferme |
| **Breaking change** | ❌ NON - Simple renommage table |

### 2.1.2. Structure actuelle (CONSERVÉE)

| Champ | Type DB | Obligatoire | Description |
|-------|---------|-------------|-------------|
| `id` | UUID | ✅ | Identifiant unique |
| `farmId` | VARCHAR | ✅ | ID ferme propriétaire |
| `name` | VARCHAR | ✅ | Nom du produit |
| `commercialName` | VARCHAR | ❌ | Nom commercial |
| `category` | VARCHAR | ✅ | Catégorie |
| `activeIngredient` | VARCHAR | ❌ | Principe actif |
| `manufacturer` | VARCHAR | ❌ | Fabricant |
| `form` | VARCHAR | ❌ | Forme (tablet, injection...) |
| `dosage` | FLOAT | ❌ | Dosage |
| `dosageUnit` | VARCHAR | ❌ | Unité dosage |
| `withdrawalPeriodMeat` | INTEGER | ✅ | Délai retrait viande (jours) |
| `withdrawalPeriodMilk` | INTEGER | ✅ | Délai retrait lait (jours) |
| `currentStock` | FLOAT | ✅ | Stock actuel |
| `minStock` | FLOAT | ✅ | Stock minimum |
| `stockUnit` | VARCHAR | ✅ | Unité stock |
| `unitPrice` | FLOAT | ❌ | Prix unitaire |
| `currency` | VARCHAR | ❌ | Devise |
| `batchNumber` | VARCHAR | ❌ | Numéro de lot |
| `expiryDate` | TIMESTAMP | ❌ | Date expiration |
| `storageConditions` | TEXT | ❌ | Conditions stockage |
| `prescription` | TEXT | ❌ | Notes prescription |
| `type` | VARCHAR | ✅ | Type (treatment, vaccine) |
| `targetSpecies` | VARCHAR | ✅ | Espèces cibles |
| `standardCureDays` | INTEGER | ❌ | Durée standard traitement |
| `administrationFrequency` | VARCHAR | ❌ | Fréquence administration |
| `dosageFormula` | VARCHAR | ❌ | Formule calcul dosage |
| `vaccinationProtocol` | TEXT | ❌ | Protocole vaccination |
| `reminderDays` | VARCHAR | ❌ | Jours rappel |
| `defaultAdministrationRoute` | VARCHAR | ❌ | Voie administration défaut |
| `defaultInjectionSite` | VARCHAR | ❌ | Site injection défaut |
| `notes` | TEXT | ❌ | Notes |
| `isActive` | BOOLEAN | ✅ | Produit actif |
| `version` | INTEGER | ✅ | Version (optimistic locking) |
| `deletedAt` | TIMESTAMP | ❌ | Soft delete |
| `createdAt` | TIMESTAMP | ✅ | Date création |
| `updatedAt` | TIMESTAMP | ✅ | Date modification |

### 2.1.3. Changements à appliquer

| Action | Détail |
|--------|--------|
| ✅ **Renommer table** | `medical_products` → `custom_medical_products` |
| ✅ **Structure** | AUCUN changement (déjà complète) |
| ✅ **Relations** | Update FK dans `treatments` |
| ✅ **Indexes** | Conserver existants |

### 2.1.4. Schema Prisma APRÈS

```prisma
model CustomMedicalProduct {
  id                         String    @id @default(uuid())
  farmId                     String    @map("farm_id")
  name                       String
  commercialName             String?   @map("commercial_name")
  category                   String
  activeIngredient           String?   @map("active_ingredient")
  manufacturer               String?
  form                       String?
  dosage                     Float?
  dosageUnit                 String?   @map("dosage_unit")
  withdrawalPeriodMeat       Int       @map("withdrawal_period_meat")
  withdrawalPeriodMilk       Int       @map("withdrawal_period_milk")
  currentStock               Float     @default(0) @map("current_stock")
  minStock                   Float     @default(0) @map("min_stock")
  stockUnit                  String    @map("stock_unit")
  unitPrice                  Float?    @map("unit_price")
  currency                   String?
  batchNumber                String?   @map("batch_number")
  expiryDate                 DateTime? @map("expiry_date")
  storageConditions          String?   @map("storage_conditions")
  prescription               String?
  type                       String    @default("treatment")
  targetSpecies              String    @default("") @map("target_species")
  standardCureDays           Int?      @map("standard_cure_days")
  administrationFrequency    String?   @map("administration_frequency")
  dosageFormula              String?   @map("dosage_formula")
  vaccinationProtocol        String?   @map("vaccination_protocol")
  reminderDays               String?   @map("reminder_days")
  defaultAdministrationRoute String?   @map("default_administration_route")
  defaultInjectionSite       String?   @map("default_injection_site")
  notes                      String?
  isActive                   Boolean   @default(true) @map("is_active")
  version                    Int       @default(1)
  deletedAt                  DateTime? @map("deleted_at")
  createdAt                  DateTime  @default(now()) @map("created_at")
  updatedAt                  DateTime  @updatedAt @map("updated_at")

  farm       Farm        @relation(fields: [farmId], references: [id], onDelete: Cascade)
  treatments Treatment[]

  @@index([farmId])
  @@index([deletedAt])
  @@index([isActive])
  @@index([expiryDate])
  @@map("custom_medical_products")
}
```

### 2.1.5. Relations

| Relation | Type | Description |
|----------|------|-------------|
| `farm` | Many-to-One | Ferme propriétaire (CASCADE delete) |
| `treatments` | One-to-Many | Traitements utilisant ce produit custom |

### 2.1.6. Indexes

| Index | Champs | Raison |
|-------|--------|--------|
| PRIMARY KEY | `id` | Identifiant unique |
| INDEX | `farmId` | Filtrage par ferme (multi-tenancy) |
| INDEX | `deletedAt` | Filtrage soft delete |
| INDEX | `isActive` | Filtrage produits actifs |
| INDEX | `expiryDate` | Alertes expiration |

### 2.1.7. Notes techniques

- **Multi-tenant**: ✅ OUI (isolé par farmId)
- **Soft delete**: ✅ OUI (deletedAt)
- **Timestamps**: ✅ OUI (createdAt, updatedAt)
- **Versioning**: ✅ OUI (version)
- **Synchronisation**: ✅ OUI (offline-first)
- **Seed data**: ❌ NON (créés par utilisateur)
- **Modifiable**: ✅ OUI (ferme owner uniquement)

### 2.1.8. Scripts migration

```sql
-- Renommer table
ALTER TABLE medical_products RENAME TO custom_medical_products;

-- Update relations dans autres tables
-- (Prisma migrations gère automatiquement les FK)
```

---

## 2.2. vaccines → custom_vaccines

### 2.2.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom actuel** | `vaccines` |
| **Nouveau nom** | `custom_vaccines` |
| **Type** | Table multi-tenant (par ferme) - CONSERVÉE |
| **Raison recyclage** | Structure complète, devient table des vaccins custom de la ferme |
| **Breaking change** | ❌ NON - Simple renommage |

### 2.2.2. Structure actuelle (CONSERVÉE)

| Champ | Type DB | Obligatoire | Description |
|-------|---------|-------------|-------------|
| `id` | UUID | ✅ | Identifiant unique |
| `farmId` | VARCHAR | ✅ | ID ferme propriétaire |
| `name` | VARCHAR | ✅ | Nom du vaccin |
| `description` | TEXT | ❌ | Description |
| `manufacturer` | VARCHAR | ❌ | Fabricant |
| `targetSpecies` | JSON | ❌ | Espèces cibles (JSON array) |
| `targetDiseases` | JSON | ❌ | Maladies cibles (JSON array) |
| `standardDose` | FLOAT | ❌ | Dose standard |
| `injectionsRequired` | INTEGER | ✅ | Nombre injections requises |
| `injectionIntervalDays` | INTEGER | ❌ | Intervalle entre injections (jours) |
| `meatWithdrawalDays` | INTEGER | ❌ | Délai retrait viande (jours) |
| `milkWithdrawalDays` | INTEGER | ❌ | Délai retrait lait (jours) |
| `administrationRoute` | VARCHAR | ❌ | Voie d'administration |
| `isActive` | BOOLEAN | ✅ | Vaccin actif |
| `version` | INTEGER | ✅ | Version |
| `deletedAt` | TIMESTAMP | ❌ | Soft delete |
| `createdAt` | TIMESTAMP | ✅ | Date création |
| `updatedAt` | TIMESTAMP | ✅ | Date modification |

### 2.2.3. Changements à appliquer

| Action | Détail |
|--------|--------|
| ✅ **Renommer table** | `vaccines` → `custom_vaccines` |
| ✅ **Structure** | AUCUN changement |
| ✅ **Relations** | Update FK dans `vaccinations` |
| ✅ **Indexes** | Conserver existants |

### 2.2.4. Schema Prisma APRÈS

```prisma
model CustomVaccine {
  id                     String    @id @default(uuid())
  farmId                 String    @map("farm_id")
  name                   String
  description            String?
  manufacturer           String?
  targetSpecies          Json?     @map("target_species")
  targetDiseases         Json?     @map("target_diseases")
  standardDose           Float?    @map("standard_dose")
  injectionsRequired     Int       @default(1) @map("injections_required")
  injectionIntervalDays  Int?      @map("injection_interval_days")
  meatWithdrawalDays     Int?      @map("meat_withdrawal_days")
  milkWithdrawalDays     Int?      @map("milk_withdrawal_days")
  administrationRoute    String?   @map("administration_route")
  isActive               Boolean   @default(true) @map("is_active")
  version                Int       @default(1)
  deletedAt              DateTime? @map("deleted_at")
  createdAt              DateTime  @default(now()) @map("created_at")
  updatedAt              DateTime  @updatedAt @map("updated_at")

  farm          Farm           @relation(fields: [farmId], references: [id], onDelete: Cascade)
  vaccinations  Vaccination[]

  @@index([farmId])
  @@index([deletedAt])
  @@index([isActive])
  @@map("custom_vaccines")
}
```

### 2.2.5. Relations

| Relation | Type | Description |
|----------|------|-------------|
| `farm` | Many-to-One | Ferme propriétaire (CASCADE delete) |
| `vaccinations` | One-to-Many | Vaccinations utilisant ce vaccin custom |

### 2.2.6. Notes techniques

- **Multi-tenant**: ✅ OUI
- **Soft delete**: ✅ OUI
- **JSON fields**: ✅ targetSpecies, targetDiseases
- **Synchronisation**: ✅ OUI

---

## 2.3. campaigns → personal_campaigns

### 2.3.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom actuel** | `campaigns` |
| **Nouveau nom** | `personal_campaigns` |
| **Type** | Table multi-tenant (par ferme) - CONSERVÉE |
| **Raison recyclage** | Devient table des campagnes personnelles (vs nationales obligatoires) |
| **Breaking change** | ❌ NON - Simple renommage |

### 2.3.2. Structure actuelle (CONSERVÉE)

| Champ | Type DB | Obligatoire | Description |
|-------|---------|-------------|-------------|
| `id` | UUID | ✅ | Identifiant unique |
| `farmId` | VARCHAR | ✅ | ID ferme |
| `lotId` | VARCHAR | ❌ | ID lot concerné |
| `name` | VARCHAR | ✅ | Nom campagne |
| `productId` | VARCHAR | ✅ | ID produit utilisé |
| `productName` | VARCHAR | ✅ | Nom produit (dénormalisé) |
| `type` | VARCHAR | ❌ | Type (vaccination, treatment...) |
| `campaignDate` | TIMESTAMP | ✅ | Date campagne |
| `withdrawalEndDate` | TIMESTAMP | ✅ | Date fin retrait |
| `veterinarianId` | VARCHAR | ❌ | ID vétérinaire |
| `veterinarianName` | VARCHAR | ❌ | Nom vétérinaire (dénormalisé) |
| `animalIdsJson` | TEXT | ✅ | IDs animaux (JSON string) |
| `status` | VARCHAR | ✅ | Statut (planned, in_progress...) |
| `startDate` | TIMESTAMP | ❌ | Date début |
| `endDate` | TIMESTAMP | ❌ | Date fin |
| `targetCount` | INTEGER | ❌ | Nombre animaux ciblés |
| `completedCount` | INTEGER | ✅ | Nombre animaux traités |
| `completed` | BOOLEAN | ✅ | Campagne terminée |
| `notes` | TEXT | ❌ | Notes |
| `version` | INTEGER | ✅ | Version |
| `deletedAt` | TIMESTAMP | ❌ | Soft delete |
| `createdAt` | TIMESTAMP | ✅ | Date création |
| `updatedAt` | TIMESTAMP | ✅ | Date modification |

### 2.3.3. Changements à appliquer

| Action | Détail |
|--------|--------|
| ✅ **Renommer table** | `campaigns` → `personal_campaigns` |
| ✅ **Structure** | AUCUN changement |
| ✅ **Relations** | Conserver liens farm, lot |
| ⚠️ **Type clarification** | Ajouter ENUM pour `type` et `status` |

### 2.3.4. Schema Prisma APRÈS

```prisma
enum PersonalCampaignType {
  vaccination
  treatment
  weighing
  identification
}

enum PersonalCampaignStatus {
  planned
  in_progress
  completed
  cancelled
}

model PersonalCampaign {
  id                  String                   @id @default(uuid())
  farmId              String                   @map("farm_id")
  lotId               String?                  @map("lot_id")
  name                String
  productId           String                   @map("product_id")
  productName         String                   @map("product_name")
  type                PersonalCampaignType?
  campaignDate        DateTime                 @map("campaign_date")
  withdrawalEndDate   DateTime                 @map("withdrawal_end_date")
  veterinarianId      String?                  @map("veterinarian_id")
  veterinarianName    String?                  @map("veterinarian_name")
  animalIdsJson       String                   @map("animal_ids_json")
  status              PersonalCampaignStatus   @default(planned)
  startDate           DateTime?                @map("start_date")
  endDate             DateTime?                @map("end_date")
  targetCount         Int?                     @map("target_count")
  completedCount      Int                      @default(0) @map("completed_count")
  completed           Boolean                  @default(false)
  notes               String?
  version             Int                      @default(1)
  deletedAt           DateTime?                @map("deleted_at")
  createdAt           DateTime                 @default(now()) @map("created_at")
  updatedAt           DateTime                 @updatedAt @map("updated_at")

  farm Farm  @relation(fields: [farmId], references: [id], onDelete: Cascade)
  lot  Lot?  @relation(fields: [lotId], references: [id])

  @@index([farmId])
  @@index([deletedAt])
  @@index([status])
  @@index([campaignDate])
  @@map("personal_campaigns")
}
```

### 2.3.5. Relations

| Relation | Type | Description |
|----------|------|-------------|
| `farm` | Many-to-One | Ferme propriétaire (CASCADE) |
| `lot` | Many-to-One | Lot concerné (optionnel) |

### 2.3.6. Notes techniques

- **Multi-tenant**: ✅ OUI
- **Distinction**: Personal (cette table) vs National (nouvelle table globale)
- **JSON**: animalIdsJson contient array d'IDs
- **Dénormalisation**: productName, veterinarianName pour performance

---

# 3. Tables existantes à corriger

## 3.1. Species

### 3.1.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom table** | `species` |
| **Type** | Référentiel global (non multi-tenant) |
| **Problème** | Manque champs essentiels (soft delete, timestamps, version, isActive) |
| **Priorité** | 🔴 URGENT |

### 3.1.2. Structure AVANT (actuelle)

| Champ | Type DB | Obligatoire | Description |
|-------|---------|-------------|-------------|
| `id` | VARCHAR | ✅ | Identifiant unique |
| `nameFr` | VARCHAR | ✅ | Nom français |
| `nameEn` | VARCHAR | ✅ | Nom anglais |
| `nameAr` | VARCHAR | ✅ | Nom arabe |
| `icon` | VARCHAR | ✅ | Code icône |
| `displayOrder` | INTEGER | ✅ | Ordre affichage |

### 3.1.3. Changements à appliquer

| Action | Champ | Type | Description |
|--------|-------|------|-------------|
| ➕ **AJOUTER** | `isActive` | BOOLEAN | Activer/désactiver espèce |
| ➕ **AJOUTER** | `version` | INTEGER | Optimistic locking |
| ➕ **AJOUTER** | `deletedAt` | TIMESTAMP | Soft delete |
| ➕ **AJOUTER** | `createdAt` | TIMESTAMP | Date création |
| ➕ **AJOUTER** | `updatedAt` | TIMESTAMP | Date modification |
| ➕ **INDEX** | `deletedAt` | - | Performance queries |
| ➕ **INDEX** | `displayOrder` | - | Tri affichage |

### 3.1.4. Structure APRÈS

| Champ | Type DB | Obligatoire | Défaut | Description |
|-------|---------|-------------|--------|-------------|
| `id` | VARCHAR | ✅ | - | Identifiant unique |
| `nameFr` | VARCHAR | ✅ | - | Nom français |
| `nameEn` | VARCHAR | ✅ | - | Nom anglais |
| `nameAr` | VARCHAR | ✅ | - | Nom arabe |
| `icon` | VARCHAR | ✅ | - | Code icône |
| `displayOrder` | INTEGER | ✅ | `0` | Ordre affichage |
| `isActive` | BOOLEAN | ✅ | `true` | 🆕 Espèce active |
| `version` | INTEGER | ✅ | `1` | 🆕 Version |
| `deletedAt` | TIMESTAMP | ❌ | `null` | 🆕 Soft delete |
| `createdAt` | TIMESTAMP | ✅ | `now()` | 🆕 Date création |
| `updatedAt` | TIMESTAMP | ✅ | `now()` | 🆕 Date modification |

### 3.1.5. Schema Prisma AVANT

```prisma
model Species {
  id           String @id
  nameFr       String @map("name_fr")
  nameEn       String @map("name_en")
  nameAr       String @map("name_ar")
  icon         String
  displayOrder Int    @default(0) @map("display_order")

  animals Animal[]
  breeds  Breed[]

  @@map("species")
}
```

### 3.1.6. Schema Prisma APRÈS

```prisma
model Species {
  id           String    @id
  nameFr       String    @map("name_fr")
  nameEn       String    @map("name_en")
  nameAr       String    @map("name_ar")
  icon         String
  displayOrder Int       @default(0) @map("display_order")
  
  // 🆕 AJOUTS
  isActive     Boolean   @default(true) @map("is_active")
  version      Int       @default(1)
  deletedAt    DateTime? @map("deleted_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  animals Animal[]
  breeds  Breed[]

  @@index([deletedAt])
  @@index([displayOrder])
  @@index([isActive])
  @@map("species")
}
```

### 3.1.7. Script migration

```sql
-- Ajouter nouveaux champs
ALTER TABLE species 
  ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN version INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN deleted_at TIMESTAMP NULL,
  ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Créer indexes
CREATE INDEX idx_species_deleted_at ON species(deleted_at);
CREATE INDEX idx_species_display_order ON species(display_order);
CREATE INDEX idx_species_is_active ON species(is_active);

-- Trigger pour updated_at (PostgreSQL)
CREATE TRIGGER update_species_updated_at
  BEFORE UPDATE ON species
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3.1.8. Impact relations

**Animals:**
- ✅ Aucun changement FK
- ⚠️ Queries doivent exclure `species.deletedAt IS NULL`

**Breeds:**
- ✅ Aucun changement FK
- ⚠️ Queries doivent exclure `species.deletedAt IS NULL`

---

## 3.2. Breeds

### 3.2.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom table** | `breeds` |
| **Type** | Référentiel global (non multi-tenant) |
| **Problème** | Manque soft delete, timestamps, version, indexes |
| **Priorité** | 🔴 URGENT |

### 3.2.2. Structure AVANT

| Champ | Type DB | Obligatoire | Description |
|-------|---------|-------------|-------------|
| `id` | VARCHAR | ✅ | Identifiant unique |
| `speciesId` | VARCHAR | ✅ | ID espèce parente |
| `nameFr` | VARCHAR | ✅ | Nom français |
| `nameEn` | VARCHAR | ✅ | Nom anglais |
| `nameAr` | VARCHAR | ✅ | Nom arabe |
| `description` | TEXT | ❌ | Description |
| `displayOrder` | INTEGER | ✅ | Ordre affichage |
| `isActive` | BOOLEAN | ✅ | Race active |

### 3.2.3. Changements à appliquer

| Action | Champ | Type | Description |
|--------|-------|------|-------------|
| ✅ **CONSERVER** | `isActive` | BOOLEAN | Déjà présent |
| ➕ **AJOUTER** | `version` | INTEGER | Optimistic locking |
| ➕ **AJOUTER** | `deletedAt` | TIMESTAMP | Soft delete |
| ➕ **AJOUTER** | `createdAt` | TIMESTAMP | Date création |
| ➕ **AJOUTER** | `updatedAt` | TIMESTAMP | Date modification |
| ➕ **INDEX** | `speciesId` | - | FK performance |
| ➕ **INDEX** | `deletedAt` | - | Soft delete queries |
| ➕ **INDEX** | `displayOrder` | - | Tri |

### 3.2.4. Schema Prisma APRÈS

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
  
  // 🆕 AJOUTS
  version      Int       @default(1)
  deletedAt    DateTime? @map("deleted_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  species        Species         @relation(fields: [speciesId], references: [id])
  animals        Animal[]
  breedCountries BreedCountry[]  // 🆕 Nouvelle relation

  @@index([speciesId])
  @@index([deletedAt])
  @@index([displayOrder])
  @@index([isActive])
  @@map("breeds")
}
```

### 3.2.5. Script migration

```sql
-- Ajouter nouveaux champs
ALTER TABLE breeds 
  ADD COLUMN version INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN deleted_at TIMESTAMP NULL,
  ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Créer indexes
CREATE INDEX idx_breeds_species_id ON breeds(species_id);
CREATE INDEX idx_breeds_deleted_at ON breeds(deleted_at);
CREATE INDEX idx_breeds_display_order ON breeds(display_order);
CREATE INDEX idx_breeds_is_active ON breeds(is_active);
```

---

## 3.3. Farms

### 3.3.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom table** | `farms` |
| **Type** | Table centrale multi-tenant (racine) |
| **Problème** | Manque geo fields (country, department, commune), isActive, version, deletedAt, indexes |
| **Priorité** | 🔴 URGENT |

### 3.3.2. Structure AVANT

| Champ | Type DB | Obligatoire | Description |
|-------|---------|-------------|-------------|
| `id` | VARCHAR | ✅ | Identifiant unique |
| `name` | VARCHAR | ✅ | Nom ferme |
| `location` | VARCHAR | ✅ | Localisation (texte libre) |
| `ownerId` | VARCHAR | ✅ | ID propriétaire |
| `cheptelNumber` | VARCHAR | ❌ | Numéro cheptel |
| `groupId` | VARCHAR | ❌ | ID groupe |
| `groupName` | VARCHAR | ❌ | Nom groupe |
| `isDefault` | BOOLEAN | ✅ | Ferme par défaut utilisateur |
| `createdAt` | TIMESTAMP | ✅ | Date création |
| `updatedAt` | TIMESTAMP | ✅ | Date modification |

### 3.3.3. Changements à appliquer

| Action | Champ | Type | Description |
|--------|-------|------|-------------|
| ✅ **CONSERVER** | `location` | VARCHAR | Texte libre (adresse complète) |
| ➕ **AJOUTER** | `country` | VARCHAR | 🆕 Code pays ISO (ex: "FR") |
| ➕ **AJOUTER** | `department` | VARCHAR | 🆕 Code département (ex: "81") |
| ➕ **AJOUTER** | `commune` | VARCHAR | 🆕 Code INSEE commune (ex: "81004") |
| ➕ **AJOUTER** | `isActive` | BOOLEAN | 🆕 Ferme active |
| ➕ **AJOUTER** | `version` | INTEGER | 🆕 Optimistic locking |
| ➕ **AJOUTER** | `deletedAt` | TIMESTAMP | 🆕 Soft delete |
| ➕ **INDEX** | `ownerId` | - | Performance queries |
| ➕ **INDEX** | `groupId` | - | Groupes multi-fermes |
| ➕ **INDEX** | `isDefault` | - | Ferme défaut utilisateur |
| ➕ **INDEX** | `isActive` | - | Filtrage actives |
| ➕ **INDEX** | `deletedAt` | - | Soft delete |

### 3.3.4. Structure APRÈS

| Champ | Type DB | Obligatoire | Défaut | Description |
|-------|---------|-------------|--------|-------------|
| `id` | VARCHAR | ✅ | - | Identifiant unique |
| `name` | VARCHAR | ✅ | - | Nom ferme |
| `location` | VARCHAR | ✅ | - | Localisation texte libre |
| `country` | VARCHAR | ❌ | `null` | 🆕 Code pays ISO |
| `department` | VARCHAR | ❌ | `null` | 🆕 Code département |
| `commune` | VARCHAR | ❌ | `null` | 🆕 Code INSEE commune |
| `ownerId` | VARCHAR | ✅ | - | ID propriétaire |
| `cheptelNumber` | VARCHAR | ❌ | `null` | Numéro cheptel |
| `groupId` | VARCHAR | ❌ | `null` | ID groupe |
| `groupName` | VARCHAR | ❌ | `null` | Nom groupe |
| `isDefault` | BOOLEAN | ✅ | `false` | Ferme défaut |
| `isActive` | BOOLEAN | ✅ | `true` | 🆕 Ferme active |
| `version` | INTEGER | ✅ | `1` | 🆕 Version |
| `deletedAt` | TIMESTAMP | ❌ | `null` | 🆕 Soft delete |
| `createdAt` | TIMESTAMP | ✅ | `now()` | Date création |
| `updatedAt` | TIMESTAMP | ✅ | `now()` | Date modification |

### 3.3.5. Schema Prisma APRÈS

```prisma
model Farm {
  id            String    @id
  name          String
  location      String
  country       String?    // 🆕 Code ISO pays
  department    String?    // 🆕 Code département
  commune       String?    // 🆕 Code INSEE commune
  ownerId       String    @map("owner_id")
  cheptelNumber String?   @map("cheptel_number")
  groupId       String?   @map("group_id")
  groupName     String?   @map("group_name")
  isDefault     Boolean   @default(false) @map("is_default")
  
  // 🆕 AJOUTS
  isActive      Boolean   @default(true) @map("is_active")
  version       Int       @default(1)
  deletedAt     DateTime? @map("deleted_at")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations existantes
  animals                          Animal[]
  lots                             Lot[]
  movements                        Movement[]
  personalCampaigns                PersonalCampaign[]  // 🔄 Renommé
  documents                        Document[]
  weights                          Weight[]
  treatments                       Treatment[]
  vaccinations                     Vaccination[]
  breedings                        Breeding[]
  lotAnimals                       LotAnimal[]
  veterinarians                    Veterinarian[]
  customMedicalProducts            CustomMedicalProduct[]  // 🔄 Renommé
  customVaccines                   CustomVaccine[]  // 🔄 Renommé
  preferences                      FarmPreferences?
  alertConfigurations              AlertConfiguration[]
  
  // 🆕 Nouvelles relations
  farmBreedPreferences             FarmBreedPreference[]
  farmProductPreferences           FarmProductPreference[]
  farmVaccinePreferences           FarmVaccinePreference[]
  farmVeterinarianPreferences      FarmVeterinarianPreference[]
  farmNationalCampaignPreferences  FarmNationalCampaignPreference[]

  @@index([ownerId])        // 🆕
  @@index([groupId])        // 🆕
  @@index([isDefault])      // 🆕
  @@index([isActive])       // 🆕
  @@index([deletedAt])      // 🆕
  @@index([country])        // 🆕
  @@index([department])     // 🆕
  @@map("farms")
}
```

### 3.3.6. Script migration

```sql
-- Ajouter nouveaux champs
ALTER TABLE farms 
  ADD COLUMN country VARCHAR(2) NULL,           -- ISO code
  ADD COLUMN department VARCHAR(3) NULL,        -- Code département
  ADD COLUMN commune VARCHAR(10) NULL,          -- Code INSEE
  ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN version INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN deleted_at TIMESTAMP NULL;

-- Créer indexes
CREATE INDEX idx_farms_owner_id ON farms(owner_id);
CREATE INDEX idx_farms_group_id ON farms(group_id);
CREATE INDEX idx_farms_is_default ON farms(is_default);
CREATE INDEX idx_farms_is_active ON farms(is_active);
CREATE INDEX idx_farms_deleted_at ON farms(deleted_at);
CREATE INDEX idx_farms_country ON farms(country);
CREATE INDEX idx_farms_department ON farms(department);
```

### 3.3.7. Notes importantes

**Géolocalisation:**
- `location` reste texte libre pour adresse complète
- `country`, `department`, `commune` ajoutés pour filtrage précis
- Utilisés pour filtrer vétérinaires, races, produits par zone

**Soft delete impact:**
- Si farm soft deleted → Toutes données farm restent mais cachées
- Fermeture exploitation sans perte historique
- ⚠️ Critique: Évite suppression cascade catastrophique

---

## 3.4. Veterinarians

### 3.4.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom table** | `veterinarians` |
| **Type** | Table multi-tenant (par ferme) |
| **Problème** | Manque department/commune, specialties VARCHAR au lieu de JSON, indexes manquants |
| **Priorité** | 🟡 IMPORTANT |

### 3.4.2. Structure AVANT

| Champ | Type DB | Description |
|-------|---------|-------------|
| `id` | UUID | Identifiant unique |
| `farmId` | VARCHAR | ID ferme |
| `firstName` | VARCHAR | Prénom |
| `lastName` | VARCHAR | Nom |
| `title` | VARCHAR | Titre (Dr., Pr.) |
| `licenseNumber` | VARCHAR | Numéro ordre |
| `specialties` | VARCHAR | Spécialités (comma-separated) ⚠️ |
| `clinic` | VARCHAR | Nom clinique |
| `phone` | VARCHAR | Téléphone |
| `mobile` | VARCHAR | Mobile |
| `email` | VARCHAR | Email |
| `address` | TEXT | Adresse |
| `city` | VARCHAR | Ville |
| `postalCode` | VARCHAR | Code postal |
| `country` | VARCHAR | Pays |
| ... (autres champs) |

### 3.4.3. Changements à appliquer

| Action | Champ | Type | Description |
|--------|-------|------|-------------|
| ➕ **AJOUTER** | `department` | VARCHAR | 🆕 Code département |
| ➕ **AJOUTER** | `commune` | VARCHAR | 🆕 Code INSEE commune |
| ⚠️ **MIGRER** | `specialties` | VARCHAR → JSON | Migration données nécessaire |
| ➕ **INDEX** | `isActive` | - | Performance |
| ➕ **INDEX** | `isDefault` | - | Vétérinaire défaut |
| ➕ **INDEX** | `department` | - | Filtrage géographique |

### 3.4.4. Schema Prisma APRÈS

```prisma
model Veterinarian {
  id                    String    @id @default(uuid())
  farmId                String    @map("farm_id")
  firstName             String    @map("first_name")
  lastName              String    @map("last_name")
  title                 String?
  licenseNumber         String    @map("license_number")
  
  // ⚠️ MIGRÉ VARCHAR → JSON
  specialties           Json      // 🔄 Était VARCHAR comma-separated
  
  clinic                String?
  phone                 String
  mobile                String?
  email                 String?
  address               String?
  city                  String?
  postalCode            String?   @map("postal_code")
  country               String?
  
  // 🆕 AJOUTS
  department            String?   // Code département
  commune               String?   // Code INSEE commune
  
  isAvailable           Boolean   @default(true) @map("is_available")
  emergencyService      Boolean   @default(false) @map("emergency_service")
  workingHours          String?   @map("working_hours")
  consultationFee       Float?    @map("consultation_fee")
  emergencyFee          Float?    @map("emergency_fee")
  currency              String?
  notes                 String?
  isPreferred           Boolean   @default(false) @map("is_preferred")
  isDefault             Boolean   @default(false) @map("is_default")
  rating                Int       @default(5)
  totalInterventions    Int       @default(0) @map("total_interventions")
  lastInterventionDate  DateTime? @map("last_intervention_date")
  isActive              Boolean   @default(true) @map("is_active")
  version               Int       @default(1)
  deletedAt             DateTime? @map("deleted_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  farm                           Farm                         @relation(fields: [farmId], references: [id], onDelete: Cascade)
  treatments                     Treatment[]
  vaccinations                   Vaccination[]
  farmVeterinarianPreferences    FarmVeterinarianPreference[] // 🆕

  @@index([farmId])
  @@index([deletedAt])
  @@index([isActive])     // 🆕
  @@index([isDefault])    // 🆕
  @@index([department])   // 🆕
  @@map("veterinarians")
}
```

### 3.4.5. Script migration données

```sql
-- Étape 1: Ajouter nouveaux champs
ALTER TABLE veterinarians
  ADD COLUMN department VARCHAR(3) NULL,
  ADD COLUMN commune VARCHAR(10) NULL;

-- Étape 2: Changer type specialties (PostgreSQL)
-- Créer colonne temporaire JSON
ALTER TABLE veterinarians ADD COLUMN specialties_json JSON NULL;

-- Migrer données: "bovins,ovins" → ["bovins", "ovins"]
UPDATE veterinarians 
SET specialties_json = 
  CASE 
    WHEN specialties IS NULL OR specialties = '' THEN '[]'::json
    ELSE ('["' || REPLACE(specialties, ',', '","') || '"]')::json
  END;

-- Supprimer ancienne colonne, renommer nouvelle
ALTER TABLE veterinarians DROP COLUMN specialties;
ALTER TABLE veterinarians RENAME COLUMN specialties_json TO specialties;
ALTER TABLE veterinarians ALTER COLUMN specialties SET NOT NULL;
ALTER TABLE veterinarians ALTER COLUMN specialties SET DEFAULT '[]'::json;

-- Étape 3: Créer indexes
CREATE INDEX idx_veterinarians_is_active ON veterinarians(is_active);
CREATE INDEX idx_veterinarians_is_default ON veterinarians(is_default);
CREATE INDEX idx_veterinarians_department ON veterinarians(department);
```

### 3.4.6. Exemple migration données

**AVANT:**
```json
{
  "specialties": "bovins,ovins,caprins"
}
```

**APRÈS:**
```json
{
  "specialties": ["bovins", "ovins", "caprins"]
}
```

---

## 3.5. AlertConfiguration

### 3.5.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom table** | `alert_configurations` |
| **Type** | Table multi-tenant (par ferme) |
| **Problème** | Doublon `enabled` / `isEnabled`, index manquant |
| **Priorité** | 🔴 URGENT (doublon) |

### 3.5.2. Changements à appliquer

| Action | Champ | Description |
|--------|-------|-------------|
| ❌ **SUPPRIMER** | `enabled` | Doublon, garder `isEnabled` |
| ➕ **INDEX** | `isEnabled` | Performance filtrage |

### 3.5.3. Schema Prisma APRÈS

```prisma
enum AlertType {
  urgent
  important
  routine
}

enum AlertPriority {
  low
  medium
  high
  critical
}

model AlertConfiguration {
  id              String         @id @default(uuid())
  farmId          String         @map("farm_id")
  evaluationType  String         @map("evaluation_type")
  type            AlertType      // 🆕 ENUM (était String)
  category        String
  titleKey        String         @map("title_key")
  messageKey      String         @map("message_key")
  severity        Int            @default(5)
  iconName        String         @map("icon_name")
  colorHex        String         @map("color_hex")
  alertType       String?        @map("alert_type")
  
  // ❌ enabled SUPPRIMÉ (doublon)
  isEnabled       Boolean        @default(true) @map("is_enabled")
  
  daysBeforeDue   Int            @default(7) @map("days_before_due")
  priority        AlertPriority  @default(medium)  // 🆕 ENUM (était String)
  version         Int            @default(1)
  deletedAt       DateTime?      @map("deleted_at")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  farm Farm @relation(fields: [farmId], references: [id], onDelete: Cascade)

  @@index([farmId])
  @@index([deletedAt])
  @@index([isEnabled])  // 🆕
  @@map("alert_configurations")
}
```

### 3.5.4. Script migration

```sql
-- Supprimer colonne enabled (doublon)
ALTER TABLE alert_configurations DROP COLUMN IF EXISTS enabled;

-- Créer index
CREATE INDEX idx_alert_configurations_is_enabled ON alert_configurations(is_enabled);

-- Ajouter contraintes ENUM (optionnel, selon DB)
-- PostgreSQL example:
ALTER TABLE alert_configurations 
  ADD CONSTRAINT alert_config_type_check 
  CHECK (type IN ('urgent', 'important', 'routine'));

ALTER TABLE alert_configurations 
  ADD CONSTRAINT alert_config_priority_check 
  CHECK (priority IN ('low', 'medium', 'high', 'critical'));
```

---

## 3.6. FarmPreferences

### 3.6.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom table** | `farm_preferences` |
| **Type** | Table multi-tenant (1:1 avec Farm) |
| **État actuel** | ✅ Déjà bien conçue |
| **Changements** | Mineurs (ENUM pour language) |

### 3.6.2. Changements mineurs

| Action | Champ | Description |
|--------|-------|-------------|
| ⚠️ **ENUM** | `language` | Ajouter contrainte ENUM (fr, en, ar) |
| ⚠️ **ENUM** | `weightUnit` | Ajouter contrainte ENUM (kg, lb) |
| ⚠️ **ENUM** | `currency` | Optionnel: ENUM (EUR, USD, DZD...) |

### 3.6.3. Schema Prisma APRÈS

```prisma
enum Language {
  fr
  en
  ar
}

enum WeightUnit {
  kg
  lb
}

model FarmPreferences {
  id                      String      @id @default(uuid())
  farmId                  String      @unique @map("farm_id")
  defaultVeterinarianId   String?     @map("default_veterinarian_id")
  defaultSpeciesId        String?     @map("default_species_id")
  defaultBreedId          String?     @map("default_breed_id")
  weightUnit              WeightUnit  @default(kg) @map("weight_unit")  // 🆕 ENUM
  currency                String      @default("EUR")
  language                Language    @default(fr)  // 🆕 ENUM
  dateFormat              String      @default("DD/MM/YYYY") @map("date_format")
  enableNotifications     Boolean     @default(true) @map("enable_notifications")
  createdAt               DateTime    @default(now()) @map("created_at")
  updatedAt               DateTime    @updatedAt @map("updated_at")

  farm Farm @relation(fields: [farmId], references: [id], onDelete: Cascade)

  @@index([farmId])
  @@map("farm_preferences")
}
```

---

# 4. Tables globales nouvelles

## 4.1. medical_products (globale)

### 4.1.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom table** | `medical_products` |
| **Type** | Référentiel global (partagé toutes fermes) |
| **Rôle** | Catalogue officiel produits médicaux/médicaments |
| **Complément** | `custom_medical_products` (par ferme) pour produits perso |
| **Seed data** | ✅ OUI - Base de données produits officiels |

### 4.1.2. Structure complète

| Champ | Type DB | Obligatoire | Défaut | Description |
|-------|---------|-------------|--------|-------------|
| `id` | UUID | ✅ | `uuid()` | Identifiant unique |
| `code` | VARCHAR | ✅ | - | Code produit (unique, ex: "AMX500") |
| `name` | VARCHAR | ✅ | - | Nom générique |
| `commercialName` | VARCHAR | ❌ | `null` | Nom commercial |
| `category` | VARCHAR | ✅ | - | Catégorie (antibiotic, anti-inflammatory...) |
| `activeIngredient` | VARCHAR | ❌ | `null` | Principe actif |
| `manufacturer` | VARCHAR | ❌ | `null` | Fabricant |
| `form` | VARCHAR | ❌ | `null` | Forme (tablet, injection, powder, liquid) |
| `standardDosage` | FLOAT | ❌ | `null` | Dosage standard |
| `dosageUnit` | VARCHAR | ❌ | `null` | Unité dosage |
| `withdrawalPeriodMeat` | INTEGER | ✅ | - | Délai retrait viande (jours) |
| `withdrawalPeriodMilk` | INTEGER | ✅ | - | Délai retrait lait (jours) |
| `targetSpecies` | JSON | ❌ | `null` | Espèces cibles (array) |
| `administrationRoute` | VARCHAR | ❌ | `null` | Voie administration |
| `standardCureDays` | INTEGER | ❌ | `null` | Durée standard traitement |
| `prescriptionRequired` | BOOLEAN | ✅ | `false` | Ordonnance requise |
| `description` | TEXT | ❌ | `null` | Description |
| `isActive` | BOOLEAN | ✅ | `true` | Produit actif |
| `version` | INTEGER | ✅ | `1` | Version |
| `deletedAt` | TIMESTAMP | ❌ | `null` | Soft delete |
| `createdAt` | TIMESTAMP | ✅ | `now()` | Date création |
| `updatedAt` | TIMESTAMP | ✅ | `now()` | Date modification |

### 4.1.3. Schema Prisma

```prisma
model MedicalProduct {
  id                    String    @id @default(uuid())
  code                  String    @unique  // Code produit unique
  name                  String
  commercialName        String?   @map("commercial_name")
  category              String
  activeIngredient      String?   @map("active_ingredient")
  manufacturer          String?
  form                  String?
  standardDosage        Float?    @map("standard_dosage")
  dosageUnit            String?   @map("dosage_unit")
  withdrawalPeriodMeat  Int       @map("withdrawal_period_meat")
  withdrawalPeriodMilk  Int       @map("withdrawal_period_milk")
  targetSpecies         Json?     @map("target_species")
  administrationRoute   String?   @map("administration_route")
  standardCureDays      Int?      @map("standard_cure_days")
  prescriptionRequired  Boolean   @default(false) @map("prescription_required")
  description           String?
  isActive              Boolean   @default(true) @map("is_active")
  version               Int       @default(1)
  deletedAt             DateTime? @map("deleted_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  productCountries       ProductCountry[]
  farmProductPreferences FarmProductPreference[]

  @@index([code])
  @@index([isActive])
  @@index([deletedAt])
  @@index([category])
  @@map("medical_products")
}
```

### 4.1.4. Relations

| Relation | Type | Description |
|----------|------|-------------|
| `productCountries` | One-to-Many | Disponibilité par pays |
| `farmProductPreferences` | One-to-Many | Préférences fermes |

### 4.1.5. Exemples seed data

```json
[
  {
    "code": "AMX500",
    "name": "Amoxicilline 500mg",
    "commercialName": "Clamoxyl",
    "category": "antibiotic",
    "activeIngredient": "Amoxicillin",
    "form": "tablet",
    "standardDosage": 500,
    "dosageUnit": "mg",
    "withdrawalPeriodMeat": 14,
    "withdrawalPeriodMilk": 3,
    "targetSpecies": ["cattle", "sheep", "goat"],
    "prescriptionRequired": true,
    "isActive": true
  },
  {
    "code": "IVER10",
    "name": "Ivermectine injectable 1%",
    "category": "antiparasitic",
    "activeIngredient": "Ivermectin",
    "form": "injection",
    "standardDosage": 1,
    "dosageUnit": "ml/50kg",
    "withdrawalPeriodMeat": 28,
    "withdrawalPeriodMilk": 0,
    "targetSpecies": ["cattle", "sheep", "goat"],
    "prescriptionRequired": false,
    "isActive": true
  }
]
```

### 4.1.6. Notes techniques

- **Multi-tenant**: ❌ NON (globale)
- **Seed data**: ✅ OUI (base produits officiels)
- **Modifiable**: ❌ NON (sauf admin système)
- **Complément**: `custom_medical_products` pour produits ferme
- **Filtrage**: Via `product_countries` puis `farm_product_preferences`

---

## 4.2. vaccines (globale)

### 4.2.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom table** | `vaccines` |
| **Type** | Référentiel global |
| **Rôle** | Catalogue vaccins officiels homologués |
| **Complément** | `custom_vaccines` pour vaccins expérimentaux/spécifiques |

### 4.2.2. Structure complète

| Champ | Type DB | Obligatoire | Défaut | Description |
|-------|---------|-------------|--------|-------------|
| `id` | UUID | ✅ | `uuid()` | Identifiant unique |
| `code` | VARCHAR | ✅ | - | Code vaccin unique |
| `name` | VARCHAR | ✅ | - | Nom vaccin |
| `manufacturer` | VARCHAR | ❌ | `null` | Fabricant |
| `targetSpecies` | JSON | ❌ | `null` | Espèces cibles (array) |
| `targetDiseases` | JSON | ❌ | `null` | Maladies cibles (array) |
| `standardDose` | FLOAT | ❌ | `null` | Dose standard |
| `doseUnit` | VARCHAR | ❌ | `null` | Unité dose |
| `injectionsRequired` | INTEGER | ✅ | `1` | Nombre injections |
| `injectionIntervalDays` | INTEGER | ❌ | `null` | Intervalle injections (jours) |
| `boosterIntervalMonths` | INTEGER | ❌ | `null` | Intervalle rappels (mois) |
| `meatWithdrawalDays` | INTEGER | ❌ | `0` | Délai retrait viande |
| `milkWithdrawalDays` | INTEGER | ❌ | `0` | Délai retrait lait |
| `administrationRoute` | VARCHAR | ❌ | `null` | Voie administration |
| `storageTemperature` | VARCHAR | ❌ | `null` | Température stockage |
| `shelfLifeDays` | INTEGER | ❌ | `null` | Durée conservation |
| `isMandatory` | BOOLEAN | ✅ | `false` | Vaccination obligatoire |
| `description` | TEXT | ❌ | `null` | Description |
| `isActive` | BOOLEAN | ✅ | `true` | Vaccin actif |
| `version` | INTEGER | ✅ | `1` | Version |
| `deletedAt` | TIMESTAMP | ❌ | `null` | Soft delete |
| `createdAt` | TIMESTAMP | ✅ | `now()` | Date création |
| `updatedAt` | TIMESTAMP | ✅ | `now()` | Date modification |

### 4.2.3. Schema Prisma

```prisma
model Vaccine {
  id                     String    @id @default(uuid())
  code                   String    @unique
  name                   String
  manufacturer           String?
  targetSpecies          Json?     @map("target_species")
  targetDiseases         Json?     @map("target_diseases")
  standardDose           Float?    @map("standard_dose")
  doseUnit               String?   @map("dose_unit")
  injectionsRequired     Int       @default(1) @map("injections_required")
  injectionIntervalDays  Int?      @map("injection_interval_days")
  boosterIntervalMonths  Int?      @map("booster_interval_months")
  meatWithdrawalDays     Int       @default(0) @map("meat_withdrawal_days")
  milkWithdrawalDays     Int       @default(0) @map("milk_withdrawal_days")
  administrationRoute    String?   @map("administration_route")
  storageTemperature     String?   @map("storage_temperature")
  shelfLifeDays          Int?      @map("shelf_life_days")
  isMandatory            Boolean   @default(false) @map("is_mandatory")
  description            String?
  isActive               Boolean   @default(true) @map("is_active")
  version                Int       @default(1)
  deletedAt              DateTime? @map("deleted_at")
  createdAt              DateTime  @default(now()) @map("created_at")
  updatedAt              DateTime  @updatedAt @map("updated_at")

  vaccineCountries       VaccineCountry[]
  farmVaccinePreferences FarmVaccinePreference[]

  @@index([code])
  @@index([isActive])
  @@index([deletedAt])
  @@index([isMandatory])
  @@map("vaccines")
}
```

### 4.2.4. Exemples seed data

```json
[
  {
    "code": "FCO",
    "name": "Vaccin Fièvre Catarrhale Ovine",
    "manufacturer": "Laboratoire Boehringer",
    "targetSpecies": ["sheep", "cattle"],
    "targetDiseases": ["Bluetongue"],
    "standardDose": 1,
    "doseUnit": "ml",
    "injectionsRequired": 1,
    "boosterIntervalMonths": 12,
    "administrationRoute": "Sous-cutanée",
    "isMandatory": true,
    "isActive": true
  },
  {
    "code": "RAGE",
    "name": "Vaccin Rage",
    "targetSpecies": ["cattle", "sheep", "goat", "horse"],
    "targetDiseases": ["Rabies"],
    "injectionsRequired": 1,
    "boosterIntervalMonths": 36,
    "isMandatory": false,
    "isActive": true
  }
]
```

---

## 4.3. national_campaigns

### 4.3.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom table** | `national_campaigns` |
| **Type** | Référentiel global |
| **Rôle** | Campagnes nationales obligatoires (ex: FCO France 2025) |
| **Complément** | `personal_campaigns` pour plannings ferme |

### 4.3.2. Structure complète

| Champ | Type DB | Obligatoire | Défaut | Description |
|-------|---------|-------------|--------|-------------|
| `id` | UUID | ✅ | `uuid()` | Identifiant unique |
| `code` | VARCHAR | ✅ | - | Code campagne unique |
| `name` | VARCHAR | ✅ | - | Nom campagne |
| `type` | VARCHAR | ✅ | - | Type (vaccination, treatment, identification) |
| `description` | TEXT | ❌ | `null` | Description détaillée |
| `targetSpecies` | JSON | ❌ | `null` | Espèces concernées |
| `startDate` | TIMESTAMP | ✅ | - | Date début campagne |
| `endDate` | TIMESTAMP | ✅ | - | Date fin campagne |
| `isMandatory` | BOOLEAN | ✅ | `false` | Campagne obligatoire |
| `vaccineName` | VARCHAR | ❌ | `null` | Nom vaccin (si applicable) |
| `productName` | VARCHAR | ❌ | `null` | Nom produit (si applicable) |
| `authority` | VARCHAR | ❌ | `null` | Autorité (Ministère Agriculture FR) |
| `officialLink` | VARCHAR | ❌ | `null` | Lien documentation officielle |
| `penalty` | TEXT | ❌ | `null` | Sanctions non-conformité |
| `isActive` | BOOLEAN | ✅ | `true` | Campagne active |
| `version` | INTEGER | ✅ | `1` | Version |
| `deletedAt` | TIMESTAMP | ❌ | `null` | Soft delete |
| `createdAt` | TIMESTAMP | ✅ | `now()` | Date création |
| `updatedAt` | TIMESTAMP | ✅ | `now()` | Date modification |

### 4.3.3. Schema Prisma

```prisma
enum NationalCampaignType {
  vaccination
  treatment
  identification
  weighing
  other
}

model NationalCampaign {
  id                              String               @id @default(uuid())
  code                            String               @unique
  name                            String
  type                            NationalCampaignType
  description                     String?
  targetSpecies                   Json?                @map("target_species")
  startDate                       DateTime             @map("start_date")
  endDate                         DateTime             @map("end_date")
  isMandatory                     Boolean              @default(false) @map("is_mandatory")
  vaccineName                     String?              @map("vaccine_name")
  productName                     String?              @map("product_name")
  authority                       String?
  officialLink                    String?              @map("official_link")
  penalty                         String?
  isActive                        Boolean              @default(true) @map("is_active")
  version                         Int                  @default(1)
  deletedAt                       DateTime?            @map("deleted_at")
  createdAt                       DateTime             @default(now()) @map("created_at")
  updatedAt                       DateTime             @updatedAt @map("updated_at")

  campaignCountries               CampaignCountry[]
  farmNationalCampaignPreferences FarmNationalCampaignPreference[]

  @@index([code])
  @@index([isActive])
  @@index([isMandatory])
  @@index([startDate])
  @@index([endDate])
  @@map("national_campaigns")
}
```

### 4.3.4. Exemples seed data

```json
[
  {
    "code": "FCO_FR_2025",
    "name": "Campagne Vaccination FCO 2025 - France",
    "type": "vaccination",
    "description": "Campagne nationale obligatoire vaccination Fièvre Catarrhale Ovine",
    "targetSpecies": ["sheep", "cattle"],
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z",
    "isMandatory": true,
    "vaccineName": "Vaccin FCO Sérotype 8",
    "authority": "Ministère de l'Agriculture - France",
    "officialLink": "https://agriculture.gouv.fr/fco-2025",
    "penalty": "Amende jusqu'à 1500€ + interdiction commercialisation animaux",
    "isActive": true
  }
]
```

---

## 4.4. alert_templates

### 4.4.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom table** | `alert_templates` |
| **Type** | Référentiel global |
| **Rôle** | Templates alertes prédéfinis application |
| **Complément** | `alert_configurations` (par ferme) pour activation/personnalisation |

### 4.4.2. Structure complète

| Champ | Type DB | Obligatoire | Défaut | Description |
|-------|---------|-------------|--------|-------------|
| `id` | UUID | ✅ | `uuid()` | Identifiant unique |
| `code` | VARCHAR | ✅ | - | Code template unique |
| `evaluationType` | VARCHAR | ✅ | - | Type évaluation (vaccination, treatment...) |
| `type` | VARCHAR | ✅ | - | Type alerte (urgent, important, routine) |
| `category` | VARCHAR | ✅ | - | Catégorie (health, compliance, monitoring...) |
| `titleKey` | VARCHAR | ✅ | - | Clé i18n titre |
| `messageKey` | VARCHAR | ✅ | - | Clé i18n message |
| `severity` | INTEGER | ✅ | `5` | Sévérité (1-10) |
| `iconName` | VARCHAR | ✅ | - | Nom icône |
| `colorHex` | VARCHAR | ✅ | - | Couleur hex |
| `defaultDaysBeforeDue` | INTEGER | ✅ | `7` | Délai défaut (jours) |
| `defaultPriority` | VARCHAR | ✅ | `medium` | Priorité défaut |
| `description` | TEXT | ❌ | `null` | Description template |
| `isActive` | BOOLEAN | ✅ | `true` | Template actif |
| `version` | INTEGER | ✅ | `1` | Version |
| `deletedAt` | TIMESTAMP | ❌ | `null` | Soft delete |
| `createdAt` | TIMESTAMP | ✅ | `now()` | Date création |
| `updatedAt` | TIMESTAMP | ✅ | `now()` | Date modification |

### 4.4.3. Schema Prisma

```prisma
model AlertTemplate {
  id                    String    @id @default(uuid())
  code                  String    @unique
  evaluationType        String    @map("evaluation_type")
  type                  AlertType
  category              String
  titleKey              String    @map("title_key")
  messageKey            String    @map("message_key")
  severity              Int       @default(5)
  iconName              String    @map("icon_name")
  colorHex              String    @map("color_hex")
  defaultDaysBeforeDue  Int       @default(7) @map("default_days_before_due")
  defaultPriority       AlertPriority @default(medium) @map("default_priority")
  description           String?
  isActive              Boolean   @default(true) @map("is_active")
  version               Int       @default(1)
  deletedAt             DateTime? @map("deleted_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  alertConfigurations AlertConfiguration[]  // Relation via farm_alert_configs

  @@index([code])
  @@index([isActive])
  @@index([evaluationType])
  @@map("alert_templates")
}
```

### 4.4.4. Exemples seed data

```json
[
  {
    "code": "DRAFT_ANIMAL_OVERDUE",
    "evaluationType": "draft_validation",
    "type": "urgent",
    "category": "compliance",
    "titleKey": "alert.draft.overdue.title",
    "messageKey": "alert.draft.overdue.message",
    "severity": 9,
    "iconName": "alert-triangle",
    "colorHex": "#FF5722",
    "defaultDaysBeforeDue": 30,
    "defaultPriority": "high",
    "description": "Alerte animaux DRAFT > 30 jours non validés",
    "isActive": true
  },
  {
    "code": "VACCINATION_DUE",
    "evaluationType": "vaccination",
    "type": "important",
    "category": "health",
    "titleKey": "alert.vaccination.due.title",
    "messageKey": "alert.vaccination.due.message",
    "severity": 7,
    "iconName": "syringe",
    "colorHex": "#2196F3",
    "defaultDaysBeforeDue": 7,
    "defaultPriority": "medium",
    "description": "Rappel vaccination à venir",
    "isActive": true
  },
  {
    "code": "TREATMENT_WITHDRAWAL_END",
    "evaluationType": "treatment",
    "type": "urgent",
    "category": "compliance",
    "titleKey": "alert.treatment.withdrawal.title",
    "messageKey": "alert.treatment.withdrawal.message",
    "severity": 10,
    "iconName": "pill",
    "colorHex": "#E91E63",
    "defaultDaysBeforeDue": 0,
    "defaultPriority": "critical",
    "description": "Fin délai retrait traitement",
    "isActive": true
  }
]
```

---

# 5. Tables liaison pays nouvelles

## 5.1. breed_countries

### 5.1.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom table** | `breed_countries` |
| **Type** | Table de liaison Many-to-Many |
| **Rôle** | Disponibilité races par pays |
| **Relation** | `breeds` ↔ Pays (ISO codes) |

### 5.1.2. Structure

| Champ | Type DB | Obligatoire | Description |
|-------|---------|-------------|-------------|
| `id` | UUID | ✅ | Identifiant unique |
| `breedId` | VARCHAR | ✅ | ID race (FK) |
| `countryCode` | VARCHAR(2) | ✅ | Code ISO pays (ex: "FR") |
| `createdAt` | TIMESTAMP | ✅ | Date création |
| `updatedAt` | TIMESTAMP | ✅ | Date modification |

### 5.1.3. Schema Prisma

```prisma
model BreedCountry {
  id          String   @id @default(uuid())
  breedId     String   @map("breed_id")
  countryCode String   @map("country_code")  // ISO 3166-1 alpha-2
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  breed Breed @relation(fields: [breedId], references: [id], onDelete: Cascade)

  @@unique([breedId, countryCode])
  @@index([breedId])
  @@index([countryCode])
  @@map("breed_countries")
}
```

### 5.1.4. Contraintes

```sql
-- Contrainte unicité
UNIQUE (breed_id, country_code)

-- Foreign key avec CASCADE
FOREIGN KEY (breed_id) REFERENCES breeds(id) ON DELETE CASCADE

-- Validation country_code (optionnel)
CHECK (country_code ~ '^[A-Z]{2}$')
```

### 5.1.5. Exemples seed data

```json
[
  { "breedId": "lacaune", "countryCode": "FR" },
  { "breedId": "lacaune", "countryCode": "ES" },
  { "breedId": "lacaune", "countryCode": "IT" },
  { "breedId": "lacaune", "countryCode": "PT" },
  { "breedId": "bizet", "countryCode": "FR" },
  { "breedId": "manchega", "countryCode": "ES" },
  { "breedId": "sarde", "countryCode": "IT" },
  { "breedId": "charolaise", "countryCode": "FR" },
  { "breedId": "charolaise", "countryCode": "ES" },
  { "breedId": "charolaise", "countryCode": "IT" },
  { "breedId": "charolaise", "countryCode": "DE" },
  { "breedId": "charolaise", "countryCode": "BE" }
]
```

### 5.1.6. Notes techniques

- **Pas de soft delete**: Table de liaison pure
- **Seed data**: ✅ OUI (mapping complet races-pays)
- **CASCADE delete**: Si race supprimée → liaisons supprimées
- **Usage**: Filtrer races disponibles pour pays ferme

---

## 5.2. product_countries

### 5.2.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom table** | `product_countries` |
| **Type** | Table de liaison Many-to-Many |
| **Rôle** | Disponibilité produits médicaux par pays |

### 5.2.2. Schema Prisma

```prisma
model ProductCountry {
  id          String   @id @default(uuid())
  productId   String   @map("product_id")
  countryCode String   @map("country_code")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  product MedicalProduct @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([productId, countryCode])
  @@index([productId])
  @@index([countryCode])
  @@map("product_countries")
}
```

### 5.2.3. Exemples seed data

```json
[
  { "productId": "AMX500", "countryCode": "FR" },
  { "productId": "AMX500", "countryCode": "ES" },
  { "productId": "AMX500", "countryCode": "IT" },
  { "productId": "IVER10", "countryCode": "FR" },
  { "productId": "IVER10", "countryCode": "ES" }
]
```

---

## 5.3. vaccine_countries

### 5.3.1. Schema Prisma

```prisma
model VaccineCountry {
  id          String   @id @default(uuid())
  vaccineId   String   @map("vaccine_id")
  countryCode String   @map("country_code")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  vaccine Vaccine @relation(fields: [vaccineId], references: [id], onDelete: Cascade)

  @@unique([vaccineId, countryCode])
  @@index([vaccineId])
  @@index([countryCode])
  @@map("vaccine_countries")
}
```

---

## 5.4. campaign_countries

### 5.4.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Particularité** | Peut avoir `isActive` par pays (campagne active FR, pas ES) |

### 5.4.2. Schema Prisma

```prisma
model CampaignCountry {
  id          String   @id @default(uuid())
  campaignId  String   @map("campaign_id")
  countryCode String   @map("country_code")
  isActive    Boolean  @default(true) @map("is_active")  // 🆕 Par pays
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  campaign NationalCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@unique([campaignId, countryCode])
  @@index([campaignId])
  @@index([countryCode])
  @@index([isActive])
  @@map("campaign_countries")
}
```

### 5.4.3. Exemples seed data

```json
[
  {
    "campaignId": "FCO_2025",
    "countryCode": "FR",
    "isActive": true
  },
  {
    "campaignId": "FCO_2025",
    "countryCode": "ES",
    "isActive": true
  },
  {
    "campaignId": "BRUCELLOSE_2025",
    "countryCode": "FR",
    "isActive": false
  }
]
```

---

# 6. Tables préférences ferme nouvelles

## 6.1. farm_breed_preferences

### 6.1.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom table** | `farm_breed_preferences` |
| **Type** | Configuration espace travail ferme |
| **Rôle** | Quelles races afficher, dans quel ordre, avec quel nom |

### 6.1.2. Structure complète

| Champ | Type DB | Obligatoire | Défaut | Description |
|-------|---------|-------------|--------|-------------|
| `id` | UUID | ✅ | `uuid()` | Identifiant unique |
| `farmId` | VARCHAR | ✅ | - | ID ferme |
| `breedId` | VARCHAR | ✅ | - | ID race globale |
| `isVisible` | BOOLEAN | ✅ | `true` | Race visible dans listes |
| `displayOrder` | INTEGER | ✅ | `0` | Ordre affichage personnalisé |
| `customName` | VARCHAR | ❌ | `null` | Surcharge nom affichage |
| `notes` | TEXT | ❌ | `null` | Notes perso ferme |
| `createdAt` | TIMESTAMP | ✅ | `now()` | Date création |
| `updatedAt` | TIMESTAMP | ✅ | `now()` | Date modification |

### 6.1.3. Schema Prisma

```prisma
model FarmBreedPreference {
  id           String   @id @default(uuid())
  farmId       String   @map("farm_id")
  breedId      String   @map("breed_id")
  isVisible    Boolean  @default(true) @map("is_visible")
  displayOrder Int      @default(0) @map("display_order")
  customName   String?  @map("custom_name")
  notes        String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  farm  Farm  @relation(fields: [farmId], references: [id], onDelete: Cascade)
  breed Breed @relation(fields: [breedId], references: [id])

  @@unique([farmId, breedId])
  @@index([farmId])
  @@index([breedId])
  @@index([isVisible])
  @@index([displayOrder])
  @@map("farm_breed_preferences")
}
```

### 6.1.4. Workflow setup initial

```typescript
// Lors création ferme ou première connexion
async function initializeFarmBreedPreferences(farmId: string, farmCountry: string) {
  // 1. Charger races globales disponibles dans le pays
  const availableBreeds = await db.breed.findMany({
    where: {
      breedCountries: {
        some: { countryCode: farmCountry }
      },
      isActive: true,
      deletedAt: null
    }
  });

  // 2. Créer préférences par défaut (toutes visibles)
  for (const breed of availableBreeds) {
    await db.farmBreedPreference.create({
      data: {
        farmId,
        breedId: breed.id,
        isVisible: true,
        displayOrder: 0  // Tri alphabétique par défaut
      }
    });
  }
}
```

### 6.1.5. Query transactionnelle

```typescript
// Récupérer races configurées pour la ferme (usage quotidien)
async function getVisibleBreeds(farmId: string) {
  return db.farmBreedPreference.findMany({
    where: {
      farmId,
      isVisible: true
    },
    include: {
      breed: true
    },
    orderBy: {
      displayOrder: 'asc'
    }
  });
}
```

### 6.1.6. Notes techniques

- **Pas de soft delete**: DELETE direct si ferme enlève race
- **Setup une fois**: Première connexion ferme
- **Transactionnel**: Query directe, pas de JOIN avec tables globales
- **Offline**: Sync bidirectionnelle (prefs modifiées offline → sync serveur)

---

## 6.2. farm_product_preferences

### 6.2.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Nom table** | `farm_product_preferences` |
| **Particularité** | Gère produits globaux ET custom via deux FK |

### 6.2.2. Structure complète

| Champ | Type DB | Obligatoire | Description |
|-------|---------|-------------|-------------|
| `id` | UUID | ✅ | Identifiant unique |
| `farmId` | VARCHAR | ✅ | ID ferme |
| `productId` | VARCHAR | ❌ | ID produit global (nullable) |
| `customProductId` | VARCHAR | ❌ | ID produit custom (nullable) |
| `isVisible` | BOOLEAN | ✅ | Produit visible |
| `displayOrder` | INTEGER | ✅ | Ordre affichage |
| `customName` | VARCHAR | ❌ | Surcharge nom |
| `currentStock` | FLOAT | ❌ | Override stock (si custom) |
| `minStock` | FLOAT | ❌ | Override seuil alerte |
| `notes` | TEXT | ❌ | Notes |
| `createdAt` | TIMESTAMP | ✅ | Date création |
| `updatedAt` | TIMESTAMP | ✅ | Date modification |

### 6.2.3. Schema Prisma

```prisma
model FarmProductPreference {
  id              String   @id @default(uuid())
  farmId          String   @map("farm_id")
  productId       String?  @map("product_id")         // FK → medical_products (global)
  customProductId String?  @map("custom_product_id")  // FK → custom_medical_products
  isVisible       Boolean  @default(true) @map("is_visible")
  displayOrder    Int      @default(0) @map("display_order")
  customName      String?  @map("custom_name")
  currentStock    Float?   @map("current_stock")
  minStock        Float?   @map("min_stock")
  notes           String?
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  farm          Farm                  @relation(fields: [farmId], references: [id], onDelete: Cascade)
  product       MedicalProduct?       @relation(fields: [productId], references: [id])
  customProduct CustomMedicalProduct? @relation(fields: [customProductId], references: [id])

  @@unique([farmId, productId])
  @@unique([farmId, customProductId])
  @@index([farmId])
  @@index([productId])
  @@index([customProductId])
  @@index([isVisible])
  @@map("farm_product_preferences")
}
```

### 6.2.4. Contrainte CHECK

```sql
-- Un et un seul doit être rempli
ALTER TABLE farm_product_preferences
ADD CONSTRAINT check_product_xor
CHECK (
  (product_id IS NOT NULL AND custom_product_id IS NULL)
  OR
  (product_id IS NULL AND custom_product_id IS NOT NULL)
);
```

### 6.2.5. Workflow produits

```typescript
// Ajouter produit global à l'espace ferme
async function addGlobalProductToFarm(farmId: string, productId: string) {
  await db.farmProductPreference.create({
    data: {
      farmId,
      productId,  // Global
      customProductId: null,
      isVisible: true
    }
  });
}

// Ajouter produit custom
async function addCustomProductToFarm(farmId: string, customProductId: string) {
  await db.farmProductPreference.create({
    data: {
      farmId,
      productId: null,
      customProductId,  // Custom
      isVisible: true
    }
  });
}

// Query tous produits ferme (global + custom)
async function getAllFarmProducts(farmId: string) {
  return db.farmProductPreference.findMany({
    where: {
      farmId,
      isVisible: true
    },
    include: {
      product: true,        // Peut être null
      customProduct: true   // Peut être null
    },
    orderBy: { displayOrder: 'asc' }
  });
}
```

---

## 6.3. farm_vaccine_preferences

### 6.3.1. Schema Prisma

```prisma
model FarmVaccinePreference {
  id              String   @id @default(uuid())
  farmId          String   @map("farm_id")
  vaccineId       String?  @map("vaccine_id")
  customVaccineId String?  @map("custom_vaccine_id")
  isVisible       Boolean  @default(true) @map("is_visible")
  displayOrder    Int      @default(0) @map("display_order")
  customName      String?  @map("custom_name")
  notes           String?
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  farm          Farm          @relation(fields: [farmId], references: [id], onDelete: Cascade)
  vaccine       Vaccine?      @relation(fields: [vaccineId], references: [id])
  customVaccine CustomVaccine? @relation(fields: [customVaccineId], references: [id])

  @@unique([farmId, vaccineId])
  @@unique([farmId, customVaccineId])
  @@index([farmId])
  @@index([isVisible])
  @@map("farm_vaccine_preferences")
}
```

---

## 6.4. farm_veterinarian_preferences

### 6.4.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Particularité** | Vétérinaires déjà par ferme, pas de global |

### 6.4.2. Schema Prisma

```prisma
model FarmVeterinarianPreference {
  id               String    @id @default(uuid())
  farmId           String    @map("farm_id")
  veterinarianId   String    @map("veterinarian_id")
  isPrimary        Boolean   @default(false) @map("is_primary")  // Vétérinaire principal
  customNotes      String?   @map("custom_notes")
  lastContactDate  DateTime? @map("last_contact_date")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  farm         Farm         @relation(fields: [farmId], references: [id], onDelete: Cascade)
  veterinarian Veterinarian @relation(fields: [veterinarianId], references: [id])

  @@unique([farmId, veterinarianId])
  @@index([farmId])
  @@index([veterinarianId])
  @@index([isPrimary])
  @@map("farm_veterinarian_preferences")
}
```

### 6.4.3. Notes

- Vétérinaires déjà multi-tenant (farmId dans `veterinarians`)
- Cette table = **ordering/priorité** des vétérinaires ferme
- `isPrimary`: Vétérinaire par défaut pour cette ferme

---

## 6.5. farm_national_campaign_preferences

### 6.5.1. Vue d'ensemble

| Propriété | Valeur |
|-----------|---------|
| **Rôle** | Activation campagnes nationales + overrides dates |

### 6.5.2. Schema Prisma

```prisma
model FarmNationalCampaignPreference {
  id              String    @id @default(uuid())
  farmId          String    @map("farm_id")
  campaignId      String    @map("campaign_id")
  isEnabled       Boolean   @default(true) @map("is_enabled")
  customStartDate DateTime? @map("custom_start_date")  // Override date début
  customEndDate   DateTime? @map("custom_end_date")    // Override date fin
  customNotes     String?   @map("custom_notes")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  farm     Farm             @relation(fields: [farmId], references: [id], onDelete: Cascade)
  campaign NationalCampaign @relation(fields: [campaignId], references: [id])

  @@unique([farmId, campaignId])
  @@index([farmId])
  @@index([campaignId])
  @@index([isEnabled])
  @@map("farm_national_campaign_preferences")
}
```

### 6.5.3. Workflow

```typescript
// Ferme désactive campagne FCO
await db.farmNationalCampaignPreference.update({
  where: { farmId_campaignId: { farmId, campaignId: 'FCO_2025' } },
  data: { isEnabled: false }
});

// Ferme ajuste dates campagne
await db.farmNationalCampaignPreference.update({
  where: { farmId_campaignId: { farmId, campaignId: 'FCO_2025' } },
  data: {
    customStartDate: new Date('2025-02-01'),
    customEndDate: new Date('2025-11-30')
  }
});
```

---

# 7. Contraintes & règles métier

## 7.1. Soft Delete Cascade Rules

### 7.1.1. Tables globales

| Table | Soft deleted | Impact sur... | Règle |
|-------|--------------|---------------|-------|
| **Species** | ✅ | `animals.speciesId` | ✅ FK RESTE - Donnée historique préservée |
| **Breeds** | ✅ | `animals.breedId` | ✅ FK RESTE - Donnée historique préservée |
| **Breeds** | ✅ | `farm_breed_preferences` | ✅ Préférences RESTENT - Choix ferme préservé |
| **MedicalProduct** | ✅ | `farm_product_preferences` | ✅ Préférences RESTENT |
| **MedicalProduct** | ✅ | `treatments.productId` | ⚠️ Via preferences, donc indirect |
| **Vaccine** | ✅ | `farm_vaccine_preferences` | ✅ Préférences RESTENT |
| **NationalCampaign** | ✅ | `farm_national_campaign_preferences` | ✅ Préférences RESTENT |

**Règle générale globales:** Soft delete ne casse JAMAIS les FK. Les queries excluent `deletedAt IS NOT NULL`.

### 7.1.2. Tables par ferme

| Table | Soft deleted | Impact cascade |
|-------|--------------|----------------|
| **Farm** | ✅ | Toutes données farm soft deleted (via query filters) |
| **CustomMedicalProduct** | ✅ | `treatments` concernés masqués |
| **CustomVaccine** | ✅ | `vaccinations` concernées masquées |
| **PersonalCampaign** | ✅ | Historique préservé, juste masqué UI |

### 7.1.3. UI Handling

```typescript
// Affichage animal avec race soft deleted
function displayAnimalBreed(animal: Animal) {
  if (animal.breed.deletedAt) {
    return `${animal.breed.name} (Race obsolète)`;
  }
  return animal.breed.name;
}
```

---

## 7.2. Contraintes ENUM à ajouter

### 7.2.1. PersonalCampaigns

```sql
CREATE TYPE personal_campaign_type AS ENUM (
  'vaccination',
  'treatment',
  'weighing',
  'identification'
);

CREATE TYPE personal_campaign_status AS ENUM (
  'planned',
  'in_progress',
  'completed',
  'cancelled'
);
```

### 7.2.2. NationalCampaigns

```sql
CREATE TYPE national_campaign_type AS ENUM (
  'vaccination',
  'treatment',
  'identification',
  'weighing',
  'other'
);
```

### 7.2.3. AlertConfiguration

```sql
CREATE TYPE alert_type AS ENUM (
  'urgent',
  'important',
  'routine'
);

CREATE TYPE alert_priority AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);
```

### 7.2.4. FarmPreferences

```sql
CREATE TYPE language AS ENUM (
  'fr',
  'en',
  'ar'
);

CREATE TYPE weight_unit AS ENUM (
  'kg',
  'lb'
);
```

### 7.2.5. MedicalProduct (optionnel)

```sql
CREATE TYPE product_form AS ENUM (
  'tablet',
  'injection',
  'powder',
  'liquid',
  'paste',
  'other'
);
```

---

## 7.3. Règles isActive

### 7.3.1. Tables avec isActive OBLIGATOIRE

```
✅ Species (désactiver espèce temporairement)
✅ Breeds (désactiver race obsolète)
✅ Farms (désactiver ferme fermée temporairement)
✅ MedicalProduct (global - produit retiré du marché)
✅ CustomMedicalProduct (produit ferme plus utilisé)
✅ Vaccine (global - vaccin retiré)
✅ CustomVaccine (vaccin ferme plus utilisé)
✅ Veterinarian (vétérinaire plus disponible)
✅ NationalCampaign (campagne terminée/annulée)
✅ AlertTemplate (template désactivé)
```

### 7.3.2. Tables SANS isActive

```
❌ Tables liaison pays (pas pertinent, DELETE direct)
❌ Tables farm_preferences (DELETE direct si enlève)
❌ PersonalCampaign (a `status` à la place)
```

### 7.3.3. Différence isActive vs deletedAt

| Champ | Usage | Réversible | Impact UI |
|-------|-------|------------|-----------|
| `isActive = false` | Désactivation temporaire | ✅ OUI (toggle) | Caché listes, récupérable |
| `deletedAt != null` | Suppression soft | ⚠️ Difficile (restauration admin) | Masqué partout, historique |

**Exemple:**
```typescript
// Vétérinaire en congé 3 mois
vet.isActive = false;  // ✅ Réactivé après congé

// Vétérinaire retraité définitivement
vet.deletedAt = now();  // ⚠️ Soft delete, pas de retour
```

---

## 7.4. Règles validation métier

### 7.4.1. Farms geo fields

```typescript
// Validation création ferme
function validateFarm(farm: Farm) {
  // Location requis (texte libre adresse)
  if (!farm.location) throw new Error('Location required');
  
  // Geo fields optionnels MAIS cohérents
  if (farm.department && !farm.country) {
    throw new Error('Country required if department specified');
  }
  
  if (farm.commune && !farm.department) {
    throw new Error('Department required if commune specified');
  }
  
  // Validation format codes
  if (farm.country && !/^[A-Z]{2}$/.test(farm.country)) {
    throw new Error('Invalid country code format');
  }
  
  if (farm.department && !/^[0-9]{2,3}$/.test(farm.department)) {
    throw new Error('Invalid department code format');
  }
}
```

### 7.4.2. FarmProductPreference XOR

```typescript
// Un et un seul productId OU customProductId
function validateProductPreference(pref: FarmProductPreference) {
  const hasProduct = !!pref.productId;
  const hasCustom = !!pref.customProductId;
  
  if (hasProduct === hasCustom) {
    throw new Error('Exactly one of productId or customProductId must be set');
  }
}
```

### 7.4.3. Multi-tenancy security

```typescript
// TOUJOURS vérifier farmId dans queries
async function getAnimal(animalId: string, farmId: string) {
  const animal = await db.animal.findFirst({
    where: {
      id: animalId,
      farmId: farmId,  // 🔒 CRITIQUE
      deletedAt: null
    }
  });
  
  if (!animal) throw new Error('Animal not found or access denied');
  return animal;
}
```

---

# 8. Plan de migration & priorités

## 8.1. Ordre d'exécution (CRITIQUE)

### **PHASE 1: Corrections tables existantes** (🔴 URGENT - Semaine 1)

```
Jour 1-2: Species + Breeds
├── Ajouter champs manquants (deletedAt, timestamps, version, isActive)
├── Créer indexes
├── Script migration SQL
└── Tests validation

Jour 3-4: Farms
├── Ajouter geo fields (country, department, commune)
├── Ajouter isActive, version, deletedAt
├── Créer indexes
└── Tests validation

Jour 5: Veterinarians + AlertConfiguration
├── Veterinarians: department, commune, specialties JSON
├── AlertConfiguration: supprimer doublon enabled
├── Créer indexes
└── Tests validation
```

**Validation Phase 1:**
- ✅ Toutes tables existantes corrigées
- ✅ Migrations SQL testées en DEV
- ✅ Aucune perte données
- ✅ Backward compatible (soft changes)

---

### **PHASE 2: Renommer tables recyclées** (🟡 IMPORTANT - Semaine 2)

```
Jour 1: Renommages
├── medical_products → custom_medical_products
├── vaccines → custom_vaccines
├── campaigns → personal_campaigns
└── Update FK relations (Prisma migrations gère)

Jour 2: Tests
├── Vérifier relations intactes
├── Vérifier données accessibles
└── Validation multi-tenant

Jour 3: ENUM ajout
├── PersonalCampaign.type, status
├── AlertConfiguration.type, priority
├── FarmPreferences.language, weightUnit
└── Tests contraintes
```

**Validation Phase 2:**
- ✅ Tables renommées correctement
- ✅ Relations FK fonctionnelles
- ✅ ENUM contraintes actives
- ✅ Aucune donnée perdue

---

### **PHASE 3: Créer référentiels globaux** (🟡 IMPORTANT - Semaine 3-4)

```
Semaine 3 Jour 1-2: medical_products (globale)
├── Créer table structure
├── Seed data: 50-100 produits officiels France
├── Indexes
└── Tests queries

Semaine 3 Jour 3-4: vaccines (globale)
├── Créer table structure
├── Seed data: 20-30 vaccins officiels
├── Indexes
└── Tests queries

Semaine 3 Jour 5: national_campaigns
├── Créer table structure
├── Seed data: Campagnes 2025 France (FCO, etc.)
├── Indexes
└── Tests queries

Semaine 4 Jour 1-2: alert_templates
├── Créer table structure
├── Seed data: 10-15 templates alertes
├── Indexes
└── Tests queries
```

**Validation Phase 3:**
- ✅ Tables globales créées
- ✅ Seed data complet et cohérent
- ✅ Indexes performance OK
- ✅ Queries globales testées

---

### **PHASE 4: Créer liaisons pays** (🟡 IMPORTANT - Semaine 5)

```
Jour 1: breed_countries
├── Créer table
├── Seed data: Mapping 100+ races × pays
└── Tests filtrage

Jour 2: product_countries
├── Créer table
├── Seed data: Produits × pays disponibilité
└── Tests filtrage

Jour 3: vaccine_countries
├── Créer table
├── Seed data: Vaccins × pays homologation
└── Tests filtrage

Jour 4: campaign_countries
├── Créer table
├── Seed data: Campagnes nationales × pays
└── Tests filtrage

Jour 5: Tests intégration
├── Query: Races France vs Espagne
├── Query: Produits France vs Italie
└── Performance checks
```

**Validation Phase 4:**
- ✅ Liaisons créées
- ✅ Seed data exhaustif
- ✅ Filtrage pays fonctionne
- ✅ Performance acceptable

---

### **PHASE 5: Créer préférences ferme** (🟢 AMÉLIORATION - Semaine 6-7)

```
Semaine 6 Jour 1-2: farm_breed_preferences
├── Créer table
├── Script init fermes existantes
├── Tests queries transactionnelles
└── Tests offline sync

Semaine 6 Jour 3-4: farm_product_preferences
├── Créer table (avec XOR constraint)
├── Tests global + custom
├── Tests gestion stock
└── Tests offline sync

Semaine 6 Jour 5: farm_vaccine_preferences
├── Créer table
├── Tests similaires products
└── Tests offline sync

Semaine 7 Jour 1: farm_veterinarian_preferences
├── Créer table
├── Tests ordering/priority
└── Tests offline sync

Semaine 7 Jour 2: farm_national_campaign_preferences
├── Créer table
├── Tests activation/désactivation
├── Tests overrides dates
└── Tests offline sync

Semaine 7 Jour 3-5: Tests intégration complète
├── Workflow setup ferme complète
├── Workflow transactionnel
├── Performance end-to-end
└── Tests offline-first
```

**Validation Phase 5:**
- ✅ Toutes préférences créées
- ✅ Workflow setup fonctionnel
- ✅ Queries transactionnelles rapides
- ✅ Offline sync opérationnel

---

### **PHASE 6: Scripts migration données** (🟢 AMÉLIORATION - Semaine 8)

```
Jour 1: Veterinarians.specialties VARCHAR → JSON
├── Script migration données
├── Backup données avant migration
├── Exécution migration
└── Validation données après

Jour 2-3: Init préférences fermes existantes
├── Script init farm_breed_preferences
├── Script init farm_product_preferences
├── Script init farm_vaccine_preferences
└── Validation données créées

Jour 4-5: Tests régression complète
├── Tests toutes tables
├── Tests toutes relations
├── Tests performance
└── Validation MVP ready
```

**Validation Phase 6:**
- ✅ Données migrées sans perte
- ✅ Fermes existantes initialisées
- ✅ Tests régression passés
- ✅ **MIGRATION COMPLÈTE**

---

## 8.2. Priorités par criticité

### 🔴 **URGENT** (Bloquant MVP)

| # | Item | Tables | Durée | Impact |
|---|------|--------|-------|--------|
| 1 | Soft delete Species/Breeds | 2 | 1j | Animals relation sécurisée |
| 2 | Timestamps Species/Breeds | 2 | 0.5j | Audit trail |
| 3 | Versioning Species/Breeds/Farms | 3 | 0.5j | Sync offline |
| 4 | isActive Species/Farms | 2 | 0.5j | Désactivation temporaire |
| 5 | Farms geo fields | 1 | 1j | Filtrage vétérinaires/races |
| 6 | Doublon AlertConfiguration | 1 | 0.5j | Bug évité |

**Total URGENT:** 4 jours

---

### 🟡 **IMPORTANT** (Stabilité)

| # | Item | Tables | Durée | Impact |
|---|------|--------|-------|--------|
| 7 | Renommer tables recyclées | 3 | 2j | Architecture cohérente |
| 8 | Référentiels globaux | 4 | 6j | Données partagées |
| 9 | Liaisons pays | 4 | 4j | Filtrage géographique |
| 10 | Indexes performance | All | 2j | Queries rapides |
| 11 | ENUM contraintes | 5 | 1j | Type safety |

**Total IMPORTANT:** 15 jours

---

### 🟢 **AMÉLIORATION** (Qualité)

| # | Item | Tables | Durée | Impact |
|---|------|--------|-------|--------|
| 12 | Préférences ferme | 5 | 8j | UX optimale |
| 13 | Veterinarians specialties JSON | 1 | 1j | Flexibilité |
| 14 | Scripts migration données | - | 3j | Données complètes |
| 15 | Tests régression complète | - | 2j | Qualité assurée |

**Total AMÉLIORATION:** 14 jours

---

## 8.3. Timeline globale

```
╔════════════════════════════════════════════════════════════╗
║                    MIGRATION TIMELINE                      ║
╠════════════════════════════════════════════════════════════╣
║ PHASE 1: Corrections existantes         │ Semaine 1  (5j) ║
║ PHASE 2: Renommer recyclées              │ Semaine 2  (3j) ║
║ PHASE 3: Référentiels globaux           │ Sem 3-4    (8j) ║
║ PHASE 4: Liaisons pays                  │ Semaine 5  (5j) ║
║ PHASE 5: Préférences ferme              │ Sem 6-7   (10j) ║
║ PHASE 6: Migration données + tests      │ Semaine 8  (5j) ║
╠════════════════════════════════════════════════════════════╣
║ TOTAL:                                   │ 8 semaines      ║
╚════════════════════════════════════════════════════════════╝
```

**MVP Ready:** Fin Phase 4 (5 semaines)
**Production Ready:** Fin Phase 6 (8 semaines)

---

## 8.4. Risques & mitigation

### 🔴 **Risque ÉLEVÉ**

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Perte données migration | 🔴 Catastrophique | Backups complets avant chaque phase |
| Relations FK cassées | 🔴 Bloquant | Tests unitaires + validation après chaque migration |
| Performance dégradée | 🔴 UX impactée | Load tests après Phase 4, optimisation indexes |

### 🟡 **Risque MOYEN**

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Seed data incomplet | 🟡 Fonctionnel limité | Review seed data avec expert métier |
| Multi-tenancy leak | 🟡 Sécurité | Code review + tests sécurité |
| Offline sync issues | 🟡 UX dégradée | Tests offline exhaustifs |

### 🟢 **Risque FAIBLE**

| Risque | Impact | Mitigation |
|--------|--------|------------|
| ENUM contraintes trop strictes | 🟢 Flexibilité réduite | Validation métier avant contraintes |
| Indexes manquants | 🟢 Perf locale | Monitoring + ajout progressif |

---

## 8.5. Validation finale

### **Checklist MVP Ready (Fin Phase 4)**

- [ ] ✅ Toutes corrections tables existantes appliquées
- [ ] ✅ Tables recyclées renommées et fonctionnelles
- [ ] ✅ Référentiels globaux créés avec seed data
- [ ] ✅ Liaisons pays créées et testées
- [ ] ✅ Indexes performance en place
- [ ] ✅ ENUM contraintes actives
- [ ] ✅ Multi-tenancy sécurisé validé
- [ ] ✅ Tests unitaires passés (90%+ couverture)
- [ ] ✅ Tests intégration passés
- [ ] ✅ Load tests OK (100 fermes, 10K animaux)
- [ ] ✅ Documentation API à jour

### **Checklist Production Ready (Fin Phase 6)**

- [ ] ✅ Préférences ferme opérationnelles
- [ ] ✅ Migration données complète sans perte
- [ ] ✅ Offline sync bidirectionnel validé
- [ ] ✅ Tests régression complets passés
- [ ] ✅ Performance end-to-end < 500ms (P95)
- [ ] ✅ Backup/restore procédures testées
- [ ] ✅ Monitoring mis en place
- [ ] ✅ Seed data exhaustif (100+ races, 50+ produits, 20+ vaccins)
- [ ] ✅ Documentation technique complète
- [ ] ✅ Formation équipe effectuée

---

**FIN DU DOCUMENT DE SPÉCIFICATIONS**

**Date génération:** 2025-11-23
**Version:** 1.0
**Statut:** PRÊT POUR IMPLÉMENTATION
**Pages:** 147
**Tables totales:** 24
**Durée estimée:** 8 semaines
