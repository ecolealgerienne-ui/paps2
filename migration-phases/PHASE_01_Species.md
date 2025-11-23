# 🔧 PHASE 01 : Species

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `Species` |
| **Type** | Corrections (ajout soft delete, timestamps, versioning) |
| **Complexité** | 🟢 Simple |
| **Durée estimée** | 2h |
| **Dépendances** | Aucune (BLOC 1 - Parallèle ✅) |
| **Priorité** | 🔴 URGENT (table de base pour tout le système) |

---

## 🎯 Objectifs

1. ✅ Ajouter soft delete (`deletedAt`)
2. ✅ Ajouter versioning optimiste (`version`)
3. ✅ Ajouter timestamps complets (`createdAt`, `updatedAt`)
4. ✅ Garder compatibilité avec données existantes

---

## 📊 Schéma Prisma

```prisma
model Species {
  id          String    @id                 // Existant : "bovine", "ovine", "caprine"
  nameFr      String    @map("name_fr")      // Existant
  nameEn      String    @map("name_en")      // Existant
  nameAr      String    @map("name_ar")      // Existant
  description String?                        // Existant

  // 🆕 Nouveaux champs
  version     Int       @default(1)
  deletedAt   DateTime? @map("deleted_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Relations
  breeds      Breed[]
  animals     Animal[]

  // Indexes
  @@index([deletedAt])

  @@map("species")
}
```

---

## 🗄️ Migration SQL

```sql
-- ============================================
-- PHASE 01 : Migration Species
-- Ajout soft delete, versioning, timestamps
-- ============================================

BEGIN;

-- Étape 1 : Ajouter les nouvelles colonnes
ALTER TABLE species
  ADD COLUMN version INT DEFAULT 1 NOT NULL,
  ADD COLUMN deleted_at TIMESTAMP NULL,
  ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Étape 2 : Créer index sur deleted_at
CREATE INDEX idx_species_deleted_at ON species(deleted_at);

-- Étape 3 : Créer trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_species_updated_at
    BEFORE UPDATE ON species
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 4 : Vérification
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'species'
ORDER BY ordinal_position;

COMMIT;
```

---

## 🚀 API NestJS

### 📁 Structure des fichiers

```
src/
└── species/
    ├── species.module.ts
    ├── species.controller.ts
    ├── species.service.ts
    ├── dto/
    │   ├── create-species.dto.ts
    │   ├── update-species.dto.ts
    │   └── species-response.dto.ts
    └── tests/
        ├── species.service.spec.ts
        └── species.controller.spec.ts
```

### 📄 species.module.ts

```typescript
import { Module } from '@nestjs/common';
import { SpeciesController } from './species.controller';
import { SpeciesService } from './species.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SpeciesController],
  providers: [SpeciesService],
  exports: [SpeciesService],
})
export class SpeciesModule {}
```

### 📄 dto/create-species.dto.ts

```typescript
import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpeciesDto {
  @ApiProperty({
    description: 'ID unique de l\'espèce (ex: "bovine", "ovine")',
    example: 'bovine'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  id: string;

  @ApiProperty({
    description: 'Nom en français',
    example: 'Bovin'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameFr: string;

  @ApiProperty({
    description: 'Nom en anglais',
    example: 'Bovine'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameEn: string;

  @ApiProperty({
    description: 'Nom en arabe',
    example: 'بقري'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameAr: string;

  @ApiPropertyOptional({
    description: 'Description optionnelle',
    example: 'Famille des bovins incluant vaches, taureaux, etc.'
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
```

### 📄 dto/update-species.dto.ts

```typescript
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSpeciesDto } from './create-species.dto';
import { IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSpeciesDto extends PartialType(
  OmitType(CreateSpeciesDto, ['id'] as const)
) {
  @ApiPropertyOptional({
    description: 'Version pour optimistic locking',
    example: 1
  })
  @IsInt()
  @IsOptional()
  version?: number;
}
```

### 📄 dto/species-response.dto.ts

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SpeciesResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nameFr: string;

  @ApiProperty()
  nameEn: string;

  @ApiProperty()
  nameAr: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt?: Date;
}
```

### 📄 species.service.ts

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { Species } from '@prisma/client';

@Injectable()
export class SpeciesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer une nouvelle espèce
   */
  async create(createSpeciesDto: CreateSpeciesDto): Promise<Species> {
    // Vérifier si l'ID existe déjà
    const existing = await this.prisma.species.findUnique({
      where: { id: createSpeciesDto.id },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Species with id "${createSpeciesDto.id}" already exists`);
    }

    // Si existait et était soft-deleted, le restaurer
    if (existing && existing.deletedAt) {
      return this.prisma.species.update({
        where: { id: createSpeciesDto.id },
        data: {
          ...createSpeciesDto,
          deletedAt: null,
          version: existing.version + 1,
        },
      });
    }

    // Créer nouvelle espèce
    return this.prisma.species.create({
      data: createSpeciesDto,
    });
  }

  /**
   * Récupérer toutes les espèces actives
   */
  async findAll(includeDeleted = false): Promise<Species[]> {
    return this.prisma.species.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      orderBy: { nameFr: 'asc' },
    });
  }

  /**
   * Récupérer une espèce par ID
   */
  async findOne(id: string, includeDeleted = false): Promise<Species> {
    const species = await this.prisma.species.findUnique({
      where: { id },
    });

    if (!species || (!includeDeleted && species.deletedAt)) {
      throw new NotFoundException(`Species with id "${id}" not found`);
    }

    return species;
  }

  /**
   * Mettre à jour une espèce (avec optimistic locking)
   */
  async update(id: string, updateSpeciesDto: UpdateSpeciesDto): Promise<Species> {
    const existing = await this.findOne(id);

    // Optimistic locking
    if (updateSpeciesDto.version !== undefined && existing.version !== updateSpeciesDto.version) {
      throw new ConflictException(
        `Version conflict: expected ${updateSpeciesDto.version}, found ${existing.version}`
      );
    }

    return this.prisma.species.update({
      where: { id },
      data: {
        ...updateSpeciesDto,
        version: existing.version + 1,
      },
    });
  }

  /**
   * Soft delete d'une espèce
   */
  async remove(id: string): Promise<Species> {
    const existing = await this.findOne(id);

    // Vérifier si utilisé par des breeds ou animals
    const usageCount = await this.prisma.breed.count({
      where: { speciesId: id, deletedAt: null },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete species "${id}": ${usageCount} active breeds depend on it`
      );
    }

    return this.prisma.species.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }

  /**
   * Restaurer une espèce soft-deleted
   */
  async restore(id: string): Promise<Species> {
    const species = await this.prisma.species.findUnique({
      where: { id },
    });

    if (!species) {
      throw new NotFoundException(`Species with id "${id}" not found`);
    }

    if (!species.deletedAt) {
      throw new ConflictException(`Species "${id}" is not deleted`);
    }

    return this.prisma.species.update({
      where: { id },
      data: {
        deletedAt: null,
        version: species.version + 1,
      },
    });
  }
}
```

### 📄 species.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SpeciesService } from './species.service';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { SpeciesResponseDto } from './dto/species-response.dto';

@ApiTags('species')
@Controller('species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle espèce' })
  @ApiResponse({ status: 201, description: 'Espèce créée', type: SpeciesResponseDto })
  @ApiResponse({ status: 409, description: 'Espèce existe déjà' })
  create(@Body() createSpeciesDto: CreateSpeciesDto) {
    return this.speciesService.create(createSpeciesDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les espèces' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Liste des espèces', type: [SpeciesResponseDto] })
  findAll(@Query('includeDeleted') includeDeleted?: string) {
    return this.speciesService.findAll(includeDeleted === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une espèce par ID' })
  @ApiResponse({ status: 200, description: 'Espèce trouvée', type: SpeciesResponseDto })
  @ApiResponse({ status: 404, description: 'Espèce non trouvée' })
  findOne(@Param('id') id: string) {
    return this.speciesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une espèce' })
  @ApiResponse({ status: 200, description: 'Espèce mise à jour', type: SpeciesResponseDto })
  @ApiResponse({ status: 404, description: 'Espèce non trouvée' })
  @ApiResponse({ status: 409, description: 'Conflit de version' })
  update(@Param('id') id: string, @Body() updateSpeciesDto: UpdateSpeciesDto) {
    return this.speciesService.update(id, updateSpeciesDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une espèce (soft delete)' })
  @ApiResponse({ status: 204, description: 'Espèce supprimée' })
  @ApiResponse({ status: 404, description: 'Espèce non trouvée' })
  @ApiResponse({ status: 409, description: 'Espèce utilisée par des races' })
  async remove(@Param('id') id: string) {
    await this.speciesService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restaurer une espèce supprimée' })
  @ApiResponse({ status: 200, description: 'Espèce restaurée', type: SpeciesResponseDto })
  @ApiResponse({ status: 404, description: 'Espèce non trouvée' })
  restore(@Param('id') id: string) {
    return this.speciesService.restore(id);
  }
}
```

---

## 🧪 Tests

### 📄 species.service.spec.ts

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SpeciesService } from './species.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('SpeciesService', () => {
  let service: SpeciesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    species: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    breed: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeciesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SpeciesService>(SpeciesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new species', async () => {
      const createDto = {
        id: 'bovine',
        nameFr: 'Bovin',
        nameEn: 'Bovine',
        nameAr: 'بقري',
      };

      mockPrismaService.species.findUnique.mockResolvedValue(null);
      mockPrismaService.species.create.mockResolvedValue({
        ...createDto,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(result).toHaveProperty('id', 'bovine');
      expect(mockPrismaService.species.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw ConflictException if species already exists', async () => {
      const createDto = {
        id: 'bovine',
        nameFr: 'Bovin',
        nameEn: 'Bovine',
        nameAr: 'بقري',
      };

      mockPrismaService.species.findUnique.mockResolvedValue({
        ...createDto,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should restore a soft-deleted species', async () => {
      const createDto = {
        id: 'bovine',
        nameFr: 'Bovin Updated',
        nameEn: 'Bovine',
        nameAr: 'بقري',
      };

      const existingDeleted = {
        ...createDto,
        version: 1,
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.species.findUnique.mockResolvedValue(existingDeleted);
      mockPrismaService.species.update.mockResolvedValue({
        ...createDto,
        version: 2,
        deletedAt: null,
        createdAt: existingDeleted.createdAt,
        updatedAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(result.deletedAt).toBeNull();
      expect(result.version).toBe(2);
    });
  });

  describe('findAll', () => {
    it('should return all active species', async () => {
      const species = [
        { id: 'bovine', nameFr: 'Bovin', deletedAt: null },
        { id: 'ovine', nameFr: 'Ovin', deletedAt: null },
      ];

      mockPrismaService.species.findMany.mockResolvedValue(species);

      const result = await service.findAll(false);

      expect(result).toHaveLength(2);
      expect(mockPrismaService.species.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { nameFr: 'asc' },
      });
    });

    it('should include deleted species when requested', async () => {
      mockPrismaService.species.findMany.mockResolvedValue([]);

      await service.findAll(true);

      expect(mockPrismaService.species.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { nameFr: 'asc' },
      });
    });
  });

  describe('update', () => {
    it('should update species with version increment', async () => {
      const existing = {
        id: 'bovine',
        nameFr: 'Bovin',
        version: 1,
        deletedAt: null,
      };

      const updateDto = {
        nameFr: 'Bovin Mis à Jour',
        version: 1,
      };

      mockPrismaService.species.findUnique.mockResolvedValue(existing);
      mockPrismaService.species.update.mockResolvedValue({
        ...existing,
        ...updateDto,
        version: 2,
      });

      const result = await service.update('bovine', updateDto);

      expect(result.version).toBe(2);
      expect(result.nameFr).toBe('Bovin Mis à Jour');
    });

    it('should throw ConflictException on version mismatch', async () => {
      const existing = {
        id: 'bovine',
        version: 2,
        deletedAt: null,
      };

      mockPrismaService.species.findUnique.mockResolvedValue(existing);

      await expect(
        service.update('bovine', { nameFr: 'New', version: 1 })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete species', async () => {
      const existing = {
        id: 'bovine',
        version: 1,
        deletedAt: null,
      };

      mockPrismaService.species.findUnique.mockResolvedValue(existing);
      mockPrismaService.breed.count.mockResolvedValue(0);
      mockPrismaService.species.update.mockResolvedValue({
        ...existing,
        version: 2,
        deletedAt: new Date(),
      });

      const result = await service.remove('bovine');

      expect(result.deletedAt).not.toBeNull();
      expect(result.version).toBe(2);
    });

    it('should throw ConflictException if species has active breeds', async () => {
      mockPrismaService.species.findUnique.mockResolvedValue({
        id: 'bovine',
        deletedAt: null,
      });
      mockPrismaService.breed.count.mockResolvedValue(5);

      await expect(service.remove('bovine')).rejects.toThrow(ConflictException);
    });
  });
});
```

### 📄 species.e2e.spec.ts

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('SpeciesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Nettoyer la base de données
    await prisma.species.deleteMany();
  });

  describe('POST /species', () => {
    it('should create a new species', () => {
      return request(app.getHttpServer())
        .post('/species')
        .send({
          id: 'bovine',
          nameFr: 'Bovin',
          nameEn: 'Bovine',
          nameAr: 'بقري',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBe('bovine');
          expect(res.body.version).toBe(1);
        });
    });

    it('should return 409 if species already exists', async () => {
      await prisma.species.create({
        data: {
          id: 'bovine',
          nameFr: 'Bovin',
          nameEn: 'Bovine',
          nameAr: 'بقري',
        },
      });

      return request(app.getHttpServer())
        .post('/species')
        .send({
          id: 'bovine',
          nameFr: 'Bovin',
          nameEn: 'Bovine',
          nameAr: 'بقري',
        })
        .expect(409);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/species')
        .send({
          id: 'bovine',
          // Missing required fields
        })
        .expect(400);
    });
  });

  describe('GET /species', () => {
    it('should return all active species', async () => {
      await prisma.species.createMany({
        data: [
          { id: 'bovine', nameFr: 'Bovin', nameEn: 'Bovine', nameAr: 'بقري' },
          { id: 'ovine', nameFr: 'Ovin', nameEn: 'Ovine', nameAr: 'غنم' },
        ],
      });

      return request(app.getHttpServer())
        .get('/species')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
        });
    });

    it('should exclude deleted species by default', async () => {
      await prisma.species.create({
        data: {
          id: 'bovine',
          nameFr: 'Bovin',
          nameEn: 'Bovine',
          nameAr: 'بقري',
          deletedAt: new Date(),
        },
      });

      return request(app.getHttpServer())
        .get('/species')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(0);
        });
    });
  });

  describe('PATCH /species/:id', () => {
    it('should update species', async () => {
      await prisma.species.create({
        data: {
          id: 'bovine',
          nameFr: 'Bovin',
          nameEn: 'Bovine',
          nameAr: 'بقري',
        },
      });

      return request(app.getHttpServer())
        .patch('/species/bovine')
        .send({
          nameFr: 'Bovin Mis à Jour',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.nameFr).toBe('Bovin Mis à Jour');
          expect(res.body.version).toBe(2);
        });
    });
  });

  describe('DELETE /species/:id', () => {
    it('should soft delete species', async () => {
      await prisma.species.create({
        data: {
          id: 'bovine',
          nameFr: 'Bovin',
          nameEn: 'Bovine',
          nameAr: 'بقري',
        },
      });

      await request(app.getHttpServer())
        .delete('/species/bovine')
        .expect(204);

      const deleted = await prisma.species.findUnique({
        where: { id: 'bovine' },
      });

      expect(deleted.deletedAt).not.toBeNull();
    });
  });
});
```

---

## ✅ Checklist de Validation

### Prisma
- [ ] Schéma modifié avec nouveaux champs (`version`, `deletedAt`, `createdAt`, `updatedAt`)
- [ ] Index créé sur `deletedAt`
- [ ] Migration générée : `npx prisma migrate dev --name add_species_soft_delete`

### Base de données
- [ ] Migration SQL exécutée sans erreur
- [ ] Trigger `updated_at` créé et fonctionnel
- [ ] Vérification : `SELECT * FROM species LIMIT 1;` montre les nouveaux champs

### API NestJS
- [ ] Module créé et importé dans `AppModule`
- [ ] DTOs créés et validés
- [ ] Service implémente CRUD + soft delete + restore
- [ ] Controller expose toutes les routes
- [ ] Swagger documentation générée

### Tests
- [ ] Tests unitaires passent : `npm run test species.service.spec`
- [ ] Tests E2E passent : `npm run test:e2e species.e2e.spec`
- [ ] Coverage > 80%

### Validation fonctionnelle
- [ ] `POST /species` crée une nouvelle espèce
- [ ] `GET /species` retourne uniquement les espèces actives
- [ ] `GET /species/:id` retourne une espèce spécifique
- [ ] `PATCH /species/:id` met à jour avec version increment
- [ ] `DELETE /species/:id` fait un soft delete
- [ ] `POST /species/:id/restore` restaure une espèce supprimée
- [ ] Optimistic locking fonctionne (erreur 409 sur version conflict)
- [ ] Protection contre suppression si races actives existent

---

## 📝 Notes

- **MVP** : Pas de données existantes à migrer
- **Compatibilité** : L'API reste compatible avec le frontend existant
- **Performance** : Index sur `deletedAt` optimise les queries `WHERE deletedAt IS NULL`
- **Sécurité** : Soft delete préserve l'historique et permet restauration

---

**Phase 01 : TERMINÉE** ✅
