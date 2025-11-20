# Plan d'Implémentation Backend - DELTA
## Correction des API pour alignement avec l'App Mobile

> **Date** : 2025-11-20
> **Basé sur** : BACKEND_DELTA.md
> **Objectif** : Implémenter toutes les modifications nécessaires pour que le backend accepte les payloads de l'App Flutter

---

## Table des Matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Phase 1 - Fondations](#2-phase-1---fondations)
3. [Phase 2 - Module Sync](#3-phase-2---module-sync)
4. [Phase 3 - Endpoints de référence](#4-phase-3---endpoints-de-référence)
5. [Phase 4 - Modules d'entités](#5-phase-4---modules-dentités)
6. [Phase 5 - Tests et validation](#6-phase-5---tests-et-validation)
7. [Checklist finale](#7-checklist-finale)

---

## 1. Vue d'ensemble

### 1.1 État Actuel

**✅ Existant :**
- Schéma Prisma : Species, Breed, Farm, Animal (partiel)
- Module Animals (CRUD basique)
- Module Auth (Keycloak JWT)
- Module Prisma

**❌ Manquant :**
- 11 tables Prisma manquantes
- Module Sync (CRITIQUE)
- Utilitaires de transformation (case-converter, enum-converter)
- 12+ modules d'entités
- Endpoints Species et Breeds

### 1.2 Priorités

| Niveau | Description | Modules concernés |
|--------|-------------|-------------------|
| 🔴 **P0 - CRITIQUE** | Sync doit fonctionner | Sync, Utils, Prisma schema complet |
| 🟠 **P1 - HAUTE** | Endpoints requis par l'App | Species, Breeds, Lots |
| 🟡 **P2 - MOYENNE** | Entités principales | Treatments, Vaccinations, Movements, Weights |
| 🟢 **P3 - BASSE** | Entités secondaires | Veterinarians, MedicalProducts, Documents, Campaigns, Breedings |

---

## 2. Phase 1 - Fondations

### 2.1 Compléter le Schéma Prisma

**Fichier :** `prisma/schema.prisma`

**Tables à ajouter :**

```prisma
// 1. Lot et LotAnimal
model Lot {
  id                  String    @id
  farm_id             String
  name                String
  type                String    // treatment, vaccination, sale, slaughter
  status              String    @default("open")
  completed           Boolean   @default(false)
  completed_at        DateTime?
  product_id          String?
  product_name        String?
  treatment_date      DateTime?
  withdrawal_end_date DateTime?
  veterinarian_id     String?
  veterinarian_name   String?
  price_total         Float?
  buyer_name          String?
  seller_name         String?
  notes               String?
  version             Int       @default(1)
  deleted_at          DateTime?
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt

  animals LotAnimal[]

  @@map("lots")
}

model LotAnimal {
  lot_id    String
  animal_id String
  added_at  DateTime @default(now())

  lot    Lot    @relation(fields: [lot_id], references: [id], onDelete: Cascade)
  // animal Animal @relation(fields: [animal_id], references: [id])

  @@id([lot_id, animal_id])
  @@map("lot_animals")
}

// 2. Treatment
model Treatment {
  id                  String    @id
  farm_id             String
  animal_id           String
  product_id          String?
  product_name        String
  treatment_date      DateTime
  diagnosis           String?
  dose                String?
  administration_route String?
  withdrawal_period_days Int?
  withdrawal_end_date DateTime?
  veterinarian_id     String?
  veterinarian_name   String?
  cost                Float?
  notes               String?
  lot_id              String?
  version             Int       @default(1)
  deleted_at          DateTime?
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt

  @@index([farm_id])
  @@index([animal_id])
  @@map("treatments")
}

// 3. Vaccination
model Vaccination {
  id                  String    @id
  farm_id             String
  animal_ids_json     String    // JSON array
  vaccine_id          String?
  vaccine_name        String
  disease             String
  vaccination_date    DateTime
  dose                String?
  administration_route String?
  batch_number        String?
  expiry_date         DateTime?
  withdrawal_period_days Int?
  withdrawal_end_date DateTime?
  veterinarian_id     String?
  veterinarian_name   String?
  cost                Float?
  notes               String?
  lot_id              String?
  version             Int       @default(1)
  deleted_at          DateTime?
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt

  @@index([farm_id])
  @@map("vaccinations")
}

// 4. Movement
model Movement {
  id                  String    @id
  farm_id             String
  animal_id           String
  type                String    // birth, purchase, sale, death, slaughter, temporary_out, temporary_return
  movement_date       DateTime
  origin_farm_id      String?
  destination_farm_id String?
  destination_farm_name String?
  price               Float?
  buyer_seller_name   String?
  death_cause         String?
  status              String    @default("closed")
  validated_at        DateTime?
  notes               String?
  lot_id              String?
  version             Int       @default(1)
  deleted_at          DateTime?
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt

  @@index([farm_id])
  @@index([animal_id])
  @@index([type])
  @@map("movements")
}

// 5. Weight
model Weight {
  id          String    @id
  farm_id     String
  animal_id   String
  weight_kg   Float
  weight_date DateTime
  notes       String?
  lot_id      String?
  version     Int       @default(1)
  deleted_at  DateTime?
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt

  @@index([farm_id])
  @@index([animal_id])
  @@map("weights")
}

// 6. Veterinarian
model Veterinarian {
  id          String    @id
  farm_id     String
  name        String
  phone       String?
  email       String?
  address     String?
  license_number String?
  notes       String?
  version     Int       @default(1)
  deleted_at  DateTime?
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt

  @@index([farm_id])
  @@map("veterinarians")
}

// 7. MedicalProduct
model MedicalProduct {
  id                  String    @id
  farm_id             String
  name                String
  type                String    // antibiotic, antiparasitic, anti_inflammatory, other
  manufacturer        String?
  active_ingredient   String?
  withdrawal_period_days Int?
  dosage_instructions String?
  stock_quantity      Float?
  unit                String?
  expiry_date         DateTime?
  notes               String?
  version             Int       @default(1)
  deleted_at          DateTime?
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt

  @@index([farm_id])
  @@map("medical_products")
}

// 8. Vaccine
model Vaccine {
  id                  String    @id
  farm_id             String
  name                String
  disease             String
  manufacturer        String?
  withdrawal_period_days Int?
  dosage_instructions String?
  stock_quantity      Int?
  expiry_date         DateTime?
  notes               String?
  version             Int       @default(1)
  deleted_at          DateTime?
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt

  @@index([farm_id])
  @@map("vaccines")
}

// 9. Document
model Document {
  id              String    @id
  farm_id         String
  animal_id       String?
  type            String    // passport, certificate, invoice, transport_cert, breeding_cert, vet_report, other
  file_name       String
  file_url        String
  file_size_bytes Int?
  mime_type       String?
  upload_date     DateTime  @default(now())
  expiry_date     DateTime?
  notes           String?
  uploaded_by     String?
  version         Int       @default(1)
  deleted_at      DateTime?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  @@index([farm_id])
  @@index([animal_id])
  @@map("documents")
}

// 10. Campaign
model Campaign {
  id                  String    @id
  farm_id             String
  name                String
  product_id          String?
  product_name        String?
  campaign_date       DateTime
  withdrawal_end_date DateTime?
  veterinarian_id     String?
  veterinarian_name   String?
  animal_ids_json     String?   // JSON array
  completed           Boolean   @default(false)
  version             Int       @default(1)
  deleted_at          DateTime?
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt

  @@index([farm_id])
  @@map("campaigns")
}

// 11. Breeding
model Breeding {
  id                      String    @id
  farm_id                 String
  mother_id               String
  father_id               String?
  father_name             String?
  method                  String    // natural, artificial_insemination
  breeding_date           DateTime
  expected_birth_date     DateTime?
  actual_birth_date       DateTime?
  expected_offspring_count Int?
  offspring_ids           String?   // JSON array
  veterinarian_id         String?
  veterinarian_name       String?
  notes                   String?
  status                  String    @default("pending")
  version                 Int       @default(1)
  deleted_at              DateTime?
  created_at              DateTime  @default(now())
  updated_at              DateTime  @updatedAt

  @@index([farm_id])
  @@index([mother_id])
  @@map("breedings")
}

// 12. SyncLog (pour tracer les syncs)
model SyncLog {
  id               String   @id @default(uuid())
  farm_id          String
  entity_type      String
  entity_id        String
  action           String   // insert, update, delete
  payload          String   // JSON
  client_timestamp DateTime
  server_timestamp DateTime @default(now())
  status           String   // synced, conflict, error
  error_message    String?

  @@index([farm_id])
  @@index([entity_type])
  @@index([entity_id])
  @@map("sync_logs")
}
```

**Actions :**
1. ✅ Ajouter toutes ces tables au fichier `schema.prisma`
2. ✅ Exécuter `npx prisma generate`
3. ✅ Exécuter `npx prisma migrate dev --name add_all_entities`

---

### 2.2 Créer les Utilitaires de Transformation

#### Fichier 1 : `src/common/utils/case-converter.ts`

```typescript
/**
 * Convertit un objet camelCase en snake_case
 */
export function camelToSnake(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  const result: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
        result[snakeKey] = camelToSnake(obj[key]);
      } else {
        result[snakeKey] = obj[key];
      }
    }
  }

  return result;
}

/**
 * Convertit un objet snake_case en camelCase
 */
export function snakeToCamel(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  const result: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
        result[camelKey] = snakeToCamel(obj[key]);
      } else {
        result[camelKey] = obj[key];
      }
    }
  }

  return result;
}
```

#### Fichier 2 : `src/common/utils/enum-converter.ts`

```typescript
export const ENUM_MAPPINGS = {
  // Movement.type
  movement_type: {
    'temporaryOut': 'temporary_out',
    'temporaryReturn': 'temporary_return',
    'birth': 'birth',
    'purchase': 'purchase',
    'sale': 'sale',
    'death': 'death',
    'slaughter': 'slaughter',
  },

  // Breeding.method
  breeding_method: {
    'natural': 'natural',
    'artificialInsemination': 'artificial_insemination',
  },

  // Document.type
  document_type: {
    'passport': 'passport',
    'certificate': 'certificate',
    'invoice': 'invoice',
    'transportCert': 'transport_cert',
    'breedingCert': 'breeding_cert',
    'vetReport': 'vet_report',
    'other': 'other',
  },

  // Animal.status
  animal_status: {
    'draft': 'draft',
    'alive': 'alive',
    'sold': 'sold',
    'dead': 'dead',
    'slaughtered': 'slaughtered',
    'onTemporaryMovement': 'on_temporary_movement',
  },

  // MedicalProduct.type
  medical_product_type: {
    'antibiotic': 'antibiotic',
    'antiparasitic': 'antiparasitic',
    'antiInflammatory': 'anti_inflammatory',
    'other': 'other',
  },
} as const;

export function convertEnumValue(
  enumType: keyof typeof ENUM_MAPPINGS,
  value: string
): string {
  const mapping = ENUM_MAPPINGS[enumType];
  return mapping[value] || value;
}

/**
 * Inverse mapping: snake_case → camelCase (pour réponses)
 */
export function convertEnumValueReverse(
  enumType: keyof typeof ENUM_MAPPINGS,
  value: string
): string {
  const mapping = ENUM_MAPPINGS[enumType];
  const reverseEntry = Object.entries(mapping).find(([_, v]) => v === value);
  return reverseEntry ? reverseEntry[0] : value;
}
```

**Actions :**
1. ✅ Créer le dossier `src/common/utils/`
2. ✅ Créer les 2 fichiers ci-dessus
3. ✅ Ajouter des tests unitaires (optionnel)

---

## 3. Phase 2 - Module Sync

### 3.1 Service de Normalisation des Payloads

**Fichier :** `src/sync/payload-normalizer.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { camelToSnake } from '../common/utils/case-converter';
import { convertEnumValue } from '../common/utils/enum-converter';

@Injectable()
export class PayloadNormalizerService {
  /**
   * Normalise le payload selon le type d'entité
   */
  normalize(entityType: string, payload: any): any {
    const camelCaseEntities = [
      'lot',
      'breeding',
      'document',
      'campaign',
      'veterinarian',
      'medicalProduct',
      'vaccine',
    ];

    let normalized = { ...payload };

    // 1. Transformer les clés si nécessaire
    if (camelCaseEntities.includes(entityType)) {
      normalized = camelToSnake(payload);
    }

    // 2. Cas spécial Animal: farmId
    if (entityType === 'animal' && payload.farmId) {
      normalized.farm_id = payload.farmId;
      delete normalized.farmId;
    }

    // 3. Convertir les enums
    normalized = this.convertEnums(entityType, normalized);

    // 4. Supprimer les champs client-only
    delete normalized.synced;
    delete normalized.last_synced_at;
    delete normalized.server_version;

    return normalized;
  }

  private convertEnums(entityType: string, payload: any): any {
    switch (entityType) {
      case 'movement':
        if (payload.type) {
          payload.type = convertEnumValue('movement_type', payload.type);
        }
        break;

      case 'breeding':
        if (payload.method) {
          payload.method = convertEnumValue('breeding_method', payload.method);
        }
        break;

      case 'document':
        if (payload.type) {
          payload.type = convertEnumValue('document_type', payload.type);
        }
        break;

      case 'animal':
        if (payload.status) {
          payload.status = convertEnumValue('animal_status', payload.status);
        }
        break;

      case 'medicalProduct':
        if (payload.type) {
          payload.type = convertEnumValue('medical_product_type', payload.type);
        }
        break;
    }

    return payload;
  }
}
```

### 3.2 Service Sync Principal

**Fichier :** `src/sync/sync.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PayloadNormalizerService } from './payload-normalizer.service';

interface SyncItem {
  farmId: string;
  entityType: string;
  entityId: string;
  action: 'insert' | 'update' | 'delete';
  payload: Record<string, any>;
  clientTimestamp: string;
}

interface SyncResult {
  entityId: string;
  success: boolean;
  serverVersion: number | null;
  error: string | null;
}

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly normalizer: PayloadNormalizerService,
  ) {}

  async processSyncBatch(items: SyncItem[]): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const item of items) {
      try {
        const result = await this.processSyncItem(item);
        results.push(result);
      } catch (error) {
        results.push({
          entityId: item.entityId,
          success: false,
          serverVersion: null,
          error: error.message,
        });
      }
    }

    return results;
  }

  private async processSyncItem(item: SyncItem): Promise<SyncResult> {
    // Normaliser le payload
    const normalizedPayload = this.normalizer.normalize(
      item.entityType,
      item.payload,
    );

    // Router vers le bon service selon entityType
    let serverVersion: number;

    switch (item.entityType) {
      case 'animal':
        serverVersion = await this.processAnimal(item.action, normalizedPayload);
        break;

      case 'lot':
        serverVersion = await this.processLot(item.action, normalizedPayload);
        break;

      case 'treatment':
        serverVersion = await this.processGeneric('treatment', item.action, normalizedPayload);
        break;

      case 'vaccination':
        serverVersion = await this.processGeneric('vaccination', item.action, normalizedPayload);
        break;

      case 'movement':
        serverVersion = await this.processGeneric('movement', item.action, normalizedPayload);
        break;

      case 'weight':
        serverVersion = await this.processGeneric('weight', item.action, normalizedPayload);
        break;

      case 'veterinarian':
        serverVersion = await this.processGeneric('veterinarian', item.action, normalizedPayload);
        break;

      case 'medicalProduct':
        serverVersion = await this.processGeneric('medicalProduct', item.action, normalizedPayload);
        break;

      case 'vaccine':
        serverVersion = await this.processGeneric('vaccine', item.action, normalizedPayload);
        break;

      case 'document':
        serverVersion = await this.processGeneric('document', item.action, normalizedPayload);
        break;

      case 'campaign':
        serverVersion = await this.processGeneric('campaign', item.action, normalizedPayload);
        break;

      case 'breeding':
        serverVersion = await this.processGeneric('breeding', item.action, normalizedPayload);
        break;

      default:
        throw new Error(`Unsupported entity type: ${item.entityType}`);
    }

    // Log le sync
    await this.logSync(item, 'synced', null);

    return {
      entityId: item.entityId,
      success: true,
      serverVersion,
      error: null,
    };
  }

  private async processAnimal(action: string, payload: any): Promise<number> {
    if (action === 'insert') {
      const created = await this.prisma.animal.create({ data: payload });
      return created.version;
    }

    if (action === 'update') {
      const existing = await this.prisma.animal.findUnique({
        where: { id: payload.id },
      });

      if (!existing) {
        throw new Error('Animal not found');
      }

      const updated = await this.prisma.animal.update({
        where: { id: payload.id },
        data: {
          ...payload,
          version: existing.version + 1,
        },
      });

      return updated.version;
    }

    if (action === 'delete') {
      await this.prisma.animal.update({
        where: { id: payload.id },
        data: { deleted_at: new Date() },
      });
      return 0;
    }

    throw new Error(`Unsupported action: ${action}`);
  }

  private async processLot(action: string, payload: any): Promise<number> {
    const { animal_ids, ...lotData } = payload;

    if (action === 'insert') {
      const created = await this.prisma.lot.create({ data: lotData });

      // Créer les relations LotAnimal
      if (animal_ids?.length) {
        await this.prisma.lotAnimal.createMany({
          data: animal_ids.map((animalId: string) => ({
            lot_id: created.id,
            animal_id: animalId,
            added_at: new Date(),
          })),
        });
      }

      return created.version;
    }

    if (action === 'update') {
      const existing = await this.prisma.lot.findUnique({
        where: { id: lotData.id },
      });

      if (!existing) {
        throw new Error('Lot not found');
      }

      const updated = await this.prisma.lot.update({
        where: { id: lotData.id },
        data: {
          ...lotData,
          version: existing.version + 1,
        },
      });

      // Synchroniser les animalIds
      if (animal_ids !== undefined) {
        await this.prisma.lotAnimal.deleteMany({
          where: { lot_id: lotData.id },
        });

        if (animal_ids.length) {
          await this.prisma.lotAnimal.createMany({
            data: animal_ids.map((animalId: string) => ({
              lot_id: lotData.id,
              animal_id: animalId,
              added_at: new Date(),
            })),
          });
        }
      }

      return updated.version;
    }

    if (action === 'delete') {
      await this.prisma.lot.update({
        where: { id: lotData.id },
        data: { deleted_at: new Date() },
      });
      return 0;
    }

    throw new Error(`Unsupported action: ${action}`);
  }

  private async processGeneric(
    modelName: string,
    action: string,
    payload: any,
  ): Promise<number> {
    const model = this.prisma[modelName];

    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    if (action === 'insert') {
      const created = await model.create({ data: payload });
      return created.version || 1;
    }

    if (action === 'update') {
      const existing = await model.findUnique({ where: { id: payload.id } });

      if (!existing) {
        throw new Error(`${modelName} not found`);
      }

      const updated = await model.update({
        where: { id: payload.id },
        data: {
          ...payload,
          version: (existing.version || 0) + 1,
        },
      });

      return updated.version;
    }

    if (action === 'delete') {
      await model.update({
        where: { id: payload.id },
        data: { deleted_at: new Date() },
      });
      return 0;
    }

    throw new Error(`Unsupported action: ${action}`);
  }

  private async logSync(
    item: SyncItem,
    status: string,
    error: string | null,
  ): Promise<void> {
    await this.prisma.syncLog.create({
      data: {
        farm_id: item.farmId,
        entity_type: item.entityType,
        entity_id: item.entityId,
        action: item.action,
        payload: JSON.stringify(item.payload),
        client_timestamp: new Date(item.clientTimestamp),
        status,
        error_message: error,
      },
    });
  }
}
```

### 3.3 Controller Sync

**Fichier :** `src/sync/sync.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { AuthGuard } from '../auth/guards/auth.guard';

interface SyncRequest {
  items: Array<{
    farmId: string;
    entityType: string;
    entityId: string;
    action: 'insert' | 'update' | 'delete';
    payload: Record<string, any>;
    clientTimestamp: string;
  }>;
}

@Controller('api/v1/sync')
@UseGuards(AuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  async sync(@Body() request: SyncRequest) {
    const results = await this.syncService.processSyncBatch(request.items);

    return {
      success: true,
      results,
    };
  }
}
```

### 3.4 Module Sync

**Fichier :** `src/sync/sync.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { PayloadNormalizerService } from './payload-normalizer.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SyncController],
  providers: [SyncService, PayloadNormalizerService],
})
export class SyncModule {}
```

**Actions :**
1. ✅ Créer le dossier `src/sync/`
2. ✅ Créer les 4 fichiers ci-dessus
3. ✅ Ajouter `SyncModule` dans `app.module.ts`

---

## 4. Phase 3 - Endpoints de Référence

### 4.1 Module Species

**Fichier :** `src/species/species.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpeciesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.species.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }
}
```

**Fichier :** `src/species/species.controller.ts`

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { SpeciesService } from './species.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('api/v1/species')
@UseGuards(AuthGuard)
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Get()
  async findAll() {
    const species = await this.speciesService.findAll();

    return {
      success: true,
      data: species.map((s) => ({
        id: s.id,
        name_fr: s.nameFr,
        name_en: s.nameEn,
        name_ar: s.nameAr,
        icon: s.icon,
        display_order: s.displayOrder,
      })),
    };
  }
}
```

**Fichier :** `src/species/species.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { SpeciesController } from './species.controller';
import { SpeciesService } from './species.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SpeciesController],
  providers: [SpeciesService],
})
export class SpeciesModule {}
```

### 4.2 Module Breeds

**Fichier :** `src/breeds/breeds.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BreedsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(speciesId?: string) {
    return this.prisma.breed.findMany({
      where: speciesId ? { speciesId, isActive: true } : { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }
}
```

**Fichier :** `src/breeds/breeds.controller.ts`

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BreedsService } from './breeds.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('api/v1/breeds')
@UseGuards(AuthGuard)
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  @Get()
  async findAll(@Query('speciesId') speciesId?: string) {
    const breeds = await this.breedsService.findAll(speciesId);

    return {
      success: true,
      data: breeds.map((b) => ({
        id: b.id,
        species_id: b.speciesId,
        name_fr: b.nameFr,
        name_en: b.nameEn,
        name_ar: b.nameAr,
        description: b.description,
        display_order: b.displayOrder,
        is_active: b.isActive,
      })),
    };
  }
}
```

**Fichier :** `src/breeds/breeds.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { BreedsController } from './breeds.controller';
import { BreedsService } from './breeds.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BreedsController],
  providers: [BreedsService],
})
export class BreedsModule {}
```

**Actions :**
1. ✅ Créer `src/species/` avec les 3 fichiers
2. ✅ Créer `src/breeds/` avec les 3 fichiers
3. ✅ Ajouter `SpeciesModule` et `BreedsModule` dans `app.module.ts`

---

## 5. Phase 4 - Modules d'Entités

### 5.1 Modules Simples (CRUD Générique)

Pour les entités suivantes, créer des modules CRUD basiques :

**Entités :**
- Veterinarians
- MedicalProducts
- Vaccines
- Documents
- Campaigns
- Breedings

**Template de module :**

```typescript
// src/{entity}/{entity}.module.ts
import { Module } from '@nestjs/common';
import { {Entity}Controller } from './{entity}.controller';
import { {Entity}Service } from './{entity}.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [{Entity}Controller],
  providers: [{Entity}Service],
  exports: [{Entity}Service],
})
export class {Entity}Module {}
```

**Template de service :**

```typescript
// src/{entity}/{entity}.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class {Entity}Service {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(farmId: string) {
    return this.prisma.{entity}.findMany({
      where: { farm_id: farmId, deleted_at: null },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.{entity}.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.{entity}.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.{entity}.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.{entity}.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
```

**Template de controller :**

```typescript
// src/{entity}/{entity}.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { {Entity}Service } from './{entity}.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/v1/farms/:farmId/{entities}')
@UseGuards(AuthGuard, FarmGuard)
export class {Entity}Controller {
  constructor(private readonly {entity}Service: {Entity}Service) {}

  @Get()
  async findAll(@Param('farmId') farmId: string) {
    const data = await this.{entity}Service.findAll(farmId);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.{entity}Service.findOne(id);
    return { success: true, data };
  }

  @Post()
  async create(@Param('farmId') farmId: string, @Body() body: any) {
    const data = await this.{entity}Service.create({ ...body, farm_id: farmId });
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.{entity}Service.update(id, body);
    return { success: true, data };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.{entity}Service.delete(id);
    return { success: true };
  }
}
```

**Actions :**
Pour chaque entité :
1. ✅ Créer le dossier `src/{entity}/`
2. ✅ Créer les 3 fichiers (module, service, controller)
3. ✅ Ajouter le module dans `app.module.ts`

---

### 5.2 Modules avec Logique Spécifique

**Lots** : Déjà géré dans `sync.service.ts`, mais créer un module dédié si besoin de GET

**Treatments, Vaccinations, Movements, Weights** :
- Créer les modules CRUD avec le template ci-dessus
- Ajouter des filtres par `animal_id` dans les services

---

## 6. Phase 5 - Tests et Validation

### 6.1 Données de Seed

**Fichier :** `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Species
  await prisma.species.createMany({
    data: [
      {
        id: 'sheep',
        nameFr: 'Ovin',
        nameEn: 'Sheep',
        nameAr: 'أغنام',
        icon: '🐑',
        displayOrder: 1,
      },
      {
        id: 'cattle',
        nameFr: 'Bovin',
        nameEn: 'Cattle',
        nameAr: 'أبقار',
        icon: '🐄',
        displayOrder: 2,
      },
      {
        id: 'goat',
        nameFr: 'Caprin',
        nameEn: 'Goat',
        nameAr: 'ماعز',
        icon: '🐐',
        displayOrder: 3,
      },
    ],
    skipDuplicates: true,
  });

  // Seed Breeds
  await prisma.breed.createMany({
    data: [
      {
        id: 'ouled-djellal',
        speciesId: 'sheep',
        nameFr: 'Ouled Djellal',
        nameEn: 'Ouled Djellal',
        nameAr: 'أولاد جلال',
        description: 'Race ovine algérienne',
        displayOrder: 1,
        isActive: true,
      },
      {
        id: 'rembi',
        speciesId: 'sheep',
        nameFr: 'Rembi',
        nameEn: 'Rembi',
        nameAr: 'الرمبي',
        description: 'Race ovine algérienne',
        displayOrder: 2,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed completed');
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

**Action :**
1. ✅ Créer `prisma/seed.ts`
2. ✅ Ajouter dans `package.json` :
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```
3. ✅ Exécuter : `npx prisma db seed`

### 6.2 Tests Manuels

**Test 1 : Endpoint Sync**

```bash
curl -X POST http://localhost:3000/api/v1/sync \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "farmId": "farm-uuid",
        "entityType": "animal",
        "entityId": "animal-uuid",
        "action": "insert",
        "payload": {
          "id": "animal-uuid",
          "farmId": "farm-uuid",
          "current_eid": "123456789012345",
          "official_number": "DZ-001-2025",
          "birth_date": "2024-01-15T00:00:00Z",
          "sex": "male",
          "status": "alive"
        },
        "clientTimestamp": "2025-11-20T10:00:00Z"
      }
    ]
  }'
```

**Test 2 : Endpoint Species**

```bash
curl http://localhost:3000/api/v1/species \
  -H "Authorization: Bearer {token}"
```

**Test 3 : Endpoint Breeds**

```bash
curl "http://localhost:3000/api/v1/breeds?speciesId=sheep" \
  -H "Authorization: Bearer {token}"
```

---

## 7. Checklist Finale

### 7.1 Schéma Prisma
- [ ] Toutes les 12 tables ajoutées
- [ ] Migrations exécutées
- [ ] Seed exécuté

### 7.2 Utilitaires
- [ ] `case-converter.ts` créé
- [ ] `enum-converter.ts` créé
- [ ] Tests unitaires (optionnel)

### 7.3 Module Sync
- [ ] `payload-normalizer.service.ts` créé
- [ ] `sync.service.ts` créé
- [ ] `sync.controller.ts` créé
- [ ] `sync.module.ts` créé
- [ ] Ajouté dans `app.module.ts`

### 7.4 Modules de Référence
- [ ] Module Species créé
- [ ] Module Breeds créé
- [ ] Ajoutés dans `app.module.ts`

### 7.5 Modules d'Entités
- [ ] Module Veterinarians
- [ ] Module MedicalProducts
- [ ] Module Vaccines
- [ ] Module Documents
- [ ] Module Campaigns
- [ ] Module Breedings
- [ ] Module Treatments
- [ ] Module Vaccinations
- [ ] Module Movements
- [ ] Module Weights
- [ ] Module Lots (optionnel)

### 7.6 Tests
- [ ] Test sync avec Animal
- [ ] Test sync avec Lot
- [ ] Test sync avec Movement (enum conversion)
- [ ] Test Species endpoint
- [ ] Test Breeds endpoint
- [ ] Test format réponse sync (pas de `data.results`, juste `results`)

---

## 8. Ordre d'Exécution Recommandé

### Jour 1 : Fondations
1. ✅ Compléter `schema.prisma` (toutes les tables)
2. ✅ Exécuter migrations
3. ✅ Créer les utilitaires (`case-converter`, `enum-converter`)
4. ✅ Créer le seed et l'exécuter

### Jour 2 : Module Sync (CRITIQUE)
1. ✅ Créer `payload-normalizer.service.ts`
2. ✅ Créer `sync.service.ts`
3. ✅ Créer `sync.controller.ts`
4. ✅ Créer `sync.module.ts`
5. ✅ Ajouter `SyncModule` dans `app.module.ts`
6. ✅ Tester endpoint sync

### Jour 3 : Endpoints de Référence
1. ✅ Créer module Species
2. ✅ Créer module Breeds
3. ✅ Tester les 2 endpoints

### Jour 4-5 : Modules d'Entités
1. ✅ Créer tous les modules restants (6-10 modules)
2. ✅ Tester chaque endpoint

### Jour 6 : Tests et Validation
1. ✅ Tests end-to-end avec l'App Flutter
2. ✅ Vérifier tous les cas de BACKEND_DELTA.md
3. ✅ Documenter les problèmes restants

---

## 9. Estimation Totale

| Phase | Durée | Priorité |
|-------|-------|----------|
| Phase 1 - Fondations | 4h | 🔴 P0 |
| Phase 2 - Module Sync | 6h | 🔴 P0 |
| Phase 3 - Endpoints Référence | 2h | 🟠 P1 |
| Phase 4 - Modules Entités | 8h | 🟡 P2-P3 |
| Phase 5 - Tests | 4h | 🟡 P2 |
| **TOTAL** | **24h** | **~3 jours** |

---

*Document créé le 2025-11-20*
*Basé sur BACKEND_DELTA.md et BACKEND_SPECS.md*
