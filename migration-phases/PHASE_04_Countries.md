# 🔧 PHASE 04 : Countries

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `countries` |
| **Type** | Nouvelle table globale (référentiel international) |
| **Complexité** | 🟡 Moyenne |
| **Durée estimée** | 5h |
| **Dépendances** | Aucune (BLOC 1 - Parallèle ✅) |
| **Priorité** | 🔴 URGENT (utilisée par toutes les tables de liaison pays) |

---

## 🎯 Objectifs

1. ✅ Créer table de référence des pays (ISO 3166-1)
2. ✅ Support multi-langue (FR, EN, AR)
3. ✅ Ajouter regroupement par région
4. ✅ Seed data avec pays principaux (Algérie, France, Maghreb, Europe)
5. ✅ API CRUD complète avec filtres par région

---

## 📊 Schéma Prisma

```prisma
model Country {
  code      String   @id           // ISO 3166-1 alpha-2 (ex: "FR", "DZ")
  nameFr    String   @map("name_fr")
  nameEn    String   @map("name_en")
  nameAr    String   @map("name_ar")
  region    String?  // "Europe", "Africa", "Asia", "Americas", "Oceania"
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations (tables de liaison pays)
  breedCountries    BreedCountry[]
  productCountries  ProductCountry[]
  vaccineCountries  VaccineCountry[]
  campaignCountries CampaignCountry[]

  @@index([isActive])
  @@index([region])
  @@map("countries")
}
```

---

## 🗄️ Migration SQL

```sql
-- ============================================
-- PHASE 04 : Création table Countries
-- Référentiel international des pays
-- ============================================

BEGIN;

-- Étape 1 : Créer table
CREATE TABLE countries (
  code VARCHAR(2) PRIMARY KEY,
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  region VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Étape 2 : Créer indexes
CREATE INDEX idx_countries_is_active ON countries(is_active);
CREATE INDEX idx_countries_region ON countries(region);

-- Étape 3 : Créer trigger updated_at
CREATE TRIGGER update_countries_updated_at
    BEFORE UPDATE ON countries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 4 : Seed data - Pays prioritaires PAPS2
INSERT INTO countries (code, name_fr, name_en, name_ar, region, is_active) VALUES
  -- Maghreb (priorité 1)
  ('DZ', 'Algérie', 'Algeria', 'الجزائر', 'Africa', TRUE),
  ('MA', 'Maroc', 'Morocco', 'المغرب', 'Africa', TRUE),
  ('TN', 'Tunisie', 'Tunisia', 'تونس', 'Africa', TRUE),
  ('LY', 'Libye', 'Libya', 'ليبيا', 'Africa', TRUE),
  ('MR', 'Mauritanie', 'Mauritania', 'موريتانيا', 'Africa', TRUE),

  -- Europe Ouest (priorité 2 - élevage ovin/bovin)
  ('FR', 'France', 'France', 'فرنسا', 'Europe', TRUE),
  ('ES', 'Espagne', 'Spain', 'إسبانيا', 'Europe', TRUE),
  ('IT', 'Italie', 'Italy', 'إيطاليا', 'Europe', TRUE),
  ('PT', 'Portugal', 'Portugal', 'البرتغال', 'Europe', TRUE),
  ('GB', 'Royaume-Uni', 'United Kingdom', 'المملكة المتحدة', 'Europe', TRUE),
  ('IE', 'Irlande', 'Ireland', 'أيرلندا', 'Europe', TRUE),

  -- Europe Centrale
  ('DE', 'Allemagne', 'Germany', 'ألمانيا', 'Europe', TRUE),
  ('BE', 'Belgique', 'Belgium', 'بلجيكا', 'Europe', TRUE),
  ('NL', 'Pays-Bas', 'Netherlands', 'هولندا', 'Europe', TRUE),
  ('CH', 'Suisse', 'Switzerland', 'سويسرا', 'Europe', TRUE),
  ('AT', 'Autriche', 'Austria', 'النمسا', 'Europe', TRUE),

  -- Moyen-Orient
  ('EG', 'Égypte', 'Egypt', 'مصر', 'Africa', TRUE),
  ('SA', 'Arabie Saoudite', 'Saudi Arabia', 'المملكة العربية السعودية', 'Asia', TRUE),
  ('AE', 'Émirats Arabes Unis', 'United Arab Emirates', 'الإمارات العربية المتحدة', 'Asia', TRUE),
  ('TR', 'Turquie', 'Turkey', 'تركيا', 'Asia', TRUE),

  -- Autres Africa
  ('SN', 'Sénégal', 'Senegal', 'السنغال', 'Africa', TRUE),
  ('ML', 'Mali', 'Mali', 'مالي', 'Africa', TRUE),
  ('NE', 'Niger', 'Niger', 'النيجر', 'Africa', TRUE),
  ('BF', 'Burkina Faso', 'Burkina Faso', 'بوركينا فاسو', 'Africa', TRUE),

  -- Amérique (pour référence)
  ('US', 'États-Unis', 'United States', 'الولايات المتحدة', 'Americas', TRUE),
  ('CA', 'Canada', 'Canada', 'كندا', 'Americas', TRUE),
  ('BR', 'Brésil', 'Brazil', 'البرازيل', 'Americas', TRUE),
  ('AR', 'Argentine', 'Argentina', 'الأرجنتين', 'Americas', TRUE),

  -- Océanie
  ('AU', 'Australie', 'Australia', 'أستراليا', 'Oceania', TRUE),
  ('NZ', 'Nouvelle-Zélande', 'New Zealand', 'نيوزيلندا', 'Oceania', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Étape 5 : Vérification
SELECT code, name_fr, name_en, name_ar, region, is_active
FROM countries
ORDER BY region, name_fr;

COMMIT;
```

---

## 🚀 API NestJS

### 📄 countries.service.ts

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCountryDto) {
    // Vérifier code unique
    const existing = await this.prisma.country.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`Country with code "${dto.code}" already exists`);
    }

    return this.prisma.country.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(), // Forcer majuscules
      },
    });
  }

  async findAll(region?: string, includeInactive = false) {
    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (region) {
      where.region = region;
    }

    return this.prisma.country.findMany({
      where,
      orderBy: [
        { region: 'asc' },
        { nameFr: 'asc' },
      ],
    });
  }

  async findByRegion(region: string) {
    return this.prisma.country.findMany({
      where: { region, isActive: true },
      orderBy: { nameFr: 'asc' },
    });
  }

  async findOne(code: string) {
    const country = await this.prisma.country.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!country) {
      throw new NotFoundException(`Country with code "${code}" not found`);
    }

    return country;
  }

  async update(code: string, dto: UpdateCountryDto) {
    await this.findOne(code);

    return this.prisma.country.update({
      where: { code: code.toUpperCase() },
      data: dto,
    });
  }

  async toggleActive(code: string, isActive: boolean) {
    await this.findOne(code);

    return this.prisma.country.update({
      where: { code: code.toUpperCase() },
      data: { isActive },
    });
  }

  async remove(code: string) {
    const country = await this.findOne(code);

    // Vérifier utilisation dans les tables de liaison
    const usageCount = await this.checkUsage(code);

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete country "${code}": used in ${usageCount} breed/product/vaccine/campaign liaisons. Deactivate instead.`
      );
    }

    return this.prisma.country.delete({
      where: { code: code.toUpperCase() },
    });
  }

  private async checkUsage(code: string): Promise<number> {
    const [breeds, products, vaccines, campaigns] = await Promise.all([
      this.prisma.breedCountry.count({ where: { countryCode: code } }),
      this.prisma.productCountry.count({ where: { countryCode: code } }),
      this.prisma.vaccineCountry.count({ where: { countryCode: code } }),
      this.prisma.campaignCountry.count({ where: { countryCode: code } }),
    ]);

    return breeds + products + vaccines + campaigns;
  }

  /**
   * Retourner régions disponibles
   */
  async getRegions() {
    const regions = await this.prisma.country.findMany({
      where: { isActive: true },
      select: { region: true },
      distinct: ['region'],
      orderBy: { region: 'asc' },
    });

    return regions.map(r => r.region).filter(r => r !== null);
  }
}
```

### 📄 countries.controller.ts

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@ApiTags('countries')
@Controller('countries')
export class CountriesController {
  constructor(private readonly service: CountriesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un pays' })
  create(@Body() dto: CreateCountryDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des pays' })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  findAll(
    @Query('region') region?: string,
    @Query('includeInactive') includeInactive?: string
  ) {
    return this.service.findAll(region, includeInactive === 'true');
  }

  @Get('regions')
  @ApiOperation({ summary: 'Liste des régions' })
  getRegions() {
    return this.service.getRegions();
  }

  @Get('region/:region')
  @ApiOperation({ summary: 'Pays par région' })
  findByRegion(@Param('region') region: string) {
    return this.service.findByRegion(region);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Détails pays par code ISO' })
  findOne(@Param('code') code: string) {
    return this.service.findOne(code);
  }

  @Patch(':code')
  @ApiOperation({ summary: 'Mettre à jour un pays' })
  update(@Param('code') code: string, @Body() dto: UpdateCountryDto) {
    return this.service.update(code, dto);
  }

  @Patch(':code/toggle-active')
  @ApiOperation({ summary: 'Activer/désactiver un pays' })
  toggleActive(@Param('code') code: string, @Body('isActive') isActive: boolean) {
    return this.service.toggleActive(code, isActive);
  }

  @Delete(':code')
  @ApiOperation({ summary: 'Supprimer un pays' })
  remove(@Param('code') code: string) {
    return this.service.remove(code);
  }
}
```

### 📄 DTOs

```typescript
// create-country.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsBoolean, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCountryDto {
  @ApiProperty({
    description: 'Code ISO 3166-1 alpha-2',
    example: 'DZ'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{2}$/, { message: 'Code must be ISO 3166-1 alpha-2 (2 uppercase letters)' })
  code: string;

  @ApiProperty({ example: 'Algérie' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameFr: string;

  @ApiProperty({ example: 'Algeria' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameEn: string;

  @ApiProperty({ example: 'الجزائر' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameAr: string;

  @ApiPropertyOptional({ example: 'Africa' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  region?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// update-country.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCountryDto } from './create-country.dto';

export class UpdateCountryDto extends PartialType(
  OmitType(CreateCountryDto, ['code'] as const)
) {}
```

---

## 🧪 Tests

### Tests clés

```typescript
describe('CountriesService', () => {
  it('should create a country with uppercase code', async () => {
    const dto = {
      code: 'dz',
      nameFr: 'Algérie',
      nameEn: 'Algeria',
      nameAr: 'الجزائر',
      region: 'Africa',
    };

    const result = await service.create(dto);
    expect(result.code).toBe('DZ'); // Forcé en majuscules
  });

  it('should filter by region', async () => {
    const africaCountries = await service.findByRegion('Africa');
    expect(africaCountries.every(c => c.region === 'Africa')).toBe(true);
  });

  it('should return list of regions', async () => {
    const regions = await service.getRegions();
    expect(regions).toContain('Africa');
    expect(regions).toContain('Europe');
  });

  it('should prevent deletion if used in liaisons', async () => {
    // Simuler utilisation dans breed_countries
    mockPrisma.breedCountry.count.mockResolvedValue(5);

    await expect(service.remove('FR')).rejects.toThrow(ConflictException);
  });

  it('should allow toggling active status', async () => {
    const result = await service.toggleActive('FR', false);
    expect(result.isActive).toBe(false);

    const reactivated = await service.toggleActive('FR', true);
    expect(reactivated.isActive).toBe(true);
  });
});
```

---

## ✅ Checklist de Validation

### Prisma
- [ ] Modèle `Country` ajouté au schema
- [ ] Relations avec tables de liaison déclarées
- [ ] Migration : `npx prisma migrate dev --name create_countries`

### Base de données
- [ ] Table `countries` créée
- [ ] Indexes créés (`is_active`, `region`)
- [ ] Seed data : 30 pays minimum insérés
- [ ] Vérification : `SELECT COUNT(*) FROM countries;` retourne >= 30

### API
- [ ] CRUD complet
- [ ] Endpoint `/countries/regions` liste régions
- [ ] Endpoint `/countries/region/Africa` filtre par région
- [ ] Codes ISO forcés en majuscules
- [ ] Protection suppression si utilisé

### Tests
- [ ] Tests unitaires (coverage > 80%)
- [ ] Tests E2E
- [ ] Test validation format ISO 3166-1
- [ ] Test filtre par région
- [ ] Test protection suppression

### Validation fonctionnelle
- [ ] `GET /countries` retourne tous pays actifs
- [ ] `GET /countries?region=Africa` retourne pays africains
- [ ] `GET /countries/regions` retourne liste régions
- [ ] `GET /countries/DZ` retourne détails Algérie
- [ ] Code "dz" auto-converti en "DZ"
- [ ] Impossible supprimer pays utilisé dans liaisons

### Seed Data
- [ ] Maghreb complet (DZ, MA, TN, LY, MR)
- [ ] Europe Ouest (FR, ES, IT, PT, GB, IE)
- [ ] Moyen-Orient (EG, SA, AE, TR)
- [ ] Tous avec traductions FR/EN/AR

---

**Phase 04 : TERMINÉE** ✅
