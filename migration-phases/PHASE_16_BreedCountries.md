# 🔧 PHASE 16 : Breed Countries

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `breed_countries` |
| **Type** | Nouvelle table de liaison (Breed ↔ Country) |
| **Complexité** | 🟢 Simple |
| **Durée estimée** | 2h |
| **Dépendances** | ⚠️ **Phases 12 (Breeds) + 4 (Countries)** |
| **Bloc** | BLOC 3 - Liaisons Pays |

---

## 🎯 Objectifs

1. ✅ Créer table de liaison many-to-many
2. ✅ Lier races aux pays où elles sont utilisées
3. ✅ Contrainte unique (breedId + countryCode)
4. ✅ Soft delete + timestamps

---

## 📊 Schéma Prisma

```prisma
model BreedCountry {
  id          String    @id @default(uuid())
  breedId     String    @map("breed_id")
  countryCode String    @map("country_code")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  breed   Breed   @relation(fields: [breedId], references: [id], onDelete: Cascade)
  country Country @relation(fields: [countryCode], references: [code], onDelete: Cascade)

  @@unique([breedId, countryCode])
  @@index([breedId])
  @@index([countryCode])
  @@index([isActive])
  @@map("breed_countries")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

-- Créer table
CREATE TABLE breed_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breed_id UUID NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (breed_id) REFERENCES breeds(id) ON DELETE CASCADE,
  FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE,

  UNIQUE(breed_id, country_code)
);

-- Indexes
CREATE INDEX idx_breed_countries_breed_id ON breed_countries(breed_id);
CREATE INDEX idx_breed_countries_country_code ON breed_countries(country_code);
CREATE INDEX idx_breed_countries_is_active ON breed_countries(is_active);

-- Trigger
CREATE TRIGGER update_breed_countries_updated_at
    BEFORE UPDATE ON breed_countries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data : Associer races aux pays
INSERT INTO breed_countries (breed_id, country_code) VALUES
  -- Lacaune (France principalement)
  ((SELECT id FROM breeds WHERE code = 'lacaune'), 'FR'),

  -- Ouled Djellal (Algérie)
  ((SELECT id FROM breeds WHERE code = 'ouled_djellal'), 'DZ'),

  -- Mérinos (France, Espagne, Maroc, Algérie)
  ((SELECT id FROM breeds WHERE code = 'merinos'), 'FR'),
  ((SELECT id FROM breeds WHERE code = 'merinos'), 'ES'),
  ((SELECT id FROM breeds WHERE code = 'merinos'), 'MA'),
  ((SELECT id FROM breeds WHERE code = 'merinos'), 'DZ'),

  -- Holstein (international)
  ((SELECT id FROM breeds WHERE code = 'holstein'), 'FR'),
  ((SELECT id FROM breeds WHERE code = 'holstein'), 'DZ'),
  ((SELECT id FROM breeds WHERE code = 'holstein'), 'MA'),
  ((SELECT id FROM breeds WHERE code = 'holstein'), 'TN'),

  -- Brune de l'Atlas (Algérie, Maroc)
  ((SELECT id FROM breeds WHERE code = 'brune_atlas'), 'DZ'),
  ((SELECT id FROM breeds WHERE code = 'brune_atlas'), 'MA')
ON CONFLICT (breed_id, country_code) DO NOTHING;

COMMIT;
```

---

## 🚀 API (Extraits)

```typescript
@ApiTags('breed-countries')
@Controller('breed-countries')
export class BreedCountriesController {
  @Get('breed/:breedId')
  findCountriesByBreed(@Param('breedId') breedId: string) {
    return this.service.findCountriesByBreed(breedId);
  }

  @Get('country/:countryCode')
  findBreedsByCountry(@Param('countryCode') countryCode: string) {
    return this.service.findBreedsByCountry(countryCode);
  }

  @Post()
  link(@Body() dto: LinkBreedCountryDto) {
    return this.service.link(dto.breedId, dto.countryCode);
  }

  @Delete()
  unlink(@Body() dto: LinkBreedCountryDto) {
    return this.service.unlink(dto.breedId, dto.countryCode);
  }
}
```

---

## ✅ Checklist

- [ ] Table `breed_countries` créée
- [ ] Contrainte unique `(breed_id, country_code)`
- [ ] FK vers breeds + countries
- [ ] Seed data : 10+ associations
- [ ] API liste pays d'une race
- [ ] API liste races d'un pays
- [ ] Tests

**Phase 16 : TERMINÉE** ✅
