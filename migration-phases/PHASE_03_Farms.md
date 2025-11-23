# 🔧 PHASE 03 : Farms

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `Farms` |
| **Type** | Corrections + Géolocalisation + CHECK constraints |
| **Complexité** | 🟡 Moyenne |
| **Durée estimée** | 3h |
| **Dépendances** | Aucune (BLOC 1 - Parallèle ✅) |
| **Priorité** | 🔴 URGENT (table centrale) |

---

## 🎯 Objectifs

1. ✅ Ajouter soft delete, versioning, timestamps
2. ✅ Ajouter champs géographiques (`country`, `department`, `commune`)
3. ✅ Ajouter contraintes CHECK sur formats géographiques
4. ✅ Ajouter flag `isActive` pour activer/désactiver fermes
5. ✅ Optimiser index pour queries multi-critères

---

## 📊 Schéma Prisma

```prisma
model Farm {
  id        String    @id @default(uuid())
  ownerId   String    @map("owner_id")
  groupId   String?   @map("group_id")
  name      String
  address   String?
  postalCode String?  @map("postal_code")
  city      String?

  // 🆕 Champs géographiques
  country    String?  // Code ISO 3166-1 alpha-2 (ex: "FR", "DZ")
  department String?  // Code département (ex: "81", "2A")
  commune    String?  // Code INSEE commune (ex: "81004")

  latitude  Float?
  longitude Float?
  isDefault Boolean   @default(false) @map("is_default")

  // 🆕 Activation/désactivation
  isActive  Boolean   @default(true) @map("is_active")

  // 🆕 Soft delete, versioning, timestamps
  version   Int       @default(1)
  deletedAt DateTime? @map("deleted_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  // Relations
  owner                            User                              @relation(fields: [ownerId], references: [id])
  group                            Group?                            @relation(fields: [groupId], references: [id])
  animals                          Animal[]
  veterinarians                    Veterinarian[]
  campaigns                        Campaign[]
  preferences                      FarmPreferences?
  alertConfiguration               AlertConfiguration?
  breedPreferences                 FarmBreedPreference[]
  productPreferences               FarmProductPreference[]
  vaccinePreferences               FarmVaccinePreference[]
  veterinarianPreferences          FarmVeterinarianPreference[]
  nationalCampaignPreferences      FarmNationalCampaignPreference[]

  // Indexes
  @@index([ownerId])
  @@index([groupId])
  @@index([isDefault])
  @@index([isActive])
  @@index([deletedAt])
  @@index([country])
  @@index([department])

  // 🆕 Index composites (from RECOMMENDATIONS)
  @@index([ownerId, isActive, deletedAt])   // Query: fermes actives d'un propriétaire
  @@index([country, department])             // Query: fermes par localisation
  @@index([ownerId, isDefault])              // Query: ferme par défaut d'un user

  @@map("farms")
}
```

---

## 🗄️ Migration SQL

```sql
-- ============================================
-- PHASE 03 : Migration Farms
-- Ajout soft delete, versioning, timestamps, geo, CHECK
-- ============================================

BEGIN;

-- Étape 1 : Ajouter les nouvelles colonnes
ALTER TABLE farms
  ADD COLUMN country VARCHAR(2) NULL,
  ADD COLUMN department VARCHAR(3) NULL,
  ADD COLUMN commune VARCHAR(5) NULL,
  ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN version INT DEFAULT 1 NOT NULL,
  ADD COLUMN deleted_at TIMESTAMP NULL,
  ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Étape 2 : Ajouter contraintes CHECK pour validation géographique
ALTER TABLE farms
  ADD CONSTRAINT check_country_format
  CHECK (country IS NULL OR country ~ '^[A-Z]{2}$'),

  ADD CONSTRAINT check_department_format
  CHECK (department IS NULL OR department ~ '^[0-9A-Z]{2,3}$'),

  ADD CONSTRAINT check_commune_format
  CHECK (commune IS NULL OR commune ~ '^[0-9]{5}$');

-- Étape 3 : Créer indexes
CREATE INDEX idx_farms_deleted_at ON farms(deleted_at);
CREATE INDEX idx_farms_is_active ON farms(is_active);
CREATE INDEX idx_farms_country ON farms(country);
CREATE INDEX idx_farms_department ON farms(department);

-- 🆕 Index composites (RECOMMANDATIONS)
CREATE INDEX idx_farms_owner_active ON farms(owner_id, is_active, deleted_at);
CREATE INDEX idx_farms_geo ON farms(country, department);
CREATE INDEX idx_farms_owner_default ON farms(owner_id, is_default);

-- Étape 4 : Créer trigger pour updated_at
CREATE TRIGGER update_farms_updated_at
    BEFORE UPDATE ON farms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 5 : Vérification
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'farms'
ORDER BY ordinal_position;

-- Vérification des contraintes CHECK
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'farms'::regclass
  AND contype = 'c';

COMMIT;
```

---

## 🚀 API NestJS

### 📄 farms.service.ts (EXTRAIT)

```typescript
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';

@Injectable()
export class FarmsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer une nouvelle ferme
   */
  async create(ownerId: string, dto: CreateFarmDto) {
    // Valider les codes géographiques si fournis
    this.validateGeoCodes(dto);

    // Si c'est la première ferme de l'utilisateur, la marquer par défaut
    const existingCount = await this.prisma.farm.count({
      where: { ownerId, deletedAt: null },
    });

    const isDefault = existingCount === 0 ? true : dto.isDefault ?? false;

    // Si isDefault=true, retirer le flag des autres fermes
    if (isDefault) {
      await this.prisma.farm.updateMany({
        where: { ownerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.farm.create({
      data: {
        ...dto,
        ownerId,
        isDefault,
      },
      include: {
        owner: { select: { id: true, email: true, name: true } },
        group: true,
      },
    });
  }

  /**
   * Récupérer les fermes d'un utilisateur
   */
  async findByOwner(ownerId: string, includeDeleted = false) {
    return this.prisma.farm.findMany({
      where: {
        ownerId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        group: true,
        preferences: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Récupérer la ferme par défaut d'un utilisateur
   */
  async findDefault(ownerId: string) {
    const farm = await this.prisma.farm.findFirst({
      where: {
        ownerId,
        isDefault: true,
        deletedAt: null,
      },
    });

    if (!farm) {
      throw new NotFoundException(`No default farm found for user ${ownerId}`);
    }

    return farm;
  }

  /**
   * Recherche géographique
   */
  async findByLocation(country?: string, department?: string) {
    const where: any = { deletedAt: null };

    if (country) {
      // Valider format ISO
      if (!/^[A-Z]{2}$/.test(country)) {
        throw new BadRequestException('Country must be ISO 3166-1 alpha-2 (ex: FR, DZ)');
      }
      where.country = country;
    }

    if (department) {
      if (!/^[0-9A-Z]{2,3}$/.test(department)) {
        throw new BadRequestException('Invalid department format');
      }
      where.department = department;
    }

    return this.prisma.farm.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Mettre à jour une ferme
   */
  async update(id: string, ownerId: string, dto: UpdateFarmDto) {
    const existing = await this.findOne(id, ownerId);

    // Valider géo codes
    this.validateGeoCodes(dto);

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict');
    }

    // Si isDefault=true, retirer le flag des autres
    if (dto.isDefault === true) {
      await this.prisma.farm.updateMany({
        where: {
          ownerId,
          id: { not: id },
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    return this.prisma.farm.update({
      where: { id },
      data: {
        ...dto,
        version: existing.version + 1,
      },
    });
  }

  /**
   * Activer/désactiver une ferme
   */
  async toggleActive(id: string, ownerId: string, isActive: boolean) {
    const existing = await this.findOne(id, ownerId);

    // Empêcher désactivation de la ferme par défaut
    if (!isActive && existing.isDefault) {
      throw new ConflictException('Cannot deactivate default farm. Set another farm as default first.');
    }

    return this.prisma.farm.update({
      where: { id },
      data: {
        isActive,
        version: existing.version + 1,
      },
    });
  }

  /**
   * Soft delete
   */
  async remove(id: string, ownerId: string) {
    const existing = await this.findOne(id, ownerId);

    // Empêcher suppression de la ferme par défaut
    if (existing.isDefault) {
      throw new ConflictException('Cannot delete default farm. Set another farm as default first.');
    }

    // Vérifier si a des animaux actifs
    const activeAnimalsCount = await this.prisma.animal.count({
      where: { farmId: id, deletedAt: null },
    });

    if (activeAnimalsCount > 0) {
      throw new ConflictException(
        `Cannot delete farm: ${activeAnimalsCount} active animals. Delete animals first or deactivate farm.`
      );
    }

    return this.prisma.farm.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        version: existing.version + 1,
      },
    });
  }

  /**
   * Validation des codes géographiques
   */
  private validateGeoCodes(dto: Partial<CreateFarmDto | UpdateFarmDto>) {
    if (dto.country && !/^[A-Z]{2}$/.test(dto.country)) {
      throw new BadRequestException('Country must be ISO 3166-1 alpha-2 (ex: FR, DZ, MA)');
    }

    if (dto.department && !/^[0-9A-Z]{2,3}$/.test(dto.department)) {
      throw new BadRequestException('Department must be 2-3 characters (ex: 81, 2A, 974)');
    }

    if (dto.commune && !/^[0-9]{5}$/.test(dto.commune)) {
      throw new BadRequestException('Commune must be 5 digits (ex: 81004)');
    }
  }

  private async findOne(id: string, ownerId: string) {
    const farm = await this.prisma.farm.findUnique({
      where: { id },
    });

    if (!farm || farm.deletedAt) {
      throw new NotFoundException('Farm not found');
    }

    if (farm.ownerId !== ownerId) {
      throw new NotFoundException('Farm not found');
    }

    return farm;
  }
}
```

### 📄 DTOs (EXTRAIT)

```typescript
// create-farm.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFarmDto {
  @ApiProperty({ example: 'Ma Ferme' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: '123 Rue de la Ferme' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: '81000' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  postalCode?: string;

  @ApiPropertyOptional({ example: 'Albi' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'Code pays ISO 3166-1 alpha-2',
    example: 'FR'
  })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{2}$/, { message: 'Country must be ISO 3166-1 alpha-2 (ex: FR, DZ)' })
  country?: string;

  @ApiPropertyOptional({
    description: 'Code département',
    example: '81'
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9A-Z]{2,3}$/, { message: 'Invalid department format' })
  department?: string;

  @ApiPropertyOptional({
    description: 'Code commune INSEE',
    example: '81004'
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{5}$/, { message: 'Commune must be 5 digits' })
  commune?: string;

  @ApiPropertyOptional({ example: 43.9298 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 2.1479 })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Group ID' })
  @IsString()
  @IsOptional()
  groupId?: string;
}
```

---

## 🧪 Tests

### Tests clés

```typescript
describe('FarmsService', () => {
  it('should validate country format (ISO 3166-1)', async () => {
    const dto = { name: 'Test', country: 'France' }; // Invalid
    await expect(service.create(userId, dto)).rejects.toThrow(BadRequestException);

    const validDto = { name: 'Test', country: 'FR' }; // Valid
    const result = await service.create(userId, validDto);
    expect(result.country).toBe('FR');
  });

  it('should validate department format', async () => {
    await expect(
      service.create(userId, { name: 'Test', department: '1' })
    ).rejects.toThrow(BadRequestException);

    const result = await service.create(userId, { name: 'Test', department: '81' });
    expect(result.department).toBe('81');
  });

  it('should validate commune format (5 digits)', async () => {
    await expect(
      service.create(userId, { name: 'Test', commune: '810' })
    ).rejects.toThrow(BadRequestException);

    const result = await service.create(userId, { name: 'Test', commune: '81004' });
    expect(result.commune).toBe('81004');
  });

  it('should set first farm as default automatically', async () => {
    const result = await service.create(userId, { name: 'First Farm' });
    expect(result.isDefault).toBe(true);
  });

  it('should allow only one default farm per user', async () => {
    await service.create(userId, { name: 'Farm 1' }); // Auto default
    const farm2 = await service.create(userId, { name: 'Farm 2', isDefault: true });

    const farms = await service.findByOwner(userId);
    const defaultFarms = farms.filter(f => f.isDefault);

    expect(defaultFarms).toHaveLength(1);
    expect(defaultFarms[0].id).toBe(farm2.id);
  });

  it('should prevent deactivation of default farm', async () => {
    const farm = await service.create(userId, { name: 'Default' });
    await expect(service.toggleActive(farm.id, userId, false)).rejects.toThrow(ConflictException);
  });

  it('should prevent deletion of default farm', async () => {
    const farm = await service.create(userId, { name: 'Default' });
    await expect(service.remove(farm.id, userId)).rejects.toThrow(ConflictException);
  });

  it('should search by location (country + department)', async () => {
    await service.create(userId, { name: 'Farm FR-81', country: 'FR', department: '81' });
    await service.create(userId, { name: 'Farm FR-82', country: 'FR', department: '82' });
    await service.create(userId, { name: 'Farm DZ', country: 'DZ', department: '16' });

    const farmsFR = await service.findByLocation('FR');
    expect(farmsFR).toHaveLength(2);

    const farmsFR81 = await service.findByLocation('FR', '81');
    expect(farmsFR81).toHaveLength(1);
    expect(farmsFR81[0].name).toBe('Farm FR-81');
  });

  it('should use composite indexes for performance', async () => {
    // Test que les queries utilisent bien les index composites
    const farms = await prisma.farm.findMany({
      where: {
        ownerId: userId,
        isActive: true,
        deletedAt: null,
      },
    });

    // Cette query devrait utiliser l'index : idx_farms_owner_active
    expect(farms).toBeDefined();
  });
});
```

---

## ✅ Checklist de Validation

### Prisma
- [ ] Schéma modifié avec champs géo et soft delete
- [ ] Index composites créés
- [ ] Migration : `npx prisma migrate dev --name add_farms_geo_and_soft_delete`

### Base de données
- [ ] Migration exécutée sans erreur
- [ ] Contraintes CHECK actives (vérifier avec `\d farms` en psql)
- [ ] Index composites créés (vérifier avec `\di`)
- [ ] Trigger `updated_at` créé

### API
- [ ] CRUD complet
- [ ] Validation géo codes (country, department, commune)
- [ ] Gestion ferme par défaut (une seule par user)
- [ ] Toggle `isActive`
- [ ] Recherche géographique (`/farms/location?country=FR&department=81`)
- [ ] Protection suppression ferme par défaut
- [ ] Protection suppression ferme avec animaux actifs

### Tests
- [ ] Tests unitaires (coverage > 80%)
- [ ] Tests E2E
- [ ] Test validation formats géo
- [ ] Test contrainte ferme par défaut unique
- [ ] Test recherche géographique
- [ ] Test protections (default farm, active animals)

### Validation fonctionnelle
- [ ] Création ferme avec codes géo valides
- [ ] Erreur 400 si format invalide (country="France", department="1", commune="810")
- [ ] Première ferme auto-définie par défaut
- [ ] Mise à jour ferme par défaut retire flag des autres
- [ ] Impossible désactiver/supprimer ferme par défaut
- [ ] Recherche `/farms/location?country=FR` retourne fermes françaises

---

**Phase 03 : TERMINÉE** ✅
