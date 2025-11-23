# 🔧 PHASE 06 : Vaccines (Global)

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `vaccines` (global) |
| **Type** | Nouvelle table globale + CRUD |
| **Complexité** | 🟡 Moyenne |
| **Durée estimée** | 6h |
| **Dépendances** | Aucune (BLOC 1 - Parallèle ✅) |

---

## 📊 Schéma Prisma

```prisma
enum VaccineTargetDisease {
  brucellosis
  bluetongue
  foot_and_mouth
  rabies
  anthrax
  lumpy_skin
  ppr          // Peste Petits Ruminants
  sheep_pox
  enterotoxemia
  pasteurellosis
  other
}

model Vaccine {
  id                String               @id @default(uuid())
  code              String               @unique
  nameFr            String               @map("name_fr")
  nameEn            String               @map("name_en")
  nameAr            String               @map("name_ar")
  description       String?
  targetDisease     VaccineTargetDisease @map("target_disease")
  laboratoire       String?
  numeroAMM         String?              @map("numero_amm")
  dosageRecommande  String?              @map("dosage_recommande")
  dureeImmunite     Int?                 @map("duree_immunite")  // En jours
  version           Int                  @default(1)
  deletedAt         DateTime?            @map("deleted_at")
  createdAt         DateTime             @default(now()) @map("created_at")
  updatedAt         DateTime             @updatedAt @map("updated_at")

  vaccineCountries  VaccineCountry[]
  farmPreferences   FarmVaccinePreference[]

  @@index([code])
  @@index([targetDisease])
  @@index([deletedAt])
  @@map("vaccines")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

CREATE TYPE "VaccineTargetDisease" AS ENUM (
  'brucellosis', 'bluetongue', 'foot_and_mouth', 'rabies', 'anthrax',
  'lumpy_skin', 'ppr', 'sheep_pox', 'enterotoxemia', 'pasteurellosis', 'other'
);

CREATE TABLE vaccines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name_fr VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  name_ar VARCHAR(200) NOT NULL,
  description TEXT,
  target_disease "VaccineTargetDisease" NOT NULL,
  laboratoire VARCHAR(200),
  numero_amm VARCHAR(100),
  dosage_recommande VARCHAR(500),
  duree_immunite INT,
  version INT DEFAULT 1 NOT NULL,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_vaccines_code ON vaccines(code);
CREATE INDEX idx_vaccines_target_disease ON vaccines(target_disease);
CREATE INDEX idx_vaccines_deleted_at ON vaccines(deleted_at);

CREATE TRIGGER update_vaccines_updated_at
    BEFORE UPDATE ON vaccines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data
INSERT INTO vaccines (code, name_fr, name_en, name_ar, target_disease, laboratoire, duree_immunite) VALUES
  ('brucellose_b19', 'Brucellosis B19', 'Brucellosis B19', 'بروسيلا B19', 'brucellosis', 'Ceva', 365),
  ('fievre_aphteuse', 'Fièvre Aphteuse', 'Foot and Mouth Disease', 'الحمى القلاعية', 'foot_and_mouth', 'Merial', 180),
  ('fcov_ppr', 'FCOV PPR', 'PPR Vaccine', 'لقاح طاعون المجترات الصغيرة', 'ppr', 'Institut Pasteur', 365),
  ('clavelée', 'Clavelée', 'Sheep Pox', 'جدري الأغنام', 'sheep_pox', 'Biovac', 365),
  ('rage', 'Rage', 'Rabies', 'داء الكلب', 'rabies', 'Virbac', 365)
ON CONFLICT (code) DO NOTHING;

COMMIT;
```

---

## 🚀 API (Extraits)

```typescript
@ApiTags('vaccines')
@Controller('vaccines')
export class VaccinesController {
  @Get()
  @ApiQuery({ name: 'targetDisease', required: false, enum: VaccineTargetDisease })
  findAll(@Query('targetDisease') targetDisease?: VaccineTargetDisease) {
    return this.service.findAll({ targetDisease });
  }

  @Get('disease/:disease')
  findByDisease(@Param('disease') disease: VaccineTargetDisease) {
    return this.service.findByTargetDisease(disease);
  }
}
```

---

## ✅ Checklist

- [ ] ENUM `VaccineTargetDisease` créé
- [ ] Table `vaccines` + indexes
- [ ] Seed : 5 vaccins minimum (brucellose, fièvre aphteuse, PPR, etc.)
- [ ] API filtre par maladie
- [ ] Tests
- [ ] Protection suppression si utilisé

**Phase 06 : TERMINÉE** ✅
