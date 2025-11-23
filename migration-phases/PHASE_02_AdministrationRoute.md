# 🔧 PHASE 02 : AdministrationRoute

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `AdministrationRoute` |
| **Type** | Corrections (ajout soft delete, timestamps, versioning) |
| **Complexité** | 🟢 Simple |
| **Durée estimée** | 2h |
| **Dépendances** | Aucune (BLOC 1 - Parallèle ✅) |
| **Priorité** | 🔴 URGENT |

---

## 🎯 Objectifs

1. ✅ Ajouter soft delete (`deletedAt`)
2. ✅ Ajouter versioning optimiste (`version`)
3. ✅ Ajouter timestamps complets (`createdAt`, `updatedAt`)
4. ✅ Conserver code unique (validation métier)

---

## 📊 Schéma Prisma

```prisma
model AdministrationRoute {
  id          String    @id @default(uuid())
  code        String    @unique                // Existant : "oral", "injectable", etc.
  nameFr      String    @map("name_fr")         // Existant
  nameEn      String    @map("name_en")         // Existant
  nameAr      String    @map("name_ar")         // Existant
  description String?                           // Existant

  // 🆕 Nouveaux champs
  version     Int       @default(1)
  deletedAt   DateTime? @map("deleted_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Relations
  treatments  Treatment[]

  // Indexes
  @@index([code])
  @@index([deletedAt])

  @@map("administration_routes")
}
```

---

## 🗄️ Migration SQL

```sql
-- ============================================
-- PHASE 02 : Migration AdministrationRoute
-- Ajout soft delete, versioning, timestamps
-- ============================================

BEGIN;

-- Étape 1 : Ajouter les nouvelles colonnes
ALTER TABLE administration_routes
  ADD COLUMN version INT DEFAULT 1 NOT NULL,
  ADD COLUMN deleted_at TIMESTAMP NULL,
  ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Étape 2 : Créer index sur deleted_at
CREATE INDEX idx_administration_routes_deleted_at ON administration_routes(deleted_at);

-- Étape 3 : Créer trigger pour updated_at (si pas déjà créé en Phase 01)
-- (Si fonction existe déjà, cette commande sera ignorée)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_administration_routes_updated_at
    BEFORE UPDATE ON administration_routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 4 : Vérification
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'administration_routes'
ORDER BY ordinal_position;

COMMIT;
```

---

## 🚀 API NestJS

### 📁 Structure

```
src/administration-routes/
├── administration-routes.module.ts
├── administration-routes.controller.ts
├── administration-routes.service.ts
├── dto/
│   ├── create-administration-route.dto.ts
│   ├── update-administration-route.dto.ts
│   └── administration-route-response.dto.ts
└── tests/
    └── administration-routes.service.spec.ts
```

### 📄 administration-routes.service.ts (EXTRAIT)

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdministrationRouteDto } from './dto/create-administration-route.dto';
import { UpdateAdministrationRouteDto } from './dto/update-administration-route.dto';

@Injectable()
export class AdministrationRoutesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAdministrationRouteDto) {
    // Vérifier code unique
    const existing = await this.prisma.administrationRoute.findUnique({
      where: { code: dto.code },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Administration route with code "${dto.code}" already exists`);
    }

    // Si soft-deleted, restaurer
    if (existing && existing.deletedAt) {
      return this.prisma.administrationRoute.update({
        where: { id: existing.id },
        data: {
          ...dto,
          deletedAt: null,
          version: existing.version + 1,
        },
      });
    }

    return this.prisma.administrationRoute.create({ data: dto });
  }

  async findAll(includeDeleted = false) {
    return this.prisma.administrationRoute.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const route = await this.prisma.administrationRoute.findUnique({
      where: { id },
    });

    if (!route || route.deletedAt) {
      throw new NotFoundException(`Administration route with id "${id}" not found`);
    }

    return route;
  }

  async findByCode(code: string) {
    const route = await this.prisma.administrationRoute.findUnique({
      where: { code },
    });

    if (!route || route.deletedAt) {
      throw new NotFoundException(`Administration route with code "${code}" not found`);
    }

    return route;
  }

  async update(id: string, dto: UpdateAdministrationRouteDto) {
    const existing = await this.findOne(id);

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict');
    }

    return this.prisma.administrationRoute.update({
      where: { id },
      data: {
        ...dto,
        version: existing.version + 1,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);

    // Vérifier utilisation dans treatments
    const usageCount = await this.prisma.treatment.count({
      where: { administrationRouteId: id, deletedAt: null },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete: ${usageCount} active treatments use this route`
      );
    }

    return this.prisma.administrationRoute.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }

  async restore(id: string) {
    const route = await this.prisma.administrationRoute.findUnique({
      where: { id },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    if (!route.deletedAt) {
      throw new ConflictException('Route is not deleted');
    }

    return this.prisma.administrationRoute.update({
      where: { id },
      data: {
        deletedAt: null,
        version: route.version + 1,
      },
    });
  }
}
```

### 📄 administration-routes.controller.ts (EXTRAIT)

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdministrationRoutesService } from './administration-routes.service';
import { CreateAdministrationRouteDto } from './dto/create-administration-route.dto';
import { UpdateAdministrationRouteDto } from './dto/update-administration-route.dto';

@ApiTags('administration-routes')
@Controller('administration-routes')
export class AdministrationRoutesController {
  constructor(private readonly service: AdministrationRoutesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une voie d\'administration' })
  create(@Body() dto: CreateAdministrationRouteDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des voies d\'administration' })
  findAll(@Query('includeDeleted') includeDeleted?: string) {
    return this.service.findAll(includeDeleted === 'true');
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Recherche par code' })
  findByCode(@Param('code') code: string) {
    return this.service.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdministrationRouteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.service.restore(id);
  }
}
```

### 📄 DTOs (EXTRAIT)

```typescript
// create-administration-route.dto.ts
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateAdministrationRouteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameFr: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameEn: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameAr: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

// update-administration-route.dto.ts
import { PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { CreateAdministrationRouteDto } from './create-administration-route.dto';

export class UpdateAdministrationRouteDto extends PartialType(CreateAdministrationRouteDto) {
  @IsInt()
  @IsOptional()
  version?: number;
}
```

---

## 🧪 Tests

### 📄 Test principal (spec extract)

```typescript
describe('AdministrationRoutesService', () => {
  it('should create a new route', async () => {
    const dto = {
      code: 'oral',
      nameFr: 'Voie orale',
      nameEn: 'Oral route',
      nameAr: 'الطريق الفموي',
    };

    const result = await service.create(dto);
    expect(result.code).toBe('oral');
    expect(result.version).toBe(1);
  });

  it('should prevent duplicate codes', async () => {
    await service.create({ code: 'oral', ... });
    await expect(service.create({ code: 'oral', ... })).rejects.toThrow(ConflictException);
  });

  it('should restore soft-deleted route with same code', async () => {
    const created = await service.create({ code: 'oral', ... });
    await service.remove(created.id);

    const restored = await service.create({ code: 'oral', ... });
    expect(restored.id).toBe(created.id);
    expect(restored.deletedAt).toBeNull();
    expect(restored.version).toBe(2);
  });

  it('should soft delete route', async () => {
    const created = await service.create({ code: 'oral', ... });
    const deleted = await service.remove(created.id);

    expect(deleted.deletedAt).not.toBeNull();
    expect(deleted.version).toBe(2);
  });

  it('should prevent deletion if used by treatments', async () => {
    const route = await service.create({ code: 'oral', ... });

    // Simuler un treatment qui utilise cette route
    mockPrisma.treatment.count.mockResolvedValue(5);

    await expect(service.remove(route.id)).rejects.toThrow(ConflictException);
  });
});
```

---

## ✅ Checklist de Validation

### Prisma
- [ ] Schéma modifié avec nouveaux champs
- [ ] Index créés (`code`, `deletedAt`)
- [ ] Migration générée : `npx prisma migrate dev --name add_administration_route_soft_delete`

### Base de données
- [ ] Migration SQL exécutée
- [ ] Trigger `updated_at` créé
- [ ] Vérification : colonnes `version`, `deleted_at`, `created_at`, `updated_at` présentes

### API
- [ ] Module créé et enregistré
- [ ] CRUD complet implémenté
- [ ] Endpoint `/code/:code` pour recherche par code
- [ ] Soft delete + restore fonctionnels
- [ ] Protection contre suppression si utilisé

### Tests
- [ ] Tests unitaires passent (coverage > 80%)
- [ ] Tests E2E passent
- [ ] Test de contrainte unique sur `code`
- [ ] Test de soft delete + restore
- [ ] Test de protection contre suppression

### Validation fonctionnelle
- [ ] Création réussie avec code unique
- [ ] Erreur 409 si code dupliqué
- [ ] Restauration automatique si code existait (soft-deleted)
- [ ] Soft delete incrémente version
- [ ] Recherche par code fonctionne
- [ ] Liste exclut les soft-deleted par défaut

---

**Phase 02 : TERMINÉE** ✅
