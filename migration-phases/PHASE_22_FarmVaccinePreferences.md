# 🔧 PHASE 22 : Farm Vaccine Preferences

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `farm_vaccine_preferences` |
| **Type** | Nouvelle table avec XOR (global OU custom) |
| **Complexité** | 🟡 Moyenne |
| **Durée estimée** | 3h |
| **Dépendances** | ⚠️ **Phases 3 (Farms) + 6 (Vaccines) + 10 (CustomVaccines) + 18 (VaccineCountries)** |
| **Bloc** | BLOC 4 - Préférences Ferme |

---

## 📊 Schéma Prisma

```prisma
model FarmVaccinePreference {
  id              String    @id @default(uuid())
  farmId          String    @map("farm_id")

  // XOR : global OU custom
  globalVaccineId String?   @map("global_vaccine_id")
  customVaccineId String?   @map("custom_vaccine_id")

  displayOrder    Int       @default(0) @map("display_order")
  isActive        Boolean   @default(true) @map("is_active")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  farm          Farm           @relation(fields: [farmId], references: [id], onDelete: Cascade)
  globalVaccine Vaccine?       @relation(fields: [globalVaccineId], references: [id], onDelete: Cascade)
  customVaccine CustomVaccine? @relation(fields: [customVaccineId], references: [id], onDelete: Cascade)

  @@index([farmId])
  @@index([globalVaccineId])
  @@index([customVaccineId])
  @@map("farm_vaccine_preferences")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

CREATE TABLE farm_vaccine_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  global_vaccine_id UUID,
  custom_vaccine_id UUID,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (global_vaccine_id) REFERENCES vaccines(id) ON DELETE CASCADE,
  FOREIGN KEY (custom_vaccine_id) REFERENCES custom_vaccines(id) ON DELETE CASCADE,

  -- Contrainte XOR
  CONSTRAINT check_vaccine_xor CHECK (
    (global_vaccine_id IS NOT NULL AND custom_vaccine_id IS NULL) OR
    (global_vaccine_id IS NULL AND custom_vaccine_id IS NOT NULL)
  )
);

CREATE INDEX idx_farm_vaccine_preferences_farm_id ON farm_vaccine_preferences(farm_id);
CREATE INDEX idx_farm_vaccine_preferences_global_vaccine_id ON farm_vaccine_preferences(global_vaccine_id);
CREATE INDEX idx_farm_vaccine_preferences_custom_vaccine_id ON farm_vaccine_preferences(custom_vaccine_id);

CREATE TRIGGER update_farm_vaccine_preferences_updated_at
    BEFORE UPDATE ON farm_vaccine_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## ✅ Checklist

- [ ] Table + contrainte XOR
- [ ] API validation XOR
- [ ] Tests XOR

**Phase 22 : TERMINÉE** ✅
