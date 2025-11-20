# 📋 Template de Refactoring - Phase 2

## ✅ Services Complétés (3/17)

- ✅ **Sync Service** - Transactions atomiques ajoutées
- ✅ **Animals Service** - Template complet
- ✅ **Lots Service** - Refactoré

## ⏳ Services Restants (13)

### Services CRUD Simples (30min chacun)
1. Veterinarians Service
2. Medical Products Service
3. Vaccines Service
4. Administration Routes Service
5. Documents Service

### Services CRUD Avec Logique (1h chacun)
6. Treatments Service
7. Vaccinations Service
8. Movements Service
9. Breedings Service
10. Weights Service
11. Campaigns Service

### Services Avec Guards (1h chacun)
12. Alert Configurations Service
13. Farm Preferences Service

---

## 🎯 Template de Refactoring

### Étape 1: Modifier les imports

```typescript
// ❌ AVANT:
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

// ✅ APRÈS:
import { Injectable } from '@nestjs/common';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';
```

### Étape 2: Ajouter le logger

```typescript
@Injectable()
export class XxxService {
  private readonly logger = new AppLogger(XxxService.name);  // ✅ Ajouter

  constructor(private prisma: PrismaService) {}
```

### Étape 3: Refactorer chaque méthode

#### Pattern pour `create()`

```typescript
async create(farmId: string, dto: CreateXxxDto) {
  this.logger.debug(`Creating xxx in farm ${farmId}`, { /* context */ });

  try {
    const result = await this.prisma.xxx.create({ data: { ...dto, farmId } });

    this.logger.audit('Xxx created', {
      xxxId: result.id,
      farmId
    });

    return result;
  } catch (error) {
    this.logger.error(`Failed to create xxx in farm ${farmId}`, error.stack);
    throw error;
  }
}
```

#### Pattern pour `findOne()` - Remplacer NotFoundException

```typescript
// ❌ AVANT:
if (!entity) {
  throw new NotFoundException(`Xxx ${id} not found`);
}

// ✅ APRÈS:
if (!entity) {
  this.logger.warn('Xxx not found', { xxxId: id, farmId });
  throw new EntityNotFoundException(
    ERROR_CODES.XXX_NOT_FOUND,  // ⚠️ Vérifier le code existe dans error-codes.ts
    `Xxx ${id} not found`,
    { xxxId: id, farmId },
  );
}
```

#### Pattern pour `update()` - Remplacer ConflictException

```typescript
// ❌ AVANT:
if (dto.version && existing.version > dto.version) {
  throw new ConflictException({
    message: 'Version conflict',
    serverVersion: existing.version,
    serverData: existing,  // ⚠️ FUITE DE SÉCURITÉ!
  });
}

// ✅ APRÈS:
if (dto.version && existing.version > dto.version) {
  this.logger.warn('Version conflict detected', {
    xxxId: id,
    serverVersion: existing.version,
    clientVersion: dto.version,
  });

  throw new EntityConflictException(
    ERROR_CODES.VERSION_CONFLICT,
    'Version conflict detected',
    {
      xxxId: id,
      serverVersion: existing.version,
      clientVersion: dto.version,
      // ❌ PAS de serverData!
    },
  );
}
```

#### Pattern pour `update()` - Wrapper try/catch

```typescript
async update(farmId: string, id: string, dto: UpdateXxxDto) {
  this.logger.debug(`Updating xxx ${id} (version ${dto.version})`);

  const existing = await this.findOne(farmId, id);

  // Version check (voir pattern ci-dessus)

  try {
    const updated = await this.prisma.xxx.update({
      where: { id },
      data: { ...dto, version: existing.version + 1 },
    });

    this.logger.audit('Xxx updated', {
      xxxId: id,
      farmId,
      version: `${existing.version} → ${updated.version}`,
    });

    return updated;
  } catch (error) {
    this.logger.error(`Failed to update xxx ${id}`, error.stack);
    throw error;
  }
}
```

#### Pattern pour `remove()` - Soft delete

```typescript
async remove(farmId: string, id: string) {
  this.logger.debug(`Soft deleting xxx ${id}`);

  await this.findOne(farmId, id);  // Vérifie existence avec exception appropriée

  try {
    const deleted = await this.prisma.xxx.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    this.logger.audit('Xxx soft deleted', { xxxId: id, farmId });

    return deleted;
  } catch (error) {
    this.logger.error(`Failed to delete xxx ${id}`, error.stack);
    throw error;
  }
}
```

---

## 🔍 Codes d'Erreur Disponibles

Vérifier dans `/src/common/constants/error-codes.ts` :

```typescript
// Animaux
ANIMAL_NOT_FOUND
ANIMAL_MUST_BE_FEMALE
ANIMAL_MUST_BE_MALE

// Lots
LOT_NOT_FOUND

// Traitements
TREATMENT_NOT_FOUND
TREATMENT_ANIMAL_NOT_FOUND

// Vaccinations
VACCINATION_NOT_FOUND
VACCINATION_ANIMAL_NOT_FOUND

// Mouvements
MOVEMENT_NOT_FOUND
MOVEMENT_ANIMALS_NOT_FOUND

// Reproductions
BREEDING_NOT_FOUND
MOTHER_NOT_FOUND
FATHER_NOT_FOUND

// Poids
WEIGHT_NOT_FOUND
WEIGHT_ANIMAL_NOT_FOUND

// Campagnes
CAMPAIGN_NOT_FOUND
CAMPAIGN_LOT_NOT_FOUND

// Documents
DOCUMENT_NOT_FOUND

// Vétérinaires
VETERINARIAN_NOT_FOUND

// Produits médicaux
MEDICAL_PRODUCT_NOT_FOUND

// Vaccins
VACCINE_NOT_FOUND

// Voies d'administration
ADMINISTRATION_ROUTE_NOT_FOUND
ADMINISTRATION_ROUTE_ALREADY_EXISTS

// Configurations d'alertes
ALERT_CONFIGURATION_NOT_FOUND

// Préférences de ferme
FARM_PREFERENCES_NOT_FOUND

// Générique
VERSION_CONFLICT
ENTITY_NOT_FOUND
```

---

## 📝 Checklist Par Service

Pour chaque service, vérifier:

- [ ] Imports: AppLogger, exceptions, ERROR_CODES
- [ ] Logger privé ajouté
- [ ] Toutes les `NotFoundException` → `EntityNotFoundException`
- [ ] Toutes les `ConflictException` → `EntityConflictException`
- [ ] **CRITIQUE**: `serverData` supprimé de tous les conflicts
- [ ] Logging debug dans opérations importantes
- [ ] Logging audit après succès
- [ ] Logging error dans catch blocks
- [ ] Codes d'erreur appropriés utilisés
- [ ] Compilation passe sans erreurs

---

## 🚀 Commandes Utiles

### Tester la compilation

```bash
npm run build
```

### Rechercher tous les services à refactorer

```bash
grep -r "NotFoundException\|ConflictException" src/**/*.service.ts
```

### Rechercher les fuites serverData

```bash
grep -r "serverData" src/**/*.service.ts
```

### Compter les occurrences restantes

```bash
grep -rc "NotFoundException" src/**/*.service.ts | grep -v ":0"
grep -rc "ConflictException" src/**/*.service.ts | grep -v ":0"
```

---

## 📦 Services avec Guards Additionnels

### Alert Configurations Service

**En plus du refactoring standard, ajouter guards au contrôleur:**

```typescript
// src/alert-configurations/alert-configurations.controller.ts

import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@Controller('api/v1/farms/:farmId/alert-configurations')
@UseGuards(AuthGuard, FarmGuard)  // ✅ Ajouter
export class AlertConfigurationsController {
  // ... routes
}
```

### Farm Preferences Service

**Même chose:**

```typescript
// src/farm-preferences/farm-preferences.controller.ts

@Controller('api/v1/farms/:farmId/preferences')
@UseGuards(AuthGuard, FarmGuard)  // ✅ Ajouter
export class FarmPreferencesController {
  // ... routes
}
```

---

## ✅ Exemple Complet - Animals Service

Voir `/src/animals/animals.service.ts` pour l'implémentation complète de référence.

**Points clés:**
- Imports corrects
- Logger bien configuré
- Exceptions personnalisées avec codes
- Logging 3 niveaux (debug/audit/error)
- Aucun serverData dans les erreurs
- Gestion propre des try/catch

---

## 🎯 Ordre Recommandé

1. **Services Simples d'abord** (validation du pattern):
   - Veterinarians
   - Vaccines
   - Medical Products
   - Administration Routes

2. **Services Standard** (application du pattern):
   - Documents
   - Weights
   - Campaigns

3. **Services Complexes** (attention aux relations):
   - Treatments (relation avec animals)
   - Vaccinations (relation avec animals)
   - Movements (relation avec animals)
   - Breedings (relation mother/father)

4. **Services avec Guards** (derniers):
   - Alert Configurations + guards
   - Farm Preferences + guards

---

## 🔥 Points Critiques à NE PAS Oublier

1. **⚠️ SÉCURITÉ**: Supprimer `serverData: existing` de TOUS les ConflictException
2. **📍 Contexte**: Toujours passer `{ entityId, farmId }` dans les exceptions
3. **📊 Audit**: Logger TOUTES les opérations de modification (create/update/delete)
4. **🐛 Debug**: Logger le début des opérations avec contexte pertinent
5. **🔴 Erreurs**: Logger TOUTES les erreurs avec stack trace

---

## 🧪 Test Final

Après avoir terminé tous les services:

```bash
# 1. Compilation
npm run build

# 2. Vérifier qu'il ne reste plus d'anciennes exceptions
grep -r "throw new NotFoundException" src/**/*.service.ts
grep -r "throw new ConflictException" src/**/*.service.ts
grep -r "serverData" src/**/*.service.ts

# 3. Vérifier que tous les services ont le logger
grep -rc "private readonly logger = new AppLogger" src/**/*.service.ts

# 4. Commit final
git add -A
git commit -m "Phase 2 Complete: Refactor all services with custom exceptions and logging"
git push
```

---

**Temps estimé total**: ~9-10h pour les 13 services restants

**Bénéfices**:
- ✅ Codes d'erreur pour mobile i18n
- ✅ Audit trail complet
- ✅ Aucune fuite de données (serverData supprimé)
- ✅ Debugging facilité en production
- ✅ Cohérence dans toute la codebase
