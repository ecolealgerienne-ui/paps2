# SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES
## Module: Gestion Animal & Registre de Traitement - CORE

**Version:** 1.0
**Date:** 2025-11-29
**Statut:** MVP

---

## TABLE DES MATIÈRES

1. [Contexte et Objectifs](#1-contexte-et-objectifs)
2. [Architecture et Standards](#2-architecture-et-standards)
3. [Modèle de Données](#3-modèle-de-données)
4. [Spécifications API](#4-spécifications-api)
5. [Logique Métier et Alertes](#5-logique-métier-et-alertes)
6. [Implémentation Backend](#6-implémentation-backend)
7. [Tests](#7-tests)
8. [Migration et Déploiement](#8-migration-et-déploiement)

---

## 1. CONTEXTE ET OBJECTIFS

### 1.1 Objectif du Module

Ce module implémente le cœur du système de traçabilité sanitaire:
- **Historique des statuts physiologiques** des animaux (gestation, lactation, poids)
- **Configuration personnalisée des produits** par l'éleveur (surcharge des valeurs AMM/RCP)
- **Gestion des lots de médicaments** (traçabilité légale)
- **Alertes de sécurité** (contre-indications, délais d'attente, péremption)

### 1.2 Périmètre MVP

| Inclus | Exclus |
|--------|--------|
| CRUD AnimalStatusHistory | Suivi quantité stock |
| CRUD FarmerProductLot | Gestion multi-utilisateurs |
| Extension FarmProductPreference | Historique modifications |
| Modification Treatment | Workflow approbation |
| Alertes non-bloquantes | Blocage réglementaire |

---

## 2. ARCHITECTURE ET STANDARDS

### 2.1 Architecture Existante à Respecter

```
src/
├── common/
│   ├── decorators/          # Décorateurs personnalisés
│   ├── enums/               # Enums partagés
│   ├── filters/             # Exception filters
│   ├── guards/              # Auth guards
│   ├── interceptors/        # Response interceptors
│   └── pipes/               # Validation pipes
├── prisma/
│   └── prisma.service.ts    # Service Prisma singleton
├── [module]/
│   ├── [module].controller.ts
│   ├── [module].service.ts
│   ├── [module].module.ts
│   ├── dto/
│   │   ├── create-[entity].dto.ts
│   │   ├── update-[entity].dto.ts
│   │   └── query-[entity].dto.ts
│   └── entities/
│       └── [entity].entity.ts
```

### 2.2 Standards de Code

#### 2.2.1 Gestion des Erreurs

```typescript
// Utiliser les exceptions NestJS standard
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException
} from '@nestjs/common';

// Pattern de gestion d'erreur
try {
  // opération
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ConflictException('Enregistrement déjà existant');
    }
    if (error.code === 'P2025') {
      throw new NotFoundException('Enregistrement non trouvé');
    }
  }
  throw error;
}
```

#### 2.2.2 Internationalisation (I18n)

```typescript
// Messages d'erreur avec clés i18n
throw new BadRequestException({
  message: 'validation.animal_status.invalid_type',
  statusCode: 400,
});

// Structure des fichiers i18n
// src/i18n/fr/validation.json
// src/i18n/en/validation.json
// src/i18n/ar/validation.json
```

#### 2.2.3 Transactions Prisma

```typescript
// Pour les opérations multi-tables
async createWithRelations(data: CreateDto) {
  return this.prisma.$transaction(async (tx) => {
    const parent = await tx.parent.create({ data: parentData });
    const child = await tx.child.create({
      data: { ...childData, parentId: parent.id }
    });
    return { parent, child };
  });
}
```

#### 2.2.4 Performance

```typescript
// Pagination obligatoire pour les listes
@Query() query: QueryDto  // limit, offset, sortBy, sortOrder

// Select explicite (éviter select *)
const result = await this.prisma.entity.findMany({
  select: {
    id: true,
    name: true,
    // uniquement les champs nécessaires
  },
  take: query.limit,
  skip: query.offset,
});

// Index Prisma pour les requêtes fréquentes
@@index([farmId, isActive, deletedAt])
```

#### 2.2.5 Soft Delete

```typescript
// Pattern soft delete existant
where: {
  id,
  deletedAt: null,  // Toujours filtrer les supprimés
}

// Suppression
await this.prisma.entity.update({
  where: { id },
  data: { deletedAt: new Date() },
});
```

#### 2.2.6 Validation DTO

```typescript
import { IsString, IsOptional, IsEnum, IsUUID, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateEntityDto {
  @ApiProperty({ description: 'Description du champ' })
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  optionalField?: string;
}
```

---

## 3. MODÈLE DE DONNÉES

### 3.1 Nouveaux Enums

```prisma
// À ajouter dans schema.prisma

// Type de statut physiologique animal
enum AnimalStatusType {
  WEIGHT        // Poids
  GESTATION     // Gestation
  LACTATION     // Lactation
  VET_CHECK     // Contrôle vétérinaire
}

// Unité de dosage personnalisé
enum DoseUnitType {
  ML_PER_KG     // ml/kg
  ML_PER_HEAD   // ml/tête
  MG_PER_KG     // mg/kg
  G_PER_HEAD    // g/tête
}
```

### 3.2 Nouvelle Table: AnimalStatusHistory

```prisma
model AnimalStatusHistory {
  id          String            @id @default(uuid())
  animalId    String            @map("animal_id")
  statusType  AnimalStatusType  @map("status_type")
  startDate   DateTime          @map("start_date")
  endDate     DateTime?         @map("end_date")
  value       String
  notes       String?
  version     Int               @default(1)
  deletedAt   DateTime?         @map("deleted_at")
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")

  // Relations
  animal      Animal            @relation(fields: [animalId], references: [id], onDelete: Cascade)

  // Indexes
  @@index([animalId])
  @@index([statusType])
  @@index([deletedAt])
  @@index([animalId, statusType, endDate])  // Requête statut actif
  @@index([animalId, deletedAt])

  @@map("animal_status_history")
}
```

### 3.3 Nouvelle Table: FarmerProductLot

```prisma
model FarmerProductLot {
  id                String   @id @default(uuid())
  configId          String   @map("config_id")
  nickname          String
  officialLotNumber String   @map("official_lot_number")
  expiryDate        DateTime @map("expiry_date")
  isActive          Boolean  @default(true) @map("is_active")
  version           Int      @default(1)
  deletedAt         DateTime? @map("deleted_at")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // Relations
  config     FarmProductPreference @relation(fields: [configId], references: [id], onDelete: Cascade)
  treatments Treatment[]

  // Constraints
  @@unique([configId, officialLotNumber])

  // Indexes
  @@index([configId])
  @@index([configId, isActive])
  @@index([expiryDate])
  @@index([deletedAt])
  @@index([configId, isActive, deletedAt])

  @@map("farmer_product_lots")
}
```

### 3.4 Extension Table: FarmProductPreference

```prisma
model FarmProductPreference {
  // Champs existants
  id           String   @id @default(uuid())
  farmId       String   @map("farm_id")
  productId    String   @map("product_id")
  displayOrder Int      @default(0) @map("display_order")
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // NOUVEAUX CHAMPS
  packagingId               String?       @map("packaging_id")
  userDefinedDose           Decimal?      @map("user_defined_dose") @db.Decimal(10, 4)
  userDefinedDoseUnit       DoseUnitType? @map("user_defined_dose_unit")
  userDefinedMeatWithdrawal Int?          @map("user_defined_meat_withdrawal")  // Jours
  userDefinedMilkWithdrawal Int?          @map("user_defined_milk_withdrawal")  // Heures

  // Relations existantes
  farm    Farm    @relation(fields: [farmId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  // NOUVELLES RELATIONS
  packaging ProductPackaging?  @relation(fields: [packagingId], references: [id])
  lots      FarmerProductLot[]

  @@unique([farmId, productId])
  @@index([farmId])
  @@index([productId])
  @@index([packagingId])
  @@map("farm_product_preferences")
}
```

### 3.5 Modification Table: Treatment

```prisma
model Treatment {
  // ... champs existants ...

  // AJOUTER
  farmerLotId  String?  @map("farmer_lot_id")

  // SUPPRIMER (après migration données si nécessaire)
  // batchNumber      String?   @map("batch_number")      -- À SUPPRIMER
  // batchExpiryDate  DateTime? @map("batch_expiry_date") -- À SUPPRIMER

  // NOUVELLE RELATION
  farmerLot  FarmerProductLot? @relation(fields: [farmerLotId], references: [id])

  // NOUVEL INDEX
  @@index([farmerLotId])

  // ... indexes existants ...
}
```

### 3.6 Modification Table: Animal

```prisma
model Animal {
  // ... champs existants ...

  // NOUVELLE RELATION
  statusHistory  AnimalStatusHistory[]

  // ... relations existantes ...
}
```

### 3.7 Modification Table: ProductPackaging

```prisma
model ProductPackaging {
  // ... champs existants ...

  // NOUVELLE RELATION (inverse)
  farmPreferences  FarmProductPreference[]

  // ... relations existantes ...
}
```

---

## 4. SPÉCIFICATIONS API

### 4.1 AnimalStatusHistory API

#### Base Path: `/farms/:farmId/animals/:animalId/status-history`

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/` | Créer un statut | Bearer |
| GET | `/` | Liste des statuts (paginée) | Bearer |
| GET | `/:id` | Détail d'un statut | Bearer |
| PUT | `/:id` | Modifier un statut | Bearer |
| DELETE | `/:id` | Supprimer un statut (soft) | Bearer |
| GET | `/active` | Statuts actifs (endDate=null) | Bearer |
| PATCH | `/:id/close` | Clôturer un statut (set endDate) | Bearer |

#### DTOs

```typescript
// create-animal-status.dto.ts
export class CreateAnimalStatusDto {
  @ApiProperty({ enum: AnimalStatusType })
  @IsEnum(AnimalStatusType)
  statusType: AnimalStatusType;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Valeur du statut (ex: "650.5" pour poids, "confirmed" pour gestation)' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

// update-animal-status.dto.ts
export class UpdateAnimalStatusDto extends PartialType(CreateAnimalStatusDto) {}

// query-animal-status.dto.ts
export class QueryAnimalStatusDto extends PaginationDto {
  @ApiPropertyOptional({ enum: AnimalStatusType })
  @IsOptional()
  @IsEnum(AnimalStatusType)
  statusType?: AnimalStatusType;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  activeOnly?: boolean;  // endDate = null
}

// close-animal-status.dto.ts
export class CloseAnimalStatusDto {
  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
```

#### Réponses

```typescript
// Succès création
{
  "success": true,
  "data": {
    "id": "uuid",
    "animalId": "uuid",
    "statusType": "GESTATION",
    "startDate": "2025-01-15T00:00:00.000Z",
    "endDate": null,
    "value": "confirmed",
    "notes": null,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}

// Liste paginée
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 4.2 FarmerProductLot API

#### Base Path: `/farms/:farmId/product-configs/:configId/lots`

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/` | Créer un lot | Bearer |
| GET | `/` | Liste des lots (paginée) | Bearer |
| GET | `/:id` | Détail d'un lot | Bearer |
| PUT | `/:id` | Modifier un lot | Bearer |
| DELETE | `/:id` | Supprimer un lot (soft) | Bearer |
| PATCH | `/:id/activate` | Activer un lot | Bearer |
| PATCH | `/:id/deactivate` | Désactiver un lot | Bearer |
| GET | `/active` | Lots actifs uniquement | Bearer |

#### DTOs

```typescript
// create-farmer-product-lot.dto.ts
export class CreateFarmerProductLotDto {
  @ApiProperty({ description: 'Libellé simple (ex: "Lot 1", "Flacon Janvier")' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nickname: string;

  @ApiProperty({ description: 'Numéro de lot fabricant (ex: "C4567-9A")' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  officialLotNumber: string;

  @ApiProperty({ description: 'Date de péremption' })
  @IsDateString()
  expiryDate: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// update-farmer-product-lot.dto.ts
export class UpdateFarmerProductLotDto extends PartialType(CreateFarmerProductLotDto) {}

// query-farmer-product-lot.dto.ts
export class QueryFarmerProductLotDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  activeOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filtrer lots expirés/non-expirés' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  excludeExpired?: boolean;
}
```

---

### 4.3 FarmProductPreference API (Extension)

#### Base Path: `/farms/:farmId/product-preferences`

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| PUT | `/:id/config` | Configurer dosage/délais personnalisés | Bearer |
| GET | `/:id/config` | Récupérer configuration | Bearer |
| DELETE | `/:id/config` | Réinitialiser configuration (NULL) | Bearer |

#### DTOs

```typescript
// update-product-config.dto.ts
export class UpdateProductConfigDto {
  @ApiPropertyOptional({ description: 'ID du conditionnement spécifique (GTIN)' })
  @IsOptional()
  @IsUUID()
  packagingId?: string;

  @ApiPropertyOptional({ description: 'Dosage personnalisé (NULL par défaut)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  userDefinedDose?: number;

  @ApiPropertyOptional({ enum: DoseUnitType })
  @IsOptional()
  @IsEnum(DoseUnitType)
  userDefinedDoseUnit?: DoseUnitType;

  @ApiPropertyOptional({ description: 'Délai viande en jours (NULL par défaut)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  userDefinedMeatWithdrawal?: number;

  @ApiPropertyOptional({ description: 'Délai lait en heures (NULL par défaut)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  userDefinedMilkWithdrawal?: number;
}
```

---

### 4.4 Treatment API (Modification)

#### Modification DTO existant

```typescript
// create-treatment.dto.ts - AJOUTER
export class CreateTreatmentDto {
  // ... champs existants ...

  @ApiPropertyOptional({ description: 'ID du lot médicament (FarmerProductLot)' })
  @IsOptional()
  @IsUUID()
  farmerLotId?: string;

  // SUPPRIMER après migration
  // batchNumber?: string;
  // batchExpiryDate?: string;
}
```

---

### 4.5 Alertes API

#### Base Path: `/farms/:farmId/alerts`

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/check-contraindication` | Vérifier contre-indications avant traitement | Bearer |
| GET | `/check-withdrawal/:animalId` | Vérifier délais d'attente actifs | Bearer |
| GET | `/expiring-lots` | Lots proches de la péremption | Bearer |

#### DTOs

```typescript
// check-contraindication-query.dto.ts
export class CheckContraindicationQueryDto {
  @ApiProperty()
  @IsUUID()
  animalId: string;

  @ApiProperty()
  @IsUUID()
  productId: string;
}

// Réponse alerte
{
  "success": true,
  "data": {
    "hasAlert": true,
    "alertType": "GESTATION_CONTRAINDICATION",
    "message": "animal_status.alert.gestation_contraindication",
    "details": {
      "animalId": "uuid",
      "statusType": "GESTATION",
      "statusValue": "confirmed",
      "productName": "Produit X"
    }
  }
}
```

---

## 5. LOGIQUE MÉTIER ET ALERTES

### 5.1 Règles de Validation

#### AnimalStatusHistory

```typescript
// Un seul statut actif par type par animal
async validateUniqueActiveStatus(animalId: string, statusType: AnimalStatusType) {
  const existing = await this.prisma.animalStatusHistory.findFirst({
    where: {
      animalId,
      statusType,
      endDate: null,
      deletedAt: null,
    },
  });

  if (existing) {
    throw new ConflictException({
      message: 'animal_status.error.active_status_exists',
      details: { statusType, existingId: existing.id },
    });
  }
}

// startDate <= endDate
if (dto.endDate && new Date(dto.startDate) > new Date(dto.endDate)) {
  throw new BadRequestException('animal_status.error.invalid_date_range');
}
```

#### FarmerProductLot

```typescript
// Unicité numéro de lot par config
// Géré par @@unique([configId, officialLotNumber])

// Validation date péremption future (création)
if (new Date(dto.expiryDate) <= new Date()) {
  throw new BadRequestException('farmer_lot.error.expiry_date_past');
}
```

#### FarmProductPreference (Config)

```typescript
// Si userDefinedDose est défini, userDefinedDoseUnit doit l'être aussi
if (dto.userDefinedDose !== undefined && dto.userDefinedDoseUnit === undefined) {
  throw new BadRequestException('product_config.error.dose_unit_required');
}
```

### 5.2 Alertes (Non Bloquantes)

#### 5.2.1 Alerte Contre-Indication Gestation

```typescript
async checkGestationContraindication(
  animalId: string,
  productId: string
): Promise<AlertResult> {
  // 1. Vérifier si animal en gestation active
  const gestationStatus = await this.prisma.animalStatusHistory.findFirst({
    where: {
      animalId,
      statusType: 'GESTATION',
      value: 'confirmed',
      endDate: null,
      deletedAt: null,
    },
  });

  if (!gestationStatus) {
    return { hasAlert: false };
  }

  // 2. Vérifier si produit contre-indiqué en gestation
  // Note: Ajouter champ contraindicatedInGestation dans Product si nécessaire
  const product = await this.prisma.product.findUnique({
    where: { id: productId },
    select: { contraindicatedInGestation: true, nameFr: true },
  });

  if (product?.contraindicatedInGestation) {
    return {
      hasAlert: true,
      alertType: 'GESTATION_CONTRAINDICATION',
      message: 'alerts.gestation_contraindication',
      severity: 'warning',
      details: {
        animalId,
        gestationStartDate: gestationStatus.startDate,
        productName: product.nameFr,
      },
    };
  }

  return { hasAlert: false };
}
```

#### 5.2.2 Alerte Délai d'Attente (Sortie Animal)

```typescript
async checkWithdrawalAlert(animalId: string): Promise<AlertResult> {
  const now = new Date();

  // Trouver traitements avec délai actif
  const activeTreatments = await this.prisma.treatment.findMany({
    where: {
      animalId,
      deletedAt: null,
      OR: [
        { computedWithdrawalMeatDate: { gt: now } },
        { computedWithdrawalMilkDate: { gt: now } },
      ],
    },
    select: {
      id: true,
      productName: true,
      treatmentDate: true,
      computedWithdrawalMeatDate: true,
      computedWithdrawalMilkDate: true,
    },
    orderBy: { computedWithdrawalMeatDate: 'desc' },
  });

  if (activeTreatments.length === 0) {
    return { hasAlert: false };
  }

  // Trouver la date la plus tardive
  const latestMeatDate = activeTreatments
    .map(t => t.computedWithdrawalMeatDate)
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return {
    hasAlert: true,
    alertType: 'WITHDRAWAL_ACTIVE',
    message: 'alerts.withdrawal_active',
    severity: 'warning',
    details: {
      animalId,
      withdrawalEndDate: latestMeatDate,
      treatmentsCount: activeTreatments.length,
      treatments: activeTreatments,
    },
  };
}
```

#### 5.2.3 Alerte Péremption Lot

```typescript
async checkExpiringLots(
  farmId: string,
  daysBeforeExpiry: number = 7
): Promise<ExpiringLot[]> {
  const alertDate = new Date();
  alertDate.setDate(alertDate.getDate() + daysBeforeExpiry);

  return this.prisma.farmerProductLot.findMany({
    where: {
      config: {
        farmId,
        deletedAt: null,
      },
      isActive: true,
      expiryDate: { lte: alertDate },
      deletedAt: null,
    },
    include: {
      config: {
        include: {
          product: { select: { nameFr: true } },
        },
      },
    },
    orderBy: { expiryDate: 'asc' },
  });
}
```

---

## 6. IMPLÉMENTATION BACKEND

### 6.1 Structure des Modules

```
src/
├── animal-status/
│   ├── animal-status.controller.ts
│   ├── animal-status.service.ts
│   ├── animal-status.module.ts
│   └── dto/
│       ├── create-animal-status.dto.ts
│       ├── update-animal-status.dto.ts
│       ├── query-animal-status.dto.ts
│       └── close-animal-status.dto.ts
│
├── farmer-product-lots/
│   ├── farmer-product-lots.controller.ts
│   ├── farmer-product-lots.service.ts
│   ├── farmer-product-lots.module.ts
│   └── dto/
│       ├── create-farmer-product-lot.dto.ts
│       ├── update-farmer-product-lot.dto.ts
│       └── query-farmer-product-lot.dto.ts
│
├── farm-product-preferences/  (existant - à étendre)
│   ├── dto/
│   │   └── update-product-config.dto.ts  (AJOUTER)
│
├── alerts/
│   ├── alerts.controller.ts
│   ├── alerts.service.ts
│   ├── alerts.module.ts
│   └── dto/
│       └── check-contraindication-query.dto.ts
```

### 6.2 Service Template

```typescript
// animal-status.service.ts
@Injectable()
export class AnimalStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    farmId: string,
    animalId: string,
    dto: CreateAnimalStatusDto,
  ): Promise<AnimalStatusHistory> {
    // 1. Vérifier que l'animal appartient à la ferme
    const animal = await this.prisma.animal.findFirst({
      where: { id: animalId, farmId, deletedAt: null },
    });
    if (!animal) {
      throw new NotFoundException('animal.not_found');
    }

    // 2. Vérifier unicité statut actif par type
    await this.validateUniqueActiveStatus(animalId, dto.statusType);

    // 3. Créer le statut
    return this.prisma.animalStatusHistory.create({
      data: {
        animalId,
        statusType: dto.statusType,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        value: dto.value,
        notes: dto.notes,
      },
    });
  }

  async findAll(
    animalId: string,
    query: QueryAnimalStatusDto,
  ): Promise<PaginatedResult<AnimalStatusHistory>> {
    const where: Prisma.AnimalStatusHistoryWhereInput = {
      animalId,
      deletedAt: null,
      ...(query.statusType && { statusType: query.statusType }),
      ...(query.activeOnly && { endDate: null }),
    };

    const [data, total] = await Promise.all([
      this.prisma.animalStatusHistory.findMany({
        where,
        take: query.limit,
        skip: query.offset,
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.animalStatusHistory.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + data.length < total,
      },
    };
  }

  async findOne(id: string): Promise<AnimalStatusHistory> {
    const status = await this.prisma.animalStatusHistory.findFirst({
      where: { id, deletedAt: null },
    });
    if (!status) {
      throw new NotFoundException('animal_status.not_found');
    }
    return status;
  }

  async update(
    id: string,
    dto: UpdateAnimalStatusDto,
  ): Promise<AnimalStatusHistory> {
    await this.findOne(id); // Vérifie existence

    return this.prisma.animalStatusHistory.update({
      where: { id },
      data: {
        ...(dto.statusType && { statusType: dto.statusType }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate ? new Date(dto.endDate) : null
        }),
        ...(dto.value && { value: dto.value }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        version: { increment: 1 },
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Vérifie existence

    await this.prisma.animalStatusHistory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async close(id: string, dto: CloseAnimalStatusDto): Promise<AnimalStatusHistory> {
    const status = await this.findOne(id);

    if (status.endDate) {
      throw new BadRequestException('animal_status.already_closed');
    }

    return this.prisma.animalStatusHistory.update({
      where: { id },
      data: {
        endDate: new Date(dto.endDate),
        notes: dto.notes ?? status.notes,
        version: { increment: 1 },
      },
    });
  }

  async findActiveByType(
    animalId: string,
    statusType: AnimalStatusType,
  ): Promise<AnimalStatusHistory | null> {
    return this.prisma.animalStatusHistory.findFirst({
      where: {
        animalId,
        statusType,
        endDate: null,
        deletedAt: null,
      },
    });
  }

  private async validateUniqueActiveStatus(
    animalId: string,
    statusType: AnimalStatusType,
  ): Promise<void> {
    const existing = await this.findActiveByType(animalId, statusType);
    if (existing) {
      throw new ConflictException({
        message: 'animal_status.active_status_exists',
        details: { statusType, existingId: existing.id },
      });
    }
  }
}
```

### 6.3 Controller Template

```typescript
// animal-status.controller.ts
@ApiTags('Animal Status History')
@Controller('farms/:farmId/animals/:animalId/status-history')
@UseGuards(AuthGuard)
export class AnimalStatusController {
  constructor(private readonly service: AnimalStatusService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un statut physiologique' })
  @ApiResponse({ status: 201, description: 'Statut créé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Statut actif déjà existant' })
  create(
    @Param('farmId') farmId: string,
    @Param('animalId') animalId: string,
    @Body() dto: CreateAnimalStatusDto,
  ) {
    return this.service.create(farmId, animalId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des statuts (paginée)' })
  @ApiResponse({ status: 200, description: 'Liste paginée' })
  findAll(
    @Param('animalId') animalId: string,
    @Query() query: QueryAnimalStatusDto,
  ) {
    return this.service.findAll(animalId, query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Statuts actifs uniquement' })
  findActive(@Param('animalId') animalId: string) {
    return this.service.findAllActive(animalId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un statut' })
  @ApiResponse({ status: 404, description: 'Non trouvé' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un statut' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAnimalStatusDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Clôturer un statut (définir endDate)' })
  close(
    @Param('id') id: string,
    @Body() dto: CloseAnimalStatusDto,
  ) {
    return this.service.close(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un statut (soft delete)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```

---

## 7. TESTS

### 7.1 Tests Unitaires (Service)

```typescript
// animal-status.service.spec.ts
describe('AnimalStatusService', () => {
  let service: AnimalStatusService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AnimalStatusService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AnimalStatusService>(AnimalStatusService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new status', async () => {
      // ...
    });

    it('should throw ConflictException if active status exists', async () => {
      // ...
    });

    it('should throw NotFoundException if animal not found', async () => {
      // ...
    });
  });

  describe('close', () => {
    it('should set endDate on active status', async () => {
      // ...
    });

    it('should throw BadRequestException if already closed', async () => {
      // ...
    });
  });
});
```

### 7.2 Tests E2E (API)

```typescript
// animal-status.e2e-spec.ts
describe('AnimalStatus API (e2e)', () => {
  let app: INestApplication;
  let farmId: string;
  let animalId: string;

  beforeAll(async () => {
    // Setup test app
  });

  describe('POST /farms/:farmId/animals/:animalId/status-history', () => {
    it('should create gestation status', async () => {
      const response = await request(app.getHttpServer())
        .post(`/farms/${farmId}/animals/${animalId}/status-history`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          statusType: 'GESTATION',
          startDate: '2025-01-15',
          value: 'confirmed',
        })
        .expect(201);

      expect(response.body.data.statusType).toBe('GESTATION');
      expect(response.body.data.endDate).toBeNull();
    });

    it('should reject duplicate active status', async () => {
      await request(app.getHttpServer())
        .post(`/farms/${farmId}/animals/${animalId}/status-history`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          statusType: 'GESTATION',
          startDate: '2025-02-01',
          value: 'confirmed',
        })
        .expect(409);
    });
  });
});
```

---

## 8. MIGRATION ET DÉPLOIEMENT

### 8.1 Script Migration Prisma

```bash
# Générer la migration
npx prisma migrate dev --name add_animal_status_and_product_lots

# Appliquer en production
npx prisma migrate deploy
```

### 8.2 Ordre d'Exécution

1. **Mise à jour schema.prisma**
   - Ajouter enums
   - Ajouter table AnimalStatusHistory
   - Ajouter table FarmerProductLot
   - Modifier FarmProductPreference
   - Modifier Treatment
   - Modifier Animal
   - Modifier ProductPackaging

2. **Générer et appliquer migration**

3. **Déployer code backend**
   - Nouveaux modules
   - Modifications existantes

4. **Tests en staging**

5. **Déploiement production**

### 8.3 Rollback Plan

```sql
-- En cas de problème, rollback possible via:
-- 1. Supprimer les nouvelles colonnes ajoutées
-- 2. Supprimer les nouvelles tables

-- Note: Les champs batchNumber/batchExpiryDate de Treatment
-- ne doivent être supprimés qu'après confirmation du bon fonctionnement
```

---

## ANNEXES

### A. Configuration Globale Alertes

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| `EXPIRY_ALERT_DAYS` | 7 | Jours avant péremption |
| `ENABLE_GESTATION_ALERT` | true | Activer alerte contre-indication |
| `ENABLE_WITHDRAWAL_ALERT` | true | Activer alerte délai d'attente |

### B. Codes Erreur I18n

| Code | Message FR |
|------|------------|
| `animal_status.not_found` | Statut non trouvé |
| `animal_status.active_status_exists` | Un statut actif de ce type existe déjà |
| `animal_status.already_closed` | Ce statut est déjà clôturé |
| `animal_status.invalid_date_range` | La date de fin doit être après la date de début |
| `farmer_lot.not_found` | Lot non trouvé |
| `farmer_lot.expiry_date_past` | La date de péremption doit être dans le futur |
| `farmer_lot.duplicate_number` | Ce numéro de lot existe déjà |
| `product_config.dose_unit_required` | L'unité de dosage est requise avec le dosage |
| `alerts.gestation_contraindication` | Attention: animal en gestation confirmée |
| `alerts.withdrawal_active` | Attention: délai d'attente actif |
| `alerts.lot_expiring` | Attention: lot proche de la péremption |

---

**FIN DU DOCUMENT**
