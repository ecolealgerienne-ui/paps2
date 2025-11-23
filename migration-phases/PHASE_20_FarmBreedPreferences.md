# 🔧 PHASE 20 : Farm Breed Preferences

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `farm_breed_preferences` |
| **Type** | Nouvelle table de préférences |
| **Complexité** | 🟡 Moyenne |
| **Durée estimée** | 3h |
| **Dépendances** | ⚠️ **Phases 3 (Farms) + 12 (Breeds) + 16 (BreedCountries)** |
| **Bloc** | BLOC 4 - Préférences Ferme |

---

## 📊 Schéma Prisma

```prisma
model FarmBreedPreference {
  id          String    @id @default(uuid())
  farmId      String    @map("farm_id")
  breedId     String    @map("breed_id")
  displayOrder Int      @default(0) @map("display_order")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  farm  Farm  @relation(fields: [farmId], references: [id], onDelete: Cascade)
  breed Breed @relation(fields: [breedId], references: [id], onDelete: Cascade)

  @@unique([farmId, breedId])
  @@index([farmId])
  @@index([breedId])
  @@index([displayOrder])
  @@map("farm_breed_preferences")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

CREATE TABLE farm_breed_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  breed_id UUID NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (breed_id) REFERENCES breeds(id) ON DELETE CASCADE,

  UNIQUE(farm_id, breed_id)
);

CREATE INDEX idx_farm_breed_preferences_farm_id ON farm_breed_preferences(farm_id);
CREATE INDEX idx_farm_breed_preferences_breed_id ON farm_breed_preferences(breed_id);
CREATE INDEX idx_farm_breed_preferences_display_order ON farm_breed_preferences(display_order);

CREATE TRIGGER update_farm_breed_preferences_updated_at
    BEFORE UPDATE ON farm_breed_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## ✅ Checklist

- [ ] Table créée
- [ ] Contrainte unique `(farm_id, breed_id)`
- [ ] API liste races préférées d'une ferme
- [ ] API réordonner races (displayOrder)

**Phase 20 : TERMINÉE** ✅
