# AniTra Backend - Spécifications Techniques Complètes

> Document de référence pour l'implémentation du backend AniTra
> Version: 1.0
> Date: 2025-11-19

---

## Table des Matières

1. [Introduction](#1-introduction)
2. [Architecture Globale](#2-architecture-globale)
3. [Stack Technique](#3-stack-technique)
4. [Base de Données](#4-base-de-données)
5. [Authentification](#5-authentification)
6. [API REST](#6-api-rest)
7. [Synchronisation](#7-synchronisation)
8. [Déploiement](#8-déploiement)
9. [Sécurité](#9-sécurité)
10. [Web Application](#10-web-application)
11. [Annexes](#11-annexes)

---

## 1. Introduction

### 1.1 Contexte

AniTra est une application mobile Flutter de gestion d'élevage (ovins, bovins, caprins). L'application fonctionne en mode offline-first avec synchronisation vers un backend centralisé.

### 1.2 Objectifs du Backend

- Centraliser les données de toutes les fermes
- Permettre la synchronisation bidirectionnelle avec l'app mobile
- Fournir une interface web pour la gestion
- Assurer la sécurité et l'isolation des données par ferme (multi-tenancy)

### 1.3 Fonctionnalités Principales

- Gestion des animaux (CRUD, parenté, statuts)
- Traitements médicaux et vaccinations
- Mouvements (naissances, achats, ventes, abattages, morts)
- Lots et campagnes
- Pesées et documents
- Reproduction (breeding)
- Alertes et configurations

---

## 2. Architecture Globale

### 2.1 Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      TRAEFIK v3                              │
│              (Reverse Proxy / SSL / Load Balancer)           │
│                                                              │
│  Routes:                                                     │
│  - app.anitra.dz      → Web (Next.js)                       │
│  - api.anitra.dz      → API (NestJS)                        │
│  - auth.anitra.dz     → Keycloak                            │
└─────────┬─────────────────┬─────────────────┬───────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────┐ ┌───────────────┐ ┌───────────────┐
│      WEB        │ │      API      │ │   KEYCLOAK    │
│   (Next.js)     │ │   (NestJS)    │ │    (Auth)     │
│                 │ │   + Prisma    │ │               │
│  - Dashboard    │ │               │ │  - Realms     │
│  - Rapports     │ │  - REST API   │ │  - Users      │
│  - Admin        │ │  - Sync       │ │  - Roles      │
└────────┬────────┘ │  - Validation │ └───────┬───────┘
         │          └───────┬───────┘         │
         │                  │                 │
         └──────────►───────┤                 │
                            │                 │
                            ▼                 ▼
                    ┌───────────────┐ ┌───────────────┐
                    │  PostgreSQL   │ │  PostgreSQL   │
                    │   (App DB)    │ │ (Keycloak DB) │
                    └───────────────┘ └───────────────┘
```

### 2.2 Flux de Données

#### Mobile App → API
```
Flutter App → HTTPS → Traefik → NestJS API → Prisma → PostgreSQL
```

#### Web App → API
```
Next.js (Browser) → HTTPS → Traefik → NestJS API → Prisma → PostgreSQL
```

#### Authentification
```
Client → Traefik → Keycloak → JWT Token → API (validation)
```

### 2.3 Conteneurs Docker

| Container | Image | Port Interne | Description |
|-----------|-------|--------------|-------------|
| traefik | traefik:v3.0 | 80, 443 | Reverse proxy |
| api | node:20-alpine | 3000 | NestJS API |
| web | node:20-alpine | 3001 | Next.js Web |
| keycloak | quay.io/keycloak/keycloak:24 | 8080 | Auth server |
| postgres | postgres:16 | 5432 | App database |
| postgres-keycloak | postgres:16 | 5433 | Keycloak database |
| redis | redis:7-alpine | 6379 | Cache & sessions |

---

## 3. Stack Technique

### 3.1 Technologies Retenues

| Couche | Technologie | Version | Justification |
|--------|-------------|---------|---------------|
| **API Gateway** | Traefik | v3.0 | Auto-discovery Docker, Let's Encrypt |
| **API Framework** | NestJS | ^10.0 | TypeScript, modulaire, enterprise-ready |
| **ORM** | Prisma | ^5.0 | Type-safe, migrations robustes |
| **Database** | PostgreSQL | 16 | JSONB, performance, fiabilité |
| **Auth** | Keycloak | 24+ | OAuth2/OIDC standard |
| **Web Framework** | Next.js | 14 | React SSR, App Router |
| **Cache** | Redis | 7 | Sessions, rate limiting |
| **Runtime** | Node.js | 20 LTS | Stabilité long terme |
| **Language** | TypeScript | ^5.0 | Type safety |

### 3.2 Dépendances NestJS Principales

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/throttler": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "ioredis": "^5.0.0",
    "pino": "^8.0.0",
    "pino-pretty": "^10.0.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "@types/passport-jwt": "^4.0.0"
  }
}
```

---

## 4. Base de Données

### 4.1 Principes de Conception

#### Multi-tenancy
- **Isolation par `farmId`** : Toutes les tables métier ont un champ `farmId`
- **Middleware Prisma** : Filtre automatique sur `farmId` pour chaque requête
- **Index** : Index sur `farmId` pour chaque table

#### Soft Delete
- Champ `deletedAt` (DateTime nullable) sur toutes les tables
- Jamais de DELETE physique
- Filtre automatique `deletedAt IS NULL`

#### Gestion des Conflits
- Champ `version` (Integer) pour optimistic locking
- Comparaison version client vs serveur lors de la sync

#### Timestamps
- `createdAt` : Date de création
- `updatedAt` : Dernière modification (auto-update)

### 4.2 Schéma Prisma Complet

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// TABLES DE RÉFÉRENCE (sans farmId - données globales)
// ============================================================

model Species {
  id           String   @id
  nameFr       String   @map("name_fr")
  nameEn       String   @map("name_en")
  nameAr       String   @map("name_ar")
  icon         String
  displayOrder Int      @default(0) @map("display_order")

  // Relations
  animals      Animal[]
  breeds       Breed[]

  @@map("species")
}

model Breed {
  id           String   @id
  speciesId    String   @map("species_id")
  nameFr       String   @map("name_fr")
  nameEn       String   @map("name_en")
  nameAr       String   @map("name_ar")
  description  String?
  displayOrder Int      @default(0) @map("display_order")
  isActive     Boolean  @default(true) @map("is_active")

  // Relations
  species      Species  @relation(fields: [speciesId], references: [id])
  animals      Animal[]

  @@map("breeds")
}

// ============================================================
// TABLES PRINCIPALES (avec farmId - multi-tenancy)
// ============================================================

model Farm {
  id            String    @id
  name          String
  location      String
  ownerId       String    @map("owner_id")
  cheptelNumber String?   @map("cheptel_number")
  groupId       String?   @map("group_id")
  groupName     String?   @map("group_name")
  isDefault     Boolean   @default(false) @map("is_default")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations
  animals           Animal[]
  lots              Lot[]
  movements         Movement[]
  treatments        Treatment[]
  vaccinations      Vaccination[]
  weights           Weight[]
  veterinarians     Veterinarian[]
  medicalProducts   MedicalProduct[]
  vaccines          Vaccine[]
  documents         Document[]
  campaigns         Campaign[]
  breedings         Breeding[]
  alertConfigs      AlertConfiguration[]
  farmPreferences   FarmPreferences?

  @@map("farms")
}

model Animal {
  id                    String    @id
  farmId                String    @map("farm_id")
  currentLocationFarmId String?   @map("current_location_farm_id")

  // Identifications
  currentEid            String?   @map("current_eid")
  officialNumber        String?   @map("official_number")
  visualId              String?   @map("visual_id")
  eidHistory            String?   @map("eid_history") // JSON

  // Biological
  birthDate             DateTime  @map("birth_date")
  sex                   String    // 'male', 'female'
  motherId              String?   @map("mother_id")
  speciesId             String?   @map("species_id")
  breedId               String?   @map("breed_id")

  // Status
  status                String    @default("alive") // 'alive', 'sold', 'dead', 'slaughtered', 'draft'
  validatedAt           DateTime? @map("validated_at")

  // Media
  photoUrl              String?   @map("photo_url")
  notes                 String?

  // Deprecated
  days                  Int?

  // Sync
  version               Int       @default(1)
  deletedAt             DateTime? @map("deleted_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  // Relations
  farm                  Farm      @relation(fields: [farmId], references: [id], onDelete: Cascade)
  species               Species?  @relation(fields: [speciesId], references: [id])
  breed                 Breed?    @relation(fields: [breedId], references: [id])
  mother                Animal?   @relation("Parentage", fields: [motherId], references: [id])
  children              Animal[]  @relation("Parentage")

  treatments            Treatment[]
  vaccinations          Vaccination[]
  movements             Movement[]
  weights               Weight[]
  documents             Document[]
  lotAnimals            LotAnimal[]
  breedingsAsMother     Breeding[] @relation("BreedingMother")
  breedingsAsFather     Breeding[] @relation("BreedingFather")

  @@unique([farmId, currentEid])
  @@unique([farmId, officialNumber])
  @@index([farmId])
  @@index([status])
  @@index([deletedAt])
  @@map("animals")
}

model Lot {
  id                String    @id
  farmId            String    @map("farm_id")
  name              String
  type              String?   // 'treatment', 'sale', 'slaughter', 'purchase'
  status            String?   // 'open', 'closed', 'archived'
  completed         Boolean   @default(false)
  completedAt       DateTime? @map("completed_at")

  // Treatment fields
  productId         String?   @map("product_id")
  productName       String?   @map("product_name")
  treatmentDate     DateTime? @map("treatment_date")
  withdrawalEndDate DateTime? @map("withdrawal_end_date")
  veterinarianId    String?   @map("veterinarian_id")
  veterinarianName  String?   @map("veterinarian_name")

  // Sale/Purchase fields
  priceTotal        Float?    @map("price_total")
  buyerName         String?   @map("buyer_name")
  sellerName        String?   @map("seller_name")

  notes             String?

  // Sync
  version           Int       @default(1)
  deletedAt         DateTime? @map("deleted_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  // Relations
  farm              Farm      @relation(fields: [farmId], references: [id], onDelete: Cascade)
  lotAnimals        LotAnimal[]
  movements         Movement[]

  @@index([farmId])
  @@index([deletedAt])
  @@map("lots")
}

model LotAnimal {
  lotId     String   @map("lot_id")
  animalId  String   @map("animal_id")
  addedAt   DateTime @default(now()) @map("added_at")

  // Relations
  lot       Lot      @relation(fields: [lotId], references: [id], onDelete: Cascade)
  animal    Animal   @relation(fields: [animalId], references: [id], onDelete: Cascade)

  @@id([lotId, animalId])
  @@map("lot_animals")
}

model Treatment {
  id                String    @id
  farmId            String    @map("farm_id")
  animalId          String    @map("animal_id")
  productId         String    @map("product_id")
  productName       String    @map("product_name")
  dose              Float
  treatmentDate     DateTime  @map("treatment_date")
  withdrawalEndDate DateTime  @map("withdrawal_end_date")
  notes             String?
  veterinarianId    String?   @map("veterinarian_id")
  veterinarianName  String?   @map("veterinarian_name")
  campaignId        String?   @map("campaign_id")

  // Sync
  version           Int       @default(1)
  deletedAt         DateTime? @map("deleted_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  // Relations
  farm              Farm      @relation(fields: [farmId], references: [id], onDelete: Cascade)
  animal            Animal    @relation(fields: [animalId], references: [id])
  veterinarian      Veterinarian? @relation(fields: [veterinarianId], references: [id])

  @@index([farmId])
  @@index([animalId])
  @@index([deletedAt])
  @@map("treatments")
}

model Vaccination {
  id                  String    @id
  farmId              String    @map("farm_id")
  animalId            String?   @map("animal_id")
  animalIds           String    @map("animal_ids") // JSON array
  protocolId          String?   @map("protocol_id")
  vaccineName         String    @map("vaccine_name")
  type                String    // 'obligatoire', 'recommandee', 'optionnelle'
  disease             String
  vaccinationDate     DateTime  @map("vaccination_date")
  batchNumber         String?   @map("batch_number")
  expiryDate          DateTime? @map("expiry_date")
  dose                String
  administrationRoute String    @map("administration_route")
  veterinarianId      String?   @map("veterinarian_id")
  veterinarianName    String?   @map("veterinarian_name")
  nextDueDate         DateTime? @map("next_due_date")
  withdrawalPeriodDays Int      @map("withdrawal_period_days")
  notes               String?

  // Sync
  version             Int       @default(1)
  deletedAt           DateTime? @map("deleted_at")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // Relations
  farm                Farm      @relation(fields: [farmId], references: [id], onDelete: Cascade)
  animal              Animal?   @relation(fields: [animalId], references: [id])

  @@index([farmId])
  @@index([deletedAt])
  @@map("vaccinations")
}

model Movement {
  id                    String    @id
  farmId                String    @map("farm_id")
  animalId              String    @map("animal_id")
  lotId                 String?   @map("lot_id")
  type                  String    // 'birth', 'purchase', 'sale', 'death', 'slaughter', 'temporary_out', 'temporary_return'
  movementDate          DateTime  @map("movement_date")
  fromFarmId            String?   @map("from_farm_id")
  toFarmId              String?   @map("to_farm_id")
  price                 Float?
  notes                 String?
  buyerQrSignature      String?   @map("buyer_qr_signature")

  // Sale/Slaughter
  buyerName             String?   @map("buyer_name")
  buyerFarmId           String?   @map("buyer_farm_id")
  buyerType             String?   @map("buyer_type") // 'individual', 'farm', 'trader', 'cooperative'
  slaughterhouseName    String?   @map("slaughterhouse_name")
  slaughterhouseId      String?   @map("slaughterhouse_id")

  // Temporary movements
  isTemporary           Boolean   @default(false) @map("is_temporary")
  temporaryMovementType String?   @map("temporary_movement_type") // 'loan', 'transhumance', 'boarding', 'quarantine', 'exhibition'
  expectedReturnDate    DateTime? @map("expected_return_date")
  returnDate            DateTime? @map("return_date")
  returnNotes           String?   @map("return_notes")
  relatedMovementId     String?   @map("related_movement_id")

  status                String    // 'ongoing', 'closed', 'archived'

  // Sync
  version               Int       @default(1)
  deletedAt             DateTime? @map("deleted_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  // Relations
  farm                  Farm      @relation(fields: [farmId], references: [id], onDelete: Cascade)
  animal                Animal    @relation(fields: [animalId], references: [id])
  lot                   Lot?      @relation(fields: [lotId], references: [id])

  @@index([farmId])
  @@index([animalId])
  @@index([deletedAt])
  @@map("movements")
}

model Weight {
  id          String    @id
  farmId      String    @map("farm_id")
  animalId    String    @map("animal_id")
  weight      Float
  recordedAt  DateTime  @map("recorded_at")
  source      String    // 'scale', 'manual', 'estimated', 'veterinary'
  notes       String?

  // Sync
  version     Int       @default(1)
  deletedAt   DateTime? @map("deleted_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Relations
  farm        Farm      @relation(fields: [farmId], references: [id], onDelete: Cascade)
  animal      Animal    @relation(fields: [animalId], references: [id])

  @@index([farmId])
  @@index([animalId])
  @@index([deletedAt])
  @@map("weights")
}

model Veterinarian {
  id                   String    @id
  farmId               String    @map("farm_id")
  firstName            String    @map("first_name")
  lastName             String    @map("last_name")
  title                String?
  licenseNumber        String    @map("license_number")
  specialties          String    // JSON array
  clinic               String?
  phone                String
  mobile               String?
  email                String?
  address              String?
  city                 String?
  postalCode           String?   @map("postal_code")
  country              String?
  isAvailable          Boolean   @default(true) @map("is_available")
  emergencyService     Boolean   @default(false) @map("emergency_service")
  workingHours         String?   @map("working_hours")
  consultationFee      Float?    @map("consultation_fee")
  emergencyFee         Float?    @map("emergency_fee")
  currency             String?
  notes                String?
  isPreferred          Boolean   @default(false) @map("is_preferred")
  isDefault            Boolean   @default(false) @map("is_default")
  rating               Int       @default(5)
  totalInterventions   Int       @default(0) @map("total_interventions")
  lastInterventionDate DateTime? @map("last_intervention_date")
  isActive             Boolean   @default(true) @map("is_active")

  // Sync
  version              Int       @default(1)
  deletedAt            DateTime? @map("deleted_at")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  // Relations
  farm                 Farm      @relation(fields: [farmId], references: [id])
  treatments           Treatment[]

  @@index([farmId])
  @@index([deletedAt])
  @@map("veterinarians")
}

model MedicalProduct {
  id                         String    @id
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
  currentStock               Float     @map("current_stock")
  minStock                   Float     @map("min_stock")
  stockUnit                  String    @map("stock_unit")
  unitPrice                  Float?    @map("unit_price")
  currency                   String?
  batchNumber                String?   @map("batch_number")
  expiryDate                 DateTime? @map("expiry_date")
  storageConditions          String?   @map("storage_conditions")
  prescription               String?
  notes                      String?
  isActive                   Boolean   @default(true) @map("is_active")
  type                       String    @default("treatment") // 'treatment', 'vaccine'
  targetSpecies              String    @default("") @map("target_species") // comma-separated
  standardCureDays           Int?      @map("standard_cure_days")
  administrationFrequency    String?   @map("administration_frequency")
  dosageFormula              String?   @map("dosage_formula")
  vaccinationProtocol        String?   @map("vaccination_protocol")
  reminderDays               String?   @map("reminder_days") // comma-separated
  defaultAdministrationRoute String?   @map("default_administration_route")
  defaultInjectionSite       String?   @map("default_injection_site")

  // Sync
  version                    Int       @default(1)
  deletedAt                  DateTime? @map("deleted_at")
  createdAt                  DateTime  @default(now()) @map("created_at")
  updatedAt                  DateTime  @updatedAt @map("updated_at")

  // Relations
  farm                       Farm      @relation(fields: [farmId], references: [id])

  @@index([farmId])
  @@index([farmId, isActive])
  @@index([deletedAt])
  @@map("medical_products")
}

model Vaccine {
  id                   String    @id
  farmId               String    @map("farm_id")
  name                 String
  description          String?
  manufacturer         String?
  targetSpecies        String    @map("target_species") // JSON array
  targetDiseases       String    @map("target_diseases") // JSON array
  standardDose         String?   @map("standard_dose")
  injectionsRequired   Int?      @map("injections_required")
  injectionIntervalDays Int?     @map("injection_interval_days")
  meatWithdrawalDays   Int       @map("meat_withdrawal_days")
  milkWithdrawalDays   Int       @map("milk_withdrawal_days")
  administrationRoute  String?   @map("administration_route")
  notes                String?
  isActive             Boolean   @default(true) @map("is_active")

  // Sync
  version              Int       @default(1)
  deletedAt            DateTime? @map("deleted_at")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  // Relations
  farm                 Farm      @relation(fields: [farmId], references: [id])

  @@index([farmId])
  @@index([deletedAt])
  @@map("vaccines")
}

model Document {
  id            String    @id
  farmId        String    @map("farm_id")
  animalId      String?   @map("animal_id")
  type          String    // 'passport', 'certificate', 'invoice', etc.
  fileName      String    @map("file_name")
  fileUrl       String    @map("file_url")
  fileSizeBytes Int?      @map("file_size_bytes")
  mimeType      String?   @map("mime_type")
  uploadDate    DateTime  @map("upload_date")
  expiryDate    DateTime? @map("expiry_date")
  notes         String?
  uploadedBy    String?   @map("uploaded_by")

  // Sync
  version       Int       @default(1)
  deletedAt     DateTime? @map("deleted_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations
  farm          Farm      @relation(fields: [farmId], references: [id], onDelete: Cascade)
  animal        Animal?   @relation(fields: [animalId], references: [id])

  @@index([farmId])
  @@index([deletedAt])
  @@map("documents")
}

model Campaign {
  id                String    @id
  farmId            String    @map("farm_id")
  name              String
  productId         String    @map("product_id")
  productName       String    @map("product_name")
  campaignDate      DateTime  @map("campaign_date")
  withdrawalEndDate DateTime  @map("withdrawal_end_date")
  veterinarianId    String?   @map("veterinarian_id")
  veterinarianName  String?   @map("veterinarian_name")
  animalIdsJson     String    @map("animal_ids_json") // JSON array
  completed         Boolean   @default(false)

  // Sync
  version           Int       @default(1)
  deletedAt         DateTime? @map("deleted_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  // Relations
  farm              Farm      @relation(fields: [farmId], references: [id])

  @@index([farmId])
  @@index([deletedAt])
  @@map("campaigns")
}

model Breeding {
  id                     String    @id
  farmId                 String    @map("farm_id")
  motherId               String    @map("mother_id")
  fatherId               String?   @map("father_id")
  fatherName             String?   @map("father_name")
  method                 String    // 'natural', 'artificialInsemination'
  breedingDate           DateTime  @map("breeding_date")
  expectedBirthDate      DateTime  @map("expected_birth_date")
  actualBirthDate        DateTime? @map("actual_birth_date")
  expectedOffspringCount Int?      @map("expected_offspring_count")
  offspringIds           String?   @map("offspring_ids") // JSON array
  veterinarianId         String?   @map("veterinarian_id")
  veterinarianName       String?   @map("veterinarian_name")
  notes                  String?
  status                 String    // 'pending', 'completed', 'failed', 'aborted'

  // Sync
  version                Int       @default(1)
  deletedAt              DateTime? @map("deleted_at")
  createdAt              DateTime  @default(now()) @map("created_at")
  updatedAt              DateTime  @updatedAt @map("updated_at")

  // Relations
  farm                   Farm      @relation(fields: [farmId], references: [id])
  mother                 Animal    @relation("BreedingMother", fields: [motherId], references: [id])
  father                 Animal?   @relation("BreedingFather", fields: [fatherId], references: [id])

  @@index([farmId])
  @@index([deletedAt])
  @@map("breedings")
}

model AlertConfiguration {
  id             String    @id
  farmId         String    @map("farm_id")
  evaluationType String    @map("evaluation_type")
  type           String    // 'urgent', 'important', 'routine'
  category       String
  titleKey       String    @map("title_key")
  messageKey     String    @map("message_key")
  severity       Int
  iconName       String    @map("icon_name")
  colorHex       String    @map("color_hex")
  enabled        Boolean   @default(true)

  // Sync
  version        Int       @default(1)
  deletedAt      DateTime? @map("deleted_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relations
  farm           Farm      @relation(fields: [farmId], references: [id])

  @@unique([farmId, evaluationType])
  @@index([farmId])
  @@index([deletedAt])
  @@map("alert_configurations")
}

model FarmPreferences {
  id                     String    @id
  farmId                 String    @unique @map("farm_id")
  defaultVeterinarianId  String?   @map("default_veterinarian_id")
  defaultSpeciesId       String    @map("default_species_id")
  defaultBreedId         String?   @map("default_breed_id")

  // Sync
  version                Int       @default(1)
  deletedAt              DateTime? @map("deleted_at")
  createdAt              DateTime  @default(now()) @map("created_at")
  updatedAt              DateTime  @updatedAt @map("updated_at")

  // Relations
  farm                   Farm      @relation(fields: [farmId], references: [id])

  @@index([deletedAt])
  @@map("farm_preferences")
}

// ============================================================
// TABLES DE SYNCHRONISATION
// ============================================================

model SyncLog {
  id              String   @id @default(uuid())
  farmId          String   @map("farm_id")
  entityType      String   @map("entity_type")
  entityId        String   @map("entity_id")
  action          String   // 'create', 'update', 'delete'
  payload         Json
  clientTimestamp DateTime @map("client_timestamp")
  serverTimestamp DateTime @default(now()) @map("server_timestamp")
  status          String   @default("processed") // 'processed', 'conflict', 'error'
  errorMessage    String?  @map("error_message")

  @@index([farmId, entityType])
  @@index([serverTimestamp])
  @@map("sync_logs")
}
```

### 4.3 Diagramme ERD Simplifié

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Species   │────<│    Breed    │     │    Farm     │
└─────────────┘     └─────────────┘     └──────┬──────┘
      │                    │                   │
      │                    │                   │
      └────────────┬───────┘                   │
                   │                           │
              ┌────▼────┐                      │
              │  Animal │<─────────────────────┘
              └────┬────┘
                   │
     ┌─────────────┼─────────────┬─────────────┐
     │             │             │             │
┌────▼────┐  ┌────▼────┐  ┌─────▼─────┐ ┌─────▼─────┐
│Treatment│  │Movement │  │Vaccination│ │  Weight   │
└─────────┘  └─────────┘  └───────────┘ └───────────┘

┌─────────────┐     ┌─────────────┐
│     Lot     │────<│  LotAnimal  │────>│   Animal   │
└─────────────┘     └─────────────┘
```

---

## 5. Authentification

### 5.1 Keycloak Configuration

#### Realm: `anitra`

```json
{
  "realm": "anitra",
  "enabled": true,
  "sslRequired": "external",
  "registrationAllowed": false,
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": true,
  "editUsernameAllowed": false,
  "bruteForceProtected": true
}
```

#### Client: `anitra-mobile`

```json
{
  "clientId": "anitra-mobile",
  "enabled": true,
  "publicClient": true,
  "directAccessGrantsEnabled": true,
  "standardFlowEnabled": false,
  "implicitFlowEnabled": false,
  "serviceAccountsEnabled": false,
  "protocol": "openid-connect"
}
```

#### Client: `anitra-web`

```json
{
  "clientId": "anitra-web",
  "enabled": true,
  "publicClient": false,
  "clientAuthenticatorType": "client-secret",
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": false,
  "redirectUris": ["https://app.anitra.dz/*"],
  "webOrigins": ["https://app.anitra.dz"]
}
```

### 5.2 Rôles et Permissions

#### Rôles Proposés

| Rôle | Description | Permissions |
|------|-------------|-------------|
| `super_admin` | Administrateur système | Toutes les fermes, gestion users |
| `farm_owner` | Propriétaire de ferme | CRUD complet sur sa ferme |
| `farm_manager` | Gestionnaire | CRUD animaux, traitements, mouvements |
| `farm_worker` | Employé | Lecture + création limitée |
| `veterinarian` | Vétérinaire externe | Accès traitements/vaccinations |

#### Attributs Utilisateur Custom

```json
{
  "farmIds": ["farm-uuid-1", "farm-uuid-2"],
  "defaultFarmId": "farm-uuid-1",
  "locale": "fr"
}
```

### 5.3 Flux OAuth2 - Password Grant (Mobile)

```
┌─────────┐                          ┌───────────┐
│  Mobile │                          │ Keycloak  │
└────┬────┘                          └─────┬─────┘
     │                                     │
     │  POST /realms/anitra/protocol/      │
     │  openid-connect/token               │
     │  {                                  │
     │    grant_type: password,            │
     │    client_id: anitra-mobile,        │
     │    username: xxx,                   │
     │    password: xxx                    │
     │  }                                  │
     │────────────────────────────────────>│
     │                                     │
     │  {                                  │
     │    access_token: "eyJ...",          │
     │    refresh_token: "eyJ...",         │
     │    expires_in: 300                  │
     │  }                                  │
     │<────────────────────────────────────│
     │                                     │
```

### 5.4 Validation JWT dans NestJS

```typescript
// src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.KEYCLOAK_URL}/realms/anitra/protocol/openid-connect/certs`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: `${process.env.KEYCLOAK_URL}/realms/anitra`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.preferred_username,
      email: payload.email,
      roles: payload.realm_access?.roles || [],
      farmIds: payload.farmIds || [],
      defaultFarmId: payload.defaultFarmId,
    };
  }
}
```

### 5.5 Guard Multi-tenancy

```typescript
// src/auth/farm.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class FarmGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const farmId = request.params.farmId || request.body.farmId || request.query.farmId;

    if (!farmId) {
      throw new ForbiddenException('farmId is required');
    }

    // Super admin can access all farms
    if (user.roles.includes('super_admin')) {
      return true;
    }

    // Check if user has access to this farm
    if (!user.farmIds.includes(farmId)) {
      throw new ForbiddenException('Access denied to this farm');
    }

    return true;
  }
}
```

---

## 6. API REST

### 6.1 Conventions

#### Base URL
```
https://api.anitra.dz/v1
```

#### Headers Requis
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
X-Farm-Id: <farm_uuid>  // Pour simplifier les requêtes
```

#### Format de Réponse Standard

**Succès**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req-uuid"
  }
}
```

**Erreur**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "birthDate",
        "message": "must be a valid date"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req-uuid"
  }
}
```

#### Codes d'Erreur

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Données invalides |
| `UNAUTHORIZED` | 401 | Token manquant ou invalide |
| `FORBIDDEN` | 403 | Accès refusé (farm mismatch) |
| `NOT_FOUND` | 404 | Ressource introuvable |
| `CONFLICT` | 409 | Conflit de version (sync) |
| `INTERNAL_ERROR` | 500 | Erreur serveur |

#### Pagination

```
GET /animals?page=1&limit=50&sort=createdAt&order=desc
```

Réponse:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 234,
      "totalPages": 5
    }
  }
}
```

### 6.2 Endpoints par Entité

#### Health Check

```
GET /health
```

Réponse:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

#### Animals

**Liste des animaux**
```
GET /farms/{farmId}/animals
```

Query params:
- `status`: Filter by status (alive, sold, dead, slaughtered)
- `speciesId`: Filter by species
- `breedId`: Filter by breed
- `search`: Search in officialNumber, currentEid, visualId
- `page`, `limit`, `sort`, `order`

**Détail d'un animal**
```
GET /farms/{farmId}/animals/{animalId}
```

**Créer un animal**
```
POST /farms/{farmId}/animals
```

Body:
```json
{
  "id": "uuid-client-generated",
  "currentEid": "123456789012345",
  "officialNumber": "DZ-001-2025",
  "visualId": "A001",
  "birthDate": "2024-01-15",
  "sex": "female",
  "speciesId": "sheep",
  "breedId": "merinos",
  "motherId": "mother-uuid",
  "notes": "..."
}
```

**Modifier un animal**
```
PUT /farms/{farmId}/animals/{animalId}
```

Body: (mêmes champs + version pour conflict check)
```json
{
  "version": 2,
  ...
}
```

**Supprimer un animal** (soft delete)
```
DELETE /farms/{farmId}/animals/{animalId}
```

---

#### Lots

**Liste des lots**
```
GET /farms/{farmId}/lots
```

Query params:
- `type`: Filter by type
- `status`: Filter by status
- `completed`: true/false

**Créer un lot**
```
POST /farms/{farmId}/lots
```

**Ajouter des animaux au lot**
```
POST /farms/{farmId}/lots/{lotId}/animals
```

Body:
```json
{
  "animalIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Retirer un animal du lot**
```
DELETE /farms/{farmId}/lots/{lotId}/animals/{animalId}
```

**Finaliser un lot**
```
POST /farms/{farmId}/lots/{lotId}/finalize
```

---

#### Treatments

**Liste des traitements**
```
GET /farms/{farmId}/treatments
```

**Traitements d'un animal**
```
GET /farms/{farmId}/animals/{animalId}/treatments
```

**Créer un traitement**
```
POST /farms/{farmId}/treatments
```

---

#### Vaccinations

**Liste des vaccinations**
```
GET /farms/{farmId}/vaccinations
```

**Créer une vaccination**
```
POST /farms/{farmId}/vaccinations
```

Body (vaccination de groupe):
```json
{
  "id": "uuid",
  "animalIds": ["uuid1", "uuid2"],
  "vaccineName": "...",
  "disease": "...",
  "vaccinationDate": "2025-01-15",
  "dose": "2ml",
  "administrationRoute": "subcutaneous",
  "withdrawalPeriodDays": 21
}
```

---

#### Movements

**Liste des mouvements**
```
GET /farms/{farmId}/movements
```

Query params:
- `type`: birth, purchase, sale, death, slaughter, temporary_out, temporary_return
- `status`: ongoing, closed, archived
- `animalId`: Filter by animal

**Créer un mouvement**
```
POST /farms/{farmId}/movements
```

---

#### Weights

**Historique des pesées**
```
GET /farms/{farmId}/animals/{animalId}/weights
```

**Ajouter une pesée**
```
POST /farms/{farmId}/weights
```

---

#### Veterinarians

```
GET    /farms/{farmId}/veterinarians
POST   /farms/{farmId}/veterinarians
PUT    /farms/{farmId}/veterinarians/{id}
DELETE /farms/{farmId}/veterinarians/{id}
```

---

#### Medical Products

```
GET    /farms/{farmId}/medical-products
POST   /farms/{farmId}/medical-products
PUT    /farms/{farmId}/medical-products/{id}
DELETE /farms/{farmId}/medical-products/{id}
```

---

#### Documents

**Upload document**
```
POST /farms/{farmId}/documents
Content-Type: multipart/form-data
```

**Download document**
```
GET /farms/{farmId}/documents/{id}/download
```

---

#### Campaigns

```
GET    /farms/{farmId}/campaigns
POST   /farms/{farmId}/campaigns
PUT    /farms/{farmId}/campaigns/{id}
POST   /farms/{farmId}/campaigns/{id}/complete
```

---

#### Breedings

```
GET    /farms/{farmId}/breedings
POST   /farms/{farmId}/breedings
PUT    /farms/{farmId}/breedings/{id}
```

---

#### Alert Configurations

```
GET    /farms/{farmId}/alert-configurations
PUT    /farms/{farmId}/alert-configurations/{id}
```

---

#### Farm Preferences

```
GET /farms/{farmId}/preferences
PUT /farms/{farmId}/preferences
```

---

### 6.3 Endpoint de Synchronisation

#### Sync Batch (Principal)

```
POST /sync
```

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request Body:
```json
{
  "items": [
    {
      "id": "sync-queue-item-uuid",
      "farmId": "farm-uuid",
      "entityType": "animal",
      "entityId": "animal-uuid",
      "action": "create",
      "payload": {
        "id": "animal-uuid",
        "farmId": "farm-uuid",
        "currentEid": "...",
        "birthDate": "2024-01-15",
        ...
      },
      "clientTimestamp": "2025-01-15T10:30:00Z"
    },
    {
      "id": "sync-queue-item-uuid-2",
      "farmId": "farm-uuid",
      "entityType": "treatment",
      "entityId": "treatment-uuid",
      "action": "update",
      "payload": { ... },
      "clientTimestamp": "2025-01-15T10:31:00Z"
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "sync-queue-item-uuid",
        "entityId": "animal-uuid",
        "status": "synced",
        "serverVersion": 1,
        "serverTimestamp": "2025-01-15T10:30:05Z"
      },
      {
        "id": "sync-queue-item-uuid-2",
        "entityId": "treatment-uuid",
        "status": "conflict",
        "serverVersion": 3,
        "clientVersion": 2,
        "serverData": { ... }
      }
    ],
    "summary": {
      "total": 2,
      "synced": 1,
      "conflicts": 1,
      "errors": 0
    }
  }
}
```

#### Get Changes Since (Pull)

```
GET /sync/changes?farmId={farmId}&since={timestamp}
```

Response:
```json
{
  "success": true,
  "data": {
    "changes": [
      {
        "entityType": "animal",
        "entityId": "uuid",
        "action": "update",
        "payload": { ... },
        "serverTimestamp": "2025-01-15T11:00:00Z",
        "version": 2
      }
    ],
    "serverTimestamp": "2025-01-15T11:05:00Z"
  }
}
```

---

## 7. Synchronisation

### 7.1 Stratégie de Sync

#### Offline-First
1. L'app mobile fonctionne entièrement hors ligne
2. Les modifications sont stockées dans `sync_queue` local
3. Sync automatique quand connexion disponible
4. Sync manuelle possible via bouton

#### Push-then-Pull
1. **Push** : Envoyer les modifications locales au serveur
2. **Pull** : Récupérer les modifications serveur (autres devices)

### 7.2 Gestion des Conflits

#### Détection
- Chaque entité a un champ `version`
- À chaque modification : `version += 1`
- Lors du sync : comparer `clientVersion` vs `serverVersion`

#### Résolution

```typescript
// src/sync/sync.service.ts

async processSyncItem(item: SyncItem): Promise<SyncResult> {
  const existing = await this.getEntity(item.entityType, item.entityId);

  // CREATE
  if (item.action === 'create') {
    if (existing) {
      // Entity already exists - conflict
      return {
        status: 'conflict',
        serverVersion: existing.version,
        serverData: existing
      };
    }
    await this.createEntity(item);
    return { status: 'synced', serverVersion: 1 };
  }

  // UPDATE
  if (item.action === 'update') {
    if (!existing) {
      return { status: 'error', message: 'Entity not found' };
    }

    const clientVersion = item.payload.version || 0;

    if (existing.version > clientVersion) {
      // Server has newer version - conflict
      return {
        status: 'conflict',
        serverVersion: existing.version,
        clientVersion: clientVersion,
        serverData: existing
      };
    }

    await this.updateEntity(item, existing.version + 1);
    return { status: 'synced', serverVersion: existing.version + 1 };
  }

  // DELETE
  if (item.action === 'delete') {
    await this.softDeleteEntity(item.entityType, item.entityId);
    return { status: 'synced' };
  }
}
```

### 7.3 Types d'Entités Synchronisables

| EntityType | Table Prisma | Actions |
|------------|--------------|---------|
| `animal` | Animal | create, update, delete |
| `lot` | Lot + LotAnimal | create, update, delete |
| `treatment` | Treatment | create, update, delete |
| `vaccination` | Vaccination | create, update, delete |
| `movement` | Movement | create, update, delete |
| `weight` | Weight | create, update, delete |
| `veterinarian` | Veterinarian | create, update, delete |
| `medicalProduct` | MedicalProduct | create, update, delete |
| `vaccine` | Vaccine | create, update, delete |
| `document` | Document | create, update, delete |
| `campaign` | Campaign | create, update, delete |
| `breeding` | Breeding | create, update, delete |
| `alertConfiguration` | AlertConfiguration | create, update |
| `farmPreferences` | FarmPreferences | create, update |

### 7.4 Ordre de Traitement

Les entités doivent être synchronisées dans un ordre spécifique pour respecter les dépendances :

1. **Farm** (si création de ferme supportée)
2. **Veterinarian**
3. **MedicalProduct**, **Vaccine**
4. **Animal** (avant parenté)
5. **Animal** (update pour parenté motherId)
6. **Lot**
7. **LotAnimal** (via Lot)
8. **Treatment**, **Vaccination**, **Movement**, **Weight**
9. **Document**, **Campaign**, **Breeding**
10. **AlertConfiguration**, **FarmPreferences**

### 7.5 Batch Processing

```typescript
// src/sync/sync.service.ts

async processBatch(items: SyncItem[]): Promise<BatchResult> {
  // Sort items by dependency order
  const sortedItems = this.sortByDependency(items);

  const results: SyncResult[] = [];

  // Process in transaction
  await this.prisma.$transaction(async (tx) => {
    for (const item of sortedItems) {
      try {
        const result = await this.processSyncItem(item, tx);
        results.push(result);

        // Log sync
        await tx.syncLog.create({
          data: {
            farmId: item.farmId,
            entityType: item.entityType,
            entityId: item.entityId,
            action: item.action,
            payload: item.payload,
            clientTimestamp: new Date(item.clientTimestamp),
            status: result.status
          }
        });
      } catch (error) {
        results.push({
          id: item.id,
          entityId: item.entityId,
          status: 'error',
          message: error.message
        });
      }
    }
  });

  return {
    results,
    summary: this.summarizeResults(results)
  };
}
```

---

## 8. Déploiement

### 8.1 Structure Docker Compose

```yaml
# docker-compose.yml

version: '3.8'

services:
  # ===================
  # TRAEFIK
  # ===================
  traefik:
    image: traefik:v3.0
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@anitra.dz"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      # Redirect HTTP to HTTPS
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - anitra-network
    restart: unless-stopped

  # ===================
  # API (NestJS)
  # ===================
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://anitra:${DB_PASSWORD}@postgres:5432/anitra
      - KEYCLOAK_URL=https://auth.anitra.dz
      - KEYCLOAK_REALM=anitra
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.anitra.dz`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      - "traefik.http.services.api.loadbalancer.server.port=3000"
    networks:
      - anitra-network
    restart: unless-stopped

  # ===================
  # WEB (Next.js)
  # ===================
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.anitra.dz
      - NEXTAUTH_URL=https://app.anitra.dz
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - KEYCLOAK_CLIENT_ID=anitra-web
      - KEYCLOAK_CLIENT_SECRET=${KEYCLOAK_WEB_SECRET}
      - KEYCLOAK_ISSUER=https://auth.anitra.dz/realms/anitra
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=Host(`app.anitra.dz`)"
      - "traefik.http.routers.web.entrypoints=websecure"
      - "traefik.http.routers.web.tls.certresolver=letsencrypt"
      - "traefik.http.services.web.loadbalancer.server.port=3000"
    networks:
      - anitra-network
    restart: unless-stopped

  # ===================
  # KEYCLOAK
  # ===================
  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    command: start
    environment:
      - KC_DB=postgres
      - KC_DB_URL=jdbc:postgresql://postgres-keycloak:5432/keycloak
      - KC_DB_USERNAME=keycloak
      - KC_DB_PASSWORD=${KEYCLOAK_DB_PASSWORD}
      - KC_HOSTNAME=auth.anitra.dz
      - KC_PROXY=edge
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD}
    depends_on:
      - postgres-keycloak
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.keycloak.rule=Host(`auth.anitra.dz`)"
      - "traefik.http.routers.keycloak.entrypoints=websecure"
      - "traefik.http.routers.keycloak.tls.certresolver=letsencrypt"
      - "traefik.http.services.keycloak.loadbalancer.server.port=8080"
    networks:
      - anitra-network
    restart: unless-stopped

  # ===================
  # POSTGRESQL (App)
  # ===================
  postgres:
    image: postgres:16
    environment:
      - POSTGRES_DB=anitra
      - POSTGRES_USER=anitra
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - anitra-network
    restart: unless-stopped

  # ===================
  # POSTGRESQL (Keycloak)
  # ===================
  postgres-keycloak:
    image: postgres:16
    environment:
      - POSTGRES_DB=keycloak
      - POSTGRES_USER=keycloak
      - POSTGRES_PASSWORD=${KEYCLOAK_DB_PASSWORD}
    volumes:
      - postgres-keycloak-data:/var/lib/postgresql/data
    networks:
      - anitra-network
    restart: unless-stopped

  # ===================
  # REDIS
  # ===================
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - anitra-network
    restart: unless-stopped

networks:
  anitra-network:
    driver: bridge

volumes:
  postgres-data:
  postgres-keycloak-data:
  redis-data:
```

### 8.2 Dockerfile API

```dockerfile
# api/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Production
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### 8.3 Variables d'Environnement

```bash
# .env.production

# Database
DB_PASSWORD=secure_password_here
DATABASE_URL=postgresql://anitra:${DB_PASSWORD}@postgres:5432/anitra

# Keycloak
KEYCLOAK_URL=https://auth.anitra.dz
KEYCLOAK_REALM=anitra
KEYCLOAK_DB_PASSWORD=secure_keycloak_db_password
KEYCLOAK_ADMIN_PASSWORD=secure_admin_password
KEYCLOAK_WEB_SECRET=secure_client_secret

# Next.js
NEXTAUTH_SECRET=secure_nextauth_secret
NEXTAUTH_URL=https://app.anitra.dz

# Redis
REDIS_URL=redis://redis:6379

# API
API_PORT=3000
NODE_ENV=production
```

### 8.4 Déploiement OVH

#### Prérequis
- VPS ou serveur dédié OVH
- Docker et Docker Compose installés
- Domaine configuré (anitra.dz)
- DNS A records :
  - `api.anitra.dz` → IP serveur
  - `app.anitra.dz` → IP serveur
  - `auth.anitra.dz` → IP serveur

#### Étapes de déploiement

```bash
# 1. Clone du repo
git clone https://github.com/your-org/anitra-backend.git
cd anitra-backend

# 2. Configuration
cp .env.example .env.production
nano .env.production  # Éditer les variables

# 3. Lancement
docker-compose -f docker-compose.yml --env-file .env.production up -d

# 4. Migrations Prisma
docker-compose exec api npx prisma migrate deploy

# 5. Seed des données initiales (species, breeds)
docker-compose exec api npx prisma db seed

# 6. Vérification
docker-compose ps
curl https://api.anitra.dz/health
```

---

## 9. Sécurité

### 9.1 HTTPS/SSL

- Traefik gère automatiquement les certificats Let's Encrypt
- Redirection HTTP → HTTPS automatique
- TLS 1.2+ uniquement

### 9.2 Validation des Données

```typescript
// src/animals/dto/create-animal.dto.ts

import { IsString, IsOptional, IsDateString, IsEnum, IsUUID, MaxLength } from 'class-validator';

export class CreateAnimalDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  currentEid?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  officialNumber?: string;

  @IsDateString()
  birthDate: string;

  @IsEnum(['male', 'female'])
  sex: string;

  @IsOptional()
  @IsUUID()
  speciesId?: string;

  @IsOptional()
  @IsUUID()
  motherId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
```

### 9.3 Rate Limiting

```typescript
// src/app.module.ts

import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 seconde
        limit: 10,   // 10 requêtes
      },
      {
        name: 'medium',
        ttl: 60000,  // 1 minute
        limit: 100,  // 100 requêtes
      },
      {
        name: 'long',
        ttl: 3600000, // 1 heure
        limit: 1000,  // 1000 requêtes
      },
    ]),
  ],
})
export class AppModule {}
```

### 9.4 CORS

```typescript
// src/main.ts

app.enableCors({
  origin: [
    'https://app.anitra.dz',
    // Mobile apps don't need CORS
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Farm-Id'],
  credentials: true,
});
```

### 9.5 Helmet (Headers de sécurité)

```typescript
// src/main.ts

import helmet from 'helmet';

app.use(helmet());
```

### 9.6 Protection contre les Injections

- **SQL Injection** : Prisma utilise des requêtes paramétrées
- **NoSQL Injection** : N/A (PostgreSQL)
- **XSS** : Validation des entrées + échappement des sorties

---

## 10. Web Application

### 10.1 Fonctionnalités Proposées

#### Dashboard
- Vue d'ensemble du cheptel
- Statistiques (naissances, morts, ventes)
- Alertes actives
- Graphiques de tendances

#### Gestion des Animaux
- Liste avec filtres avancés
- Fiche détaillée animal
- Historique complet (traitements, vaccinations, mouvements)
- Arbre généalogique

#### Rapports
- Export PDF/Excel
- Registre d'élevage officiel
- Rapport sanitaire
- Suivi de rémanence

#### Administration
- Gestion des utilisateurs de la ferme
- Configuration des alertes
- Paramètres de la ferme
- Gestion des produits médicaux

### 10.2 Stack Web

```
Next.js 14
├── App Router
├── Server Components
├── Server Actions
└── API Routes (si nécessaire)

UI
├── Tailwind CSS
├── shadcn/ui (composants)
└── Recharts (graphiques)

State Management
├── TanStack Query (server state)
└── Zustand (client state)

Auth
└── NextAuth.js v5 (Keycloak provider)
```

### 10.3 Structure Projet Web

```
web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── logout/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── animals/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── lots/
│   │   │   ├── treatments/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── animals/
│   │   ├── dashboard/
│   │   └── shared/
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── types/
├── public/
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 11. Annexes

### 11.1 Exemples de Payloads JSON

#### Animal Create
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "farmId": "550e8400-e29b-41d4-a716-446655440000",
  "currentEid": "982000123456789",
  "officialNumber": "DZ-16-2025-00001",
  "visualId": "A001",
  "birthDate": "2024-03-15T00:00:00.000Z",
  "sex": "female",
  "speciesId": "sheep",
  "breedId": "ouled-djellal",
  "motherId": "550e8400-e29b-41d4-a716-446655440010",
  "status": "alive",
  "notes": "Bonne santé, bonne conformation"
}
```

#### Treatment Create
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440100",
  "farmId": "550e8400-e29b-41d4-a716-446655440000",
  "animalId": "550e8400-e29b-41d4-a716-446655440001",
  "productId": "prod-001",
  "productName": "Ivomec",
  "dose": 2.5,
  "treatmentDate": "2025-01-15T08:00:00.000Z",
  "withdrawalEndDate": "2025-02-05T08:00:00.000Z",
  "veterinarianId": "vet-001",
  "veterinarianName": "Dr. Ahmed",
  "notes": "Traitement antiparasitaire préventif"
}
```

#### Sync Batch Request
```json
{
  "items": [
    {
      "id": "queue-001",
      "farmId": "farm-001",
      "entityType": "animal",
      "entityId": "animal-001",
      "action": "create",
      "payload": {
        "id": "animal-001",
        "farmId": "farm-001",
        "birthDate": "2024-01-15",
        "sex": "female",
        "speciesId": "sheep",
        "status": "alive"
      },
      "clientTimestamp": "2025-01-15T10:00:00.000Z"
    },
    {
      "id": "queue-002",
      "farmId": "farm-001",
      "entityType": "treatment",
      "entityId": "treatment-001",
      "action": "create",
      "payload": {
        "id": "treatment-001",
        "farmId": "farm-001",
        "animalId": "animal-001",
        "productName": "Ivomec",
        "dose": 2.5,
        "treatmentDate": "2025-01-15",
        "withdrawalEndDate": "2025-02-05"
      },
      "clientTimestamp": "2025-01-15T10:01:00.000Z"
    }
  ]
}
```

### 11.2 Scripts de Migration

#### Seed des données initiales

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Species
  await prisma.species.createMany({
    data: [
      { id: 'sheep', nameFr: 'Ovin', nameEn: 'Sheep', nameAr: 'غنم', icon: '🐑', displayOrder: 1 },
      { id: 'cattle', nameFr: 'Bovin', nameEn: 'Cattle', nameAr: 'بقر', icon: '🐄', displayOrder: 2 },
      { id: 'goat', nameFr: 'Caprin', nameEn: 'Goat', nameAr: 'ماعز', icon: '🐐', displayOrder: 3 },
    ],
    skipDuplicates: true,
  });

  // Breeds - Sheep
  await prisma.breed.createMany({
    data: [
      { id: 'ouled-djellal', speciesId: 'sheep', nameFr: 'Ouled Djellal', nameEn: 'Ouled Djellal', nameAr: 'أولاد جلال', displayOrder: 1 },
      { id: 'rembi', speciesId: 'sheep', nameFr: 'Rembi', nameEn: 'Rembi', nameAr: 'الرمبي', displayOrder: 2 },
      { id: 'hamra', speciesId: 'sheep', nameFr: 'Hamra', nameEn: 'Hamra', nameAr: 'الحمراء', displayOrder: 3 },
      { id: 'dmen', speciesId: 'sheep', nameFr: "D'men", nameEn: "D'men", nameAr: 'الدمان', displayOrder: 4 },
      { id: 'taadmit', speciesId: 'sheep', nameFr: 'Taadmit', nameEn: 'Taadmit', nameAr: 'تعظميت', displayOrder: 5 },
      { id: 'barbarine', speciesId: 'sheep', nameFr: 'Barbarine', nameEn: 'Barbarine', nameAr: 'البربرين', displayOrder: 6 },
      { id: 'sidahou', speciesId: 'sheep', nameFr: 'Sidahou', nameEn: 'Sidahou', nameAr: 'سيداهو', displayOrder: 7 },
    ],
    skipDuplicates: true,
  });

  // Breeds - Cattle
  await prisma.breed.createMany({
    data: [
      { id: 'guelma', speciesId: 'cattle', nameFr: 'Guelmoise', nameEn: 'Guelma', nameAr: 'القالمية', displayOrder: 1 },
      { id: 'cheurfa', speciesId: 'cattle', nameFr: 'Cheurfa', nameEn: 'Cheurfa', nameAr: 'الشرفة', displayOrder: 2 },
      { id: 'setif', speciesId: 'cattle', nameFr: 'Sétifienne', nameEn: 'Setif', nameAr: 'السطايفية', displayOrder: 3 },
    ],
    skipDuplicates: true,
  });

  // Breeds - Goat
  await prisma.breed.createMany({
    data: [
      { id: 'arbia', speciesId: 'goat', nameFr: 'Arbia', nameEn: 'Arbia', nameAr: 'العربية', displayOrder: 1 },
      { id: 'kabyle', speciesId: 'goat', nameFr: 'Kabyle', nameEn: 'Kabyle', nameAr: 'القبائلية', displayOrder: 2 },
      { id: 'makatia', speciesId: 'goat', nameFr: 'M\'katia', nameEn: 'Makatia', nameAr: 'المكاطية', displayOrder: 3 },
    ],
    skipDuplicates: true,
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 11.3 Commandes Utiles

```bash
# Développement
npm run start:dev          # Lancer API en mode dev
npx prisma studio          # Interface graphique DB
npx prisma migrate dev     # Créer une migration
npx prisma db push         # Push schema sans migration

# Production
npx prisma migrate deploy  # Appliquer les migrations
npx prisma db seed         # Seed initial

# Docker
docker-compose logs -f api           # Logs API
docker-compose exec api sh           # Shell dans container
docker-compose down -v               # Stop + remove volumes
docker-compose pull                  # Update images
```

---

## Conclusion

Ce document fournit toutes les spécifications nécessaires pour implémenter le backend AniTra. Les prochaines étapes sont :

1. **Setup projet NestJS** avec configuration de base
2. **Implémentation Prisma** avec toutes les tables
3. **Configuration Keycloak** (realm, clients, rôles)
4. **Endpoints CRUD** pour chaque entité
5. **Endpoint de synchronisation**
6. **Setup Docker** et déploiement OVH
7. **Application Web** Next.js

Pour toute question ou clarification, se référer aux sections correspondantes de ce document.

---

*Document généré le 2025-11-19*
*Version 1.0*
