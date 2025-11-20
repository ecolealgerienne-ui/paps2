# AniTra Backend - Document DELTA
## Corrections à apporter sur les API existantes

> **Objectif** : Ce document liste les modifications à effectuer sur le backend existant pour aligner les signatures API avec ce que l'App mobile envoie réellement.
>
> **Date** : 2025-11-19
> **Basé sur** : Analyse du code App Flutter vs BACKEND_SPECS.md

---

## Table des Matières

1. [Résumé des changements](#1-résumé-des-changements)
2. [Endpoint Sync - Format Requête/Réponse](#2-endpoint-sync---format-requêteréponse)
3. [Payloads par Entité - Conventions JSON](#3-payloads-par-entité---conventions-json)
4. [Conversion des Enums](#4-conversion-des-enums)
5. [Endpoints Manquants à Ajouter](#5-endpoints-manquants-à-ajouter)
6. [Gestion Lot.animalIds](#6-gestion-lotanimalids)
7. [Code de Transformation](#7-code-de-transformation)

---

## 1. Résumé des Changements

### Vue d'ensemble

| Catégorie | Nombre de changements | Priorité |
|-----------|----------------------|----------|
| Format réponse sync | 1 | 🔴 CRITIQUE |
| Convention JSON (camelCase) | 6 entités | 🔴 CRITIQUE |
| Conversion enums | 5 valeurs | 🟠 HAUTE |
| Endpoints manquants | 2 | 🟠 HAUTE |
| Structure Lot.animalIds | 1 | 🟠 HAUTE |

### Entités impactées

| Entité | Convention toJson() | Action requise |
|--------|---------------------|----------------|
| Animal | snake_case (sauf `farmId`) | Accepter `farmId` en camelCase |
| Treatment | snake_case | ✅ OK |
| Vaccination | snake_case | ✅ OK |
| Movement | snake_case | Convertir enums |
| WeightRecord | snake_case | ✅ OK |
| **Lot** | **camelCase** | **Transformer tout** |
| **Breeding** | **camelCase** | **Transformer tout** |
| **Document** | **camelCase** | **Transformer tout** |
| **Campaign** | **camelCase** | **Transformer tout** |
| **Veterinarian** | **camelCase** | **Transformer tout** |
| **MedicalProduct** | **camelCase** | **Transformer tout** |

---

## 2. Endpoint Sync - Format Requête/Réponse

### 2.1 Requête reçue de l'App

```typescript
// POST /api/v1/sync
// Headers: Authorization: Bearer {token}, Content-Type: application/json

interface SyncRequest {
  items: SyncItem[];
}

interface SyncItem {
  farmId: string;           // ⚠️ camelCase (pas farm_id)
  entityType: string;       // 'animal', 'lot', 'breeding', etc.
  entityId: string;
  action: 'insert' | 'update' | 'delete';
  payload: Record<string, any>;  // Format variable selon entityType
  clientTimestamp: string;  // ISO8601
}
```

### 2.2 Réponse à retourner

**❌ ANCIEN FORMAT (BACKEND_SPECS.md) :**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "sync-queue-item-uuid",
        "entityId": "animal-uuid",
        "status": "synced",
        "serverVersion": 1
      }
    ]
  }
}
```

**✅ NOUVEAU FORMAT (Ce que l'App attend) :**
```json
{
  "success": true,
  "results": [
    {
      "entityId": "animal-uuid",
      "success": true,
      "serverVersion": 1,
      "error": null
    }
  ]
}
```

### 2.3 Changements à faire

```typescript
// src/sync/sync.controller.ts

// AVANT
return {
  success: true,
  data: {
    results: results.map(r => ({
      id: r.queueItemId,
      entityId: r.entityId,
      status: r.success ? 'synced' : 'error',
      serverVersion: r.version,
    })),
  },
};

// APRÈS
return {
  success: true,
  results: results.map(r => ({
    entityId: r.entityId,
    success: r.success,
    serverVersion: r.version,
    error: r.error || null,
  })),
};
```

---

## 3. Payloads par Entité - Conventions JSON

### 3.1 Animal

L'App envoie `farmId` en camelCase mais le reste en snake_case.

```typescript
// Payload reçu de l'App
{
  "id": "uuid",
  "farmId": "uuid",                  // ⚠️ camelCase
  "current_location_farm_id": "uuid",
  "current_eid": "string",
  "official_number": "string",
  "birth_date": "ISO8601",
  "sex": "male",
  "mother_id": "uuid",
  "status": "alive",
  "validated_at": "ISO8601",
  "species_id": "string",
  "breed_id": "string",
  "visual_id": "string",
  "photo_url": "string",
  "notes": "string",
  "eid_history": [...],              // Array JSON
  "synced": false,
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "last_synced_at": "ISO8601",
  "server_version": "string"
}
```

**Action :** Dans le DTO, accepter `farmId` OU `farm_id`

```typescript
// src/animals/dto/create-animal.dto.ts
export class CreateAnimalDto {
  @IsOptional()
  @IsString()
  farmId?: string;

  @IsOptional()
  @IsString()
  farm_id?: string;

  get normalizedFarmId(): string {
    return this.farmId || this.farm_id;
  }
  // ... autres champs
}
```

### 3.2 Lot - **TRANSFORMATION COMPLÈTE**

L'App envoie **tout en camelCase**.

```typescript
// Payload reçu de l'App
{
  "id": "uuid",
  "farmId": "uuid",
  "name": "string",
  "type": "treatment",
  "status": "open",
  "completed": false,
  "completedAt": "ISO8601",
  "animalIds": ["uuid1", "uuid2"],    // ⚠️ Array direct
  "productId": "string",
  "productName": "string",
  "treatmentDate": "ISO8601",
  "withdrawalEndDate": "ISO8601",
  "veterinarianId": "string",
  "veterinarianName": "string",
  "priceTotal": 5000.0,
  "buyerName": "string",
  "sellerName": "string",
  "notes": "string",
  "synced": false,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "lastSyncedAt": "ISO8601",
  "serverVersion": "string"
}
```

**Mapping camelCase → snake_case :**

| App envoie | Prisma attend |
|------------|---------------|
| `farmId` | `farm_id` |
| `completedAt` | `completed_at` |
| `animalIds` | Table `LotAnimal` |
| `productId` | `product_id` |
| `productName` | `product_name` |
| `treatmentDate` | `treatment_date` |
| `withdrawalEndDate` | `withdrawal_end_date` |
| `veterinarianId` | `veterinarian_id` |
| `veterinarianName` | `veterinarian_name` |
| `priceTotal` | `price_total` |
| `buyerName` | `buyer_name` |
| `sellerName` | `seller_name` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |
| `lastSyncedAt` | `last_synced_at` |
| `serverVersion` | `server_version` |

### 3.3 Breeding - **TRANSFORMATION COMPLÈTE**

```typescript
// Payload reçu de l'App
{
  "id": "uuid",
  "farmId": "uuid",
  "motherId": "uuid",
  "fatherId": "uuid",
  "fatherName": "string",
  "method": "artificialInsemination",  // ⚠️ Enum camelCase
  "breedingDate": "ISO8601",
  "expectedBirthDate": "ISO8601",
  "actualBirthDate": "ISO8601",
  "expectedOffspringCount": 2,
  "offspringIds": ["uuid"],
  "veterinarianId": "string",
  "veterinarianName": "string",
  "notes": "string",
  "status": "pending",
  "synced": false,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Mapping :**

| App envoie | Prisma attend |
|------------|---------------|
| `farmId` | `farm_id` |
| `motherId` | `mother_id` |
| `fatherId` | `father_id` |
| `fatherName` | `father_name` |
| `breedingDate` | `breeding_date` |
| `expectedBirthDate` | `expected_birth_date` |
| `actualBirthDate` | `actual_birth_date` |
| `expectedOffspringCount` | `expected_offspring_count` |
| `offspringIds` | `offspring_ids` |
| `veterinarianId` | `veterinarian_id` |
| `veterinarianName` | `veterinarian_name` |

### 3.4 Document - **TRANSFORMATION COMPLÈTE**

```typescript
// Payload reçu de l'App
{
  "id": "uuid",
  "farmId": "uuid",
  "animalId": "uuid",
  "type": "transportCert",           // ⚠️ Enum camelCase
  "fileName": "string",
  "fileUrl": "string",
  "fileSizeBytes": 1024,
  "mimeType": "application/pdf",
  "uploadDate": "ISO8601",
  "expiryDate": "ISO8601",
  "notes": "string",
  "uploadedBy": "userId",
  "synced": false,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Mapping :**

| App envoie | Prisma attend |
|------------|---------------|
| `farmId` | `farm_id` |
| `animalId` | `animal_id` |
| `fileName` | `file_name` |
| `fileUrl` | `file_url` |
| `fileSizeBytes` | `file_size_bytes` |
| `mimeType` | `mime_type` |
| `uploadDate` | `upload_date` |
| `expiryDate` | `expiry_date` |
| `uploadedBy` | `uploaded_by` |

### 3.5 Campaign - **TRANSFORMATION COMPLÈTE**

```typescript
// Payload reçu de l'App
{
  "id": "uuid",
  "farmId": "uuid",
  "name": "string",
  "productId": "string",
  "productName": "string",
  "campaignDate": "ISO8601",
  "withdrawalEndDate": "ISO8601",
  "veterinarianId": "string",
  "veterinarianName": "string",
  "animalIds": ["uuid1", "uuid2"],
  "completed": false,
  "synced": false,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Note :** `animalIds` dans l'App vs `animal_ids_json` dans Prisma

### 3.6 Veterinarian - **TRANSFORMATION COMPLÈTE**

Tous les champs sauf `farm_id` sont en camelCase.

### 3.7 MedicalProduct - **TRANSFORMATION COMPLÈTE**

Tous les champs sont en camelCase.

---

## 4. Conversion des Enums

### 4.1 Mapping des valeurs

```typescript
// src/common/utils/enum-converter.ts

export const ENUM_MAPPINGS = {
  // Movement.type
  movement_type: {
    'temporaryOut': 'temporary_out',
    'temporaryReturn': 'temporary_return',
    // Les autres sont identiques
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
};

export function convertEnumValue(
  enumType: keyof typeof ENUM_MAPPINGS,
  value: string
): string {
  return ENUM_MAPPINGS[enumType][value] || value;
}
```

### 4.2 Utilisation dans les services

```typescript
// src/sync/sync.service.ts

private normalizePayload(entityType: string, payload: any): any {
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
  }

  return payload;
}
```

---

## 5. Endpoints Manquants à Ajouter

### 5.1 GET /api/v1/species

L'App a besoin des espèces pour les dropdowns.

```typescript
// src/species/species.controller.ts

@Controller('api/v1/species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Get()
  async findAll() {
    const species = await this.speciesService.findAll();
    return {
      success: true,
      data: species.map(s => ({
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

### 5.2 GET /api/v1/breeds

```typescript
// src/breeds/breeds.controller.ts

@Controller('api/v1/breeds')
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  @Get()
  async findAll(@Query('speciesId') speciesId?: string) {
    const breeds = speciesId
      ? await this.breedsService.findBySpeciesId(speciesId)
      : await this.breedsService.findAll();

    return {
      success: true,
      data: breeds.map(b => ({
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

---

## 6. Gestion Lot.animalIds

### 6.1 Problème

L'App envoie :
```json
{
  "id": "lot-uuid",
  "animalIds": ["animal-1", "animal-2", "animal-3"]
}
```

Prisma a une table de relation :
```prisma
model LotAnimal {
  lotId     String
  animalId  String
  addedAt   DateTime
  @@id([lotId, animalId])
}
```

### 6.2 Solution

```typescript
// src/lots/lots.service.ts

async createOrUpdateLot(payload: any, action: string) {
  const { animalIds, ...lotData } = payload;

  // Transformer les champs
  const prismaData = this.camelToSnake(lotData);

  if (action === 'insert') {
    // Créer le lot
    const lot = await this.prisma.lot.create({
      data: prismaData,
    });

    // Créer les relations LotAnimal
    if (animalIds?.length) {
      await this.prisma.lotAnimal.createMany({
        data: animalIds.map(animalId => ({
          lotId: lot.id,
          animalId,
          addedAt: new Date(),
        })),
      });
    }

    return lot;
  }

  if (action === 'update') {
    // Mettre à jour le lot
    const lot = await this.prisma.lot.update({
      where: { id: prismaData.id },
      data: prismaData,
    });

    // Synchroniser les animalIds
    if (animalIds) {
      // Supprimer les anciennes relations
      await this.prisma.lotAnimal.deleteMany({
        where: { lotId: lot.id },
      });

      // Créer les nouvelles
      if (animalIds.length) {
        await this.prisma.lotAnimal.createMany({
          data: animalIds.map(animalId => ({
            lotId: lot.id,
            animalId,
            addedAt: new Date(),
          })),
        });
      }
    }

    return lot;
  }
}
```

---

## 7. Code de Transformation

### 7.1 Utilitaire camelCase → snake_case

```typescript
// src/common/utils/case-converter.ts

export function camelToSnake(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Convertir la clé
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

      // Récursion pour les objets imbriqués
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        result[snakeKey] = camelToSnake(obj[key]);
      } else {
        result[snakeKey] = obj[key];
      }
    }
  }

  return result;
}

export function snakeToCamel(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Convertir la clé
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

      // Récursion pour les objets imbriqués
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        result[camelKey] = snakeToCamel(obj[key]);
      } else {
        result[camelKey] = obj[key];
      }
    }
  }

  return result;
}
```

### 7.2 Service de normalisation complet

```typescript
// src/sync/payload-normalizer.service.ts

import { Injectable } from '@nestjs/common';
import { camelToSnake } from '../common/utils/case-converter';
import { convertEnumValue, ENUM_MAPPINGS } from '../common/utils/enum-converter';

@Injectable()
export class PayloadNormalizerService {

  /**
   * Normaliser le payload selon le type d'entité
   */
  normalize(entityType: string, payload: any): any {
    // Entités qui nécessitent transformation camelCase → snake_case
    const camelCaseEntities = [
      'lot', 'breeding', 'document', 'campaign',
      'veterinarian', 'medicalProduct'
    ];

    let normalized = payload;

    // 1. Transformer les clés si nécessaire
    if (camelCaseEntities.includes(entityType)) {
      normalized = camelToSnake(payload);
    }

    // 2. Cas spécial Animal: juste farmId
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
    }

    return payload;
  }
}
```

### 7.3 Intégration dans le SyncService

```typescript
// src/sync/sync.service.ts

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly normalizer: PayloadNormalizerService,
    private readonly lotsService: LotsService,
    // ... autres services
  ) {}

  async processSyncBatch(items: SyncItem[]): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const item of items) {
      try {
        // Normaliser le payload
        const normalizedPayload = this.normalizer.normalize(
          item.entityType,
          item.payload
        );

        // Traiter selon le type
        let result;
        switch (item.entityType) {
          case 'lot':
            result = await this.lotsService.createOrUpdateLot(
              normalizedPayload,
              item.action
            );
            break;
          // ... autres cas
          default:
            result = await this.genericProcess(
              item.entityType,
              normalizedPayload,
              item.action
            );
        }

        results.push({
          entityId: item.entityId,
          success: true,
          serverVersion: result.version,
          error: null,
        });

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
}
```

---

## 8. Checklist de Validation

Après avoir appliqué ces modifications, vérifier :

### 8.1 Tests de format

- [ ] Envoyer un Animal avec `farmId` (camelCase) → Accepté
- [ ] Envoyer un Lot tout en camelCase → Transformé en snake_case
- [ ] Envoyer un Movement avec `temporaryOut` → Converti en `temporary_out`
- [ ] Réponse sync contient `success: true` (pas `status: "synced"`)

### 8.2 Tests fonctionnels

- [ ] `POST /api/v1/sync` avec batch d'items → Tous traités
- [ ] `GET /api/v1/species` → Liste des espèces retournée
- [ ] `GET /api/v1/breeds` → Liste des races retournée
- [ ] `GET /api/v1/breeds?speciesId=sheep` → Races filtrées

### 8.3 Tests de régression

- [ ] Les endpoints CRUD existants fonctionnent toujours
- [ ] L'authentification Keycloak fonctionne
- [ ] Les conflits de version sont détectés

---

## 9. Détails Complémentaires (Vérification Approfondie)

### 9.1 Format des Réponses d'Erreur

L'App parse les erreurs de deux manières selon le contexte :

**Erreur globale (400, 500, etc.) :**
```json
{
  "message": "Description de l'erreur",
  // OU
  "error": "Description de l'erreur"
}
```

**Erreur par item dans un batch :**
```json
{
  "success": true,
  "results": [
    {
      "entityId": "uuid-1",
      "success": true,
      "serverVersion": 1
    },
    {
      "entityId": "uuid-2",
      "success": false,
      "error": "Validation failed: officialNumber required"
    }
  ]
}
```

⚠️ **Important** : Utiliser `error` (pas `message`) pour les erreurs par item.

### 9.2 Documents et Upload de Fichiers

**Pas d'endpoint d'upload dédié requis.**

L'App stocke les fichiers séparément (stockage local ou cloud) et ne transmet que les métadonnées via sync :

```typescript
// Le payload Document contient uniquement les métadonnées
{
  "id": "doc-uuid",
  "farmId": "farm-uuid",
  "animalId": "animal-uuid",  // optionnel
  "type": "passport",
  "fileName": "passport_FR1234.pdf",
  "fileUrl": "file:///local/path/or/https://storage.com/...",
  "fileSizeBytes": 245000,
  "mimeType": "application/pdf",
  // ...
}
```

Si vous souhaitez implémenter un stockage côté serveur, ajoutez un endpoint séparé :
```typescript
POST /api/v1/documents/upload
Content-Type: multipart/form-data

// Retourne l'URL du fichier stocké
{
  "fileUrl": "https://storage.yourserver.com/documents/abc123.pdf"
}
```

### 9.3 Pagination - NON REQUISE

Les endpoints Species et Breeds doivent retourner **TOUTES** les données en une seule réponse :

```typescript
// GET /api/v1/species
{
  "success": true,
  "data": [
    // Toutes les espèces, triées par displayOrder
  ]
}

// GET /api/v1/breeds
{
  "success": true,
  "data": [
    // Toutes les races, triées par displayOrder
  ]
}

// GET /api/v1/breeds?speciesId=sheep
{
  "success": true,
  "data": [
    // Races filtrées par espèce
  ]
}
```

Ces données de référence sont peu nombreuses (< 100 items) et chargées au démarrage de l'App.

### 9.4 Keycloak - Refresh Token Flow

Le backend doit supporter le refresh token flow standard OAuth2 :

**Endpoint** : `POST /realms/{realm}/protocol/openid-connect/token`

**Request :**
```
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
client_id=mobile-app
client_secret=xxx (optionnel)
refresh_token=eyJhbG...
```

**Response Success (200) :**
```json
{
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG...",
  "expires_in": 300,
  "token_type": "Bearer"
}
```

**Response Error (400/401) :**
L'App efface tous les tokens et l'utilisateur doit se reconnecter.

### 9.5 Codes HTTP Attendus

| Code | Signification | Action App |
|------|---------------|------------|
| 200/201 | Succès | Parse résultats |
| 400 | Validation error | Marque item en erreur, ne retry pas |
| 401 | Token expiré | Tente refresh, puis re-auth |
| 403 | Accès refusé | Affiche erreur, ne retry pas |
| 409 | Conflit de version | Parse résultats pour détails |
| 500/502/503 | Erreur serveur | Retry avec backoff |

### 9.6 DocumentType Enum Values

L'App envoie ces valeurs exactes (camelCase) :
```typescript
type DocumentType =
  | 'passport'       // Passeport bovin
  | 'certificate'    // Certificat sanitaire
  | 'invoice'        // Facture
  | 'transportCert'  // Certificat de transport
  | 'breedingCert'   // Certificat de saillie
  | 'vetReport'      // Rapport vétérinaire
  | 'other';         // Autre
```

Convertir en snake_case pour Prisma :
```typescript
const documentTypeMap: Record<string, string> = {
  'transportCert': 'transport_cert',
  'breedingCert': 'breeding_cert',
  'vetReport': 'vet_report',
  // autres sont identiques
};
```

---

## 10. Résumé des Fichiers à Modifier

| Fichier | Modifications |
|---------|---------------|
| `src/sync/sync.controller.ts` | Format réponse |
| `src/sync/sync.service.ts` | Intégrer normalizer |
| `src/common/utils/case-converter.ts` | **CRÉER** |
| `src/common/utils/enum-converter.ts` | **CRÉER** |
| `src/sync/payload-normalizer.service.ts` | **CRÉER** |
| `src/lots/lots.service.ts` | Gérer animalIds |
| `src/species/species.controller.ts` | **CRÉER** endpoint |
| `src/breeds/breeds.controller.ts` | **CRÉER** endpoint |
| DTOs des entités | Accepter camelCase |

---

*Document généré le 2025-11-19, mis à jour le 2025-11-20*
*À utiliser avec BACKEND_SPECS.md*
