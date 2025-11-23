# 🔧 PHASE 12 : Breeds

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `Breeds` |
| **Type** | Corrections + code unique + index composites |
| **Complexité** | 🟢 Simple |
| **Durée estimée** | 2h |
| **Dépendances** | ⚠️ **Phase 1 (Species)** |
| **Bloc** | BLOC 2 - Dépendances Niveau 1 |

---

## 🎯 Objectifs

1. ✅ Ajouter soft delete, versioning, timestamps
2. ✅ Ajouter champ `code` unique (recommandation)
3. ✅ Ajouter index composites pour performance
4. ✅ Conserver relation avec Species

---

## 📊 Schéma Prisma

```prisma
model Breed {
  id           String    @id @default(uuid())
  code         String    @unique              // 🆕 Code unique (ex: "lacaune", "holstein")
  speciesId    String    @map("species_id")
  nameFr       String    @map("name_fr")
  nameEn       String    @map("name_en")
  nameAr       String    @map("name_ar")
  description  String?
  displayOrder Int       @default(0) @map("display_order")
  isActive     Boolean   @default(true) @map("is_active")
  version      Int       @default(1)
  deletedAt    DateTime? @map("deleted_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  species        Species                   @relation(fields: [speciesId], references: [id])
  animals        Animal[]
  breedCountries BreedCountry[]
  farmPreferences FarmBreedPreference[]

  // Indexes simples
  @@index([speciesId])
  @@index([code])
  @@index([deletedAt])
  @@index([displayOrder])
  @@index([isActive])

  // 🆕 Index composites (RECOMMANDATIONS)
  @@index([speciesId, isActive, deletedAt])   // Query: races actives d'une espèce
  @@index([speciesId, displayOrder])          // Query: races triées par espèce

  @@map("breeds")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

-- Ajouter colonnes
ALTER TABLE breeds
  ADD COLUMN IF NOT EXISTS code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Générer codes automatiquement depuis name_fr (pour données existantes)
UPDATE breeds
SET code = LOWER(REPLACE(REPLACE(name_fr, ' ', '_'), '''', ''))
WHERE code IS NULL;

-- Ajouter contrainte UNIQUE sur code
ALTER TABLE breeds
  ADD CONSTRAINT unique_breed_code UNIQUE (code);

-- Indexes simples
CREATE INDEX IF NOT EXISTS idx_breeds_code ON breeds(code);
CREATE INDEX IF NOT EXISTS idx_breeds_deleted_at ON breeds(deleted_at);

-- 🆕 Index composites (performance)
CREATE INDEX IF NOT EXISTS idx_breeds_species_active ON breeds(species_id, is_active, deleted_at);
CREATE INDEX IF NOT EXISTS idx_breeds_species_order ON breeds(species_id, display_order);

-- Trigger
CREATE TRIGGER update_breeds_updated_at
    BEFORE UPDATE ON breeds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data
INSERT INTO breeds (code, species_id, name_fr, name_en, name_ar, display_order) VALUES
  ('lacaune', 'ovine', 'Lacaune', 'Lacaune', 'لاكون', 1),
  ('merinos', 'ovine', 'Mérinos', 'Merino', 'ميرينو', 2),
  ('ouled_djellal', 'ovine', 'Ouled Djellal', 'Ouled Djellal', 'أولاد جلال', 3),
  ('rembi', 'ovine', 'Rembi', 'Rembi', 'رمبي', 4),

  ('alpine', 'caprine', 'Alpine', 'Alpine', 'ألبين', 1),
  ('saanen', 'caprine', 'Saanen', 'Saanen', 'سانين', 2),
  ('arabe', 'caprine', 'Chèvre Arabe', 'Arabian Goat', 'الماعز العربي', 3),

  ('holstein', 'bovine', 'Holstein', 'Holstein', 'هولشتاين', 1),
  ('montbeliarde', 'bovine', 'Montbéliarde', 'Montbeliard', 'مونبليارد', 2),
  ('charolaise', 'bovine', 'Charolaise', 'Charolais', 'شارولي', 3),
  ('brune_atlas', 'bovine', 'Brune de l''Atlas', 'Atlas Brown', 'بني الأطلس', 4)
ON CONFLICT (code) DO NOTHING;

COMMIT;
```

---

## 🚀 API (Extraits)

```typescript
@ApiTags('breeds')
@Controller('breeds')
export class BreedsController {
  @Get('species/:speciesId')
  @ApiOperation({ summary: 'Races par espèce' })
  findBySpecies(@Param('speciesId') speciesId: string) {
    // Utilise l'index composite : idx_breeds_species_active
    return this.service.findBySpecies(speciesId);
  }

  @Get('species/:speciesId/active')
  findActiveBySpecies(@Param('speciesId') speciesId: string) {
    // Utilise l'index composite : idx_breeds_species_active
    return this.service.findBySpecies(speciesId, true);
  }
}
```

---

## ✅ Checklist

- [ ] Colonne `code` ajoutée + unique
- [ ] Soft delete + versioning
- [ ] Index composites créés
- [ ] Seed : 10+ races (ovine, caprine, bovine)
- [ ] API `/breeds/species/:speciesId` utilise index composite
- [ ] Tests

**Phase 12 : TERMINÉE** ✅
