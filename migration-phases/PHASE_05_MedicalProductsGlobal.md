# 🔧 PHASE 05 : Medical Products (Global)

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `medical_products` (global) |
| **Type** | Nouvelle table globale + CRUD complet |
| **Complexité** | 🟡 Moyenne |
| **Durée estimée** | 6h |
| **Dépendances** | Aucune (BLOC 1 - Parallèle ✅) |
| **Priorité** | 🔴 URGENT |

---

## 🎯 Objectifs

1. ✅ Créer table globale `medical_products` (catalogue international)
2. ✅ Supporte multi-langue + code unique
3. ✅ Champs métier : type, principeActif, laboratoire, AMM
4. ✅ Soft delete + versioning
5. ✅ API CRUD avec filtres (type, laboratoire)

---

## 📊 Schéma Prisma

```prisma
enum MedicalProductType {
  antibiotic
  antiparasitic
  anti_inflammatory
  vitamin
  vaccine
  anesthetic
  hormone
  other
}

model MedicalProduct {
  id                String              @id @default(uuid())
  code              String              @unique               // Code unique (ex: "enrofloxacine_100")
  nameFr            String              @map("name_fr")
  nameEn            String              @map("name_en")
  nameAr            String              @map("name_ar")
  description       String?
  type              MedicalProductType
  principeActif     String?             @map("principe_actif")
  laboratoire       String?
  numeroAMM         String?             @map("numero_amm")    // Autorisation Mise sur le Marché
  version           Int                 @default(1)
  deletedAt         DateTime?           @map("deleted_at")
  createdAt         DateTime            @default(now()) @map("created_at")
  updatedAt         DateTime            @updatedAt @map("updated_at")

  // Relations
  productCountries  ProductCountry[]
  farmPreferences   FarmProductPreference[]

  @@index([code])
  @@index([type])
  @@index([laboratoire])
  @@index([deletedAt])
  @@map("medical_products")
}
```

---

## 🗄️ Migration SQL

```sql
-- ============================================
-- PHASE 05 : Création MedicalProduct (global)
-- ============================================

BEGIN;

-- Étape 1 : Créer ENUM type
CREATE TYPE "MedicalProductType" AS ENUM (
  'antibiotic',
  'antiparasitic',
  'anti_inflammatory',
  'vitamin',
  'vaccine',
  'anesthetic',
  'hormone',
  'other'
);

-- Étape 2 : Créer table
CREATE TABLE medical_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name_fr VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  name_ar VARCHAR(200) NOT NULL,
  description TEXT,
  type "MedicalProductType" NOT NULL,
  principe_actif VARCHAR(200),
  laboratoire VARCHAR(200),
  numero_amm VARCHAR(100),
  version INT DEFAULT 1 NOT NULL,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Étape 3 : Indexes
CREATE INDEX idx_medical_products_code ON medical_products(code);
CREATE INDEX idx_medical_products_type ON medical_products(type);
CREATE INDEX idx_medical_products_laboratoire ON medical_products(laboratoire);
CREATE INDEX idx_medical_products_deleted_at ON medical_products(deleted_at);

-- Étape 4 : Trigger
CREATE TRIGGER update_medical_products_updated_at
    BEFORE UPDATE ON medical_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 5 : Seed data
INSERT INTO medical_products (code, name_fr, name_en, name_ar, type, principe_actif, laboratoire) VALUES
  ('enrofloxacine_100', 'Enrofloxacine 10%', 'Enrofloxacin 10%', 'إنروفلوكساسين 10%', 'antibiotic', 'Enrofloxacine', 'Ceva'),
  ('oxytetracycline_200', 'Oxytétracycline 200mg', 'Oxytetracycline 200mg', 'أوكسي تتراسيكلين 200 ملغ', 'antibiotic', 'Oxytétracycline', 'Zoetis'),
  ('ivermectine_1', 'Ivermectine 1%', 'Ivermectin 1%', 'إيفرمكتين 1%', 'antiparasitic', 'Ivermectine', 'Merial'),
  ('meloxicam_5', 'Méloxicam 5mg/ml', 'Meloxicam 5mg/ml', 'ميلوكسيكام 5 ملغ/مل', 'anti_inflammatory', 'Méloxicam', 'Boehringer'),
  ('vitamine_ad3e', 'Vitamine AD3E', 'Vitamin AD3E', 'فيتامين AD3E', 'vitamin', 'Vitamines A, D3, E', 'Virbac')
ON CONFLICT (code) DO NOTHING;

COMMIT;
```

---

## 🚀 API NestJS (Extraits)

### Service

```typescript
@Injectable()
export class MedicalProductsService {
  async create(dto: CreateMedicalProductDto) {
    // Vérifier code unique
    const existing = await this.prisma.medicalProduct.findUnique({
      where: { code: dto.code },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Product with code "${dto.code}" exists`);
    }

    if (existing && existing.deletedAt) {
      return this.restore(existing.id);
    }

    return this.prisma.medicalProduct.create({ data: dto });
  }

  async findAll(filters?: { type?: MedicalProductType; laboratoire?: string }) {
    const where: any = { deletedAt: null };

    if (filters?.type) where.type = filters.type;
    if (filters?.laboratoire) where.laboratoire = { contains: filters.laboratoire, mode: 'insensitive' };

    return this.prisma.medicalProduct.findMany({
      where,
      orderBy: { nameFr: 'asc' },
    });
  }

  async findByType(type: MedicalProductType) {
    return this.prisma.medicalProduct.findMany({
      where: { type, deletedAt: null },
      orderBy: { nameFr: 'asc' },
    });
  }

  async update(id: string, dto: UpdateMedicalProductDto) {
    const existing = await this.findOne(id);

    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict');
    }

    return this.prisma.medicalProduct.update({
      where: { id },
      data: { ...dto, version: existing.version + 1 },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);

    // Vérifier utilisation
    const usageCount = await this.prisma.farmProductPreference.count({
      where: { globalProductId: id },
    });

    if (usageCount > 0) {
      throw new ConflictException(`Product used in ${usageCount} farm preferences`);
    }

    return this.prisma.medicalProduct.update({
      where: { id },
      data: { deletedAt: new Date(), version: existing.version + 1 },
    });
  }
}
```

### Controller

```typescript
@ApiTags('medical-products')
@Controller('medical-products')
export class MedicalProductsController {
  @Get()
  @ApiQuery({ name: 'type', required: false, enum: MedicalProductType })
  @ApiQuery({ name: 'laboratoire', required: false })
  findAll(
    @Query('type') type?: MedicalProductType,
    @Query('laboratoire') laboratoire?: string
  ) {
    return this.service.findAll({ type, laboratoire });
  }

  @Get('type/:type')
  findByType(@Param('type') type: MedicalProductType) {
    return this.service.findByType(type);
  }

  // CRUD standard...
}
```

---

## ✅ Checklist

- [ ] ENUM `MedicalProductType` créé
- [ ] Table `medical_products` créée avec indexes
- [ ] Seed data : 5 produits minimum
- [ ] API CRUD complète
- [ ] Endpoint `/medical-products?type=antibiotic` fonctionne
- [ ] Endpoint `/medical-products?laboratoire=Ceva` fonctionne
- [ ] Tests unitaires + E2E
- [ ] Protection suppression si utilisé dans farm_product_preferences

---

**Phase 05 : TERMINÉE** ✅
