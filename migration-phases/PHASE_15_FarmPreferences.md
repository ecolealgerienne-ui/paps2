# 🔧 PHASE 15 : Farm Preferences

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `FarmPreferences` |
| **Type** | Corrections + ENUM (Language, WeightUnit, Currency) |
| **Complexité** | 🟡 Moyenne |
| **Durée estimée** | 2h |
| **Dépendances** | ⚠️ **Phase 3 (Farms)** |
| **Bloc** | BLOC 2 - Dépendances Niveau 1 |

---

## 📊 Schéma Prisma

```prisma
// 🆕 ENUMs (RECOMMANDATIONS)
enum Language {
  fr
  en
  ar
}

enum WeightUnit {
  kg
  lb
}

enum Currency {
  DZD  // Dinar algérien
  EUR  // Euro
  USD  // Dollar
  MAD  // Dirham marocain
}

model FarmPreferences {
  id                     String     @id @default(uuid())
  farmId                 String     @unique @map("farm_id")
  defaultVeterinarianId  String?    @map("default_veterinarian_id")
  defaultSpeciesId       String?    @map("default_species_id")
  defaultBreedId         String?    @map("default_breed_id")

  // 🆕 ENUM au lieu de String (URGENT - RECOMMANDATIONS)
  weightUnit             WeightUnit @default(kg) @map("weight_unit")
  currency               Currency   @default(DZD)
  language               Language   @default(fr)

  dateFormat             String     @default("DD/MM/YYYY") @map("date_format")
  enableNotifications    Boolean    @default(true) @map("enable_notifications")
  version                Int        @default(1)
  deletedAt              DateTime?  @map("deleted_at")
  createdAt              DateTime   @default(now()) @map("created_at")
  updatedAt              DateTime   @updatedAt @map("updated_at")

  farm Farm @relation(fields: [farmId], references: [id], onDelete: Cascade)

  @@index([deletedAt])
  @@map("farm_preferences")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

-- 🆕 Créer les types ENUM (RECOMMANDATIONS URGENTES)
CREATE TYPE "Language" AS ENUM ('fr', 'en', 'ar');
CREATE TYPE "WeightUnit" AS ENUM ('kg', 'lb');
CREATE TYPE "Currency" AS ENUM ('DZD', 'EUR', 'USD', 'MAD');

-- Ajouter colonnes
ALTER TABLE farm_preferences
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- 🆕 Modifier colonnes pour utiliser ENUM (si existaient en String)
-- MVP : Pas de données, donc on peut directement changer le type
ALTER TABLE farm_preferences
  ALTER COLUMN language TYPE "Language" USING language::"Language",
  ALTER COLUMN weight_unit TYPE "WeightUnit" USING weight_unit::"WeightUnit",
  ALTER COLUMN currency TYPE "Currency" USING currency::"Currency";

-- Définir defaults
ALTER TABLE farm_preferences
  ALTER COLUMN language SET DEFAULT 'fr',
  ALTER COLUMN weight_unit SET DEFAULT 'kg',
  ALTER COLUMN currency SET DEFAULT 'DZD';

-- Index
CREATE INDEX IF NOT EXISTS idx_farm_preferences_deleted_at ON farm_preferences(deleted_at);

-- Trigger
CREATE TRIGGER update_farm_preferences_updated_at
    BEFORE UPDATE ON farm_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## 🚀 API (Extraits)

```typescript
// DTOs avec ENUM validation
export class UpdateFarmPreferencesDto {
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @IsEnum(WeightUnit)
  @IsOptional()
  weightUnit?: WeightUnit;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  // ...
}

@ApiTags('farm-preferences')
@Controller('farm-preferences')
export class FarmPreferencesController {
  @Get('farm/:farmId')
  findByFarm(@Param('farmId') farmId: string) {
    return this.service.findByFarm(farmId);
  }

  @Patch('farm/:farmId')
  update(@Param('farmId') farmId: string, @Body() dto: UpdateFarmPreferencesDto) {
    return this.service.update(farmId, dto);
  }
}
```

---

## ✅ Checklist

- [ ] ✅ ENUMs créés (Language, WeightUnit, Currency)
- [ ] Colonnes modifiées pour utiliser ENUMs
- [ ] Soft delete + versioning
- [ ] API validation ENUM automatique
- [ ] Tests : erreur 400 si valeur invalide (ex: language="french")
- [ ] Defaults corrects (fr, kg, DZD)

**Phase 15 : TERMINÉE** ✅

---

## 🎉 **FIN DU BLOC 2** (15/24 phases)

✅ **Dépendances Niveau 1 terminées** → On peut passer au BLOC 3 !
