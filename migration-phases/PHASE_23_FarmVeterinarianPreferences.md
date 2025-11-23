# 🔧 PHASE 23 : Farm Veterinarian Preferences

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `farm_veterinarian_preferences` |
| **Type** | Nouvelle table de préférences |
| **Complexité** | 🟢 Simple |
| **Durée estimée** | 2h |
| **Dépendances** | ⚠️ **Phases 3 (Farms) + 13 (Veterinarians)** |
| **Bloc** | BLOC 4 - Préférences Ferme |

---

## 📊 Schéma Prisma

```prisma
model FarmVeterinarianPreference {
  id             String    @id @default(uuid())
  farmId         String    @map("farm_id")
  veterinarianId String    @map("veterinarian_id")
  displayOrder   Int       @default(0) @map("display_order")
  isActive       Boolean   @default(true) @map("is_active")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  farm         Farm         @relation(fields: [farmId], references: [id], onDelete: Cascade)
  veterinarian Veterinarian @relation(fields: [veterinarianId], references: [id], onDelete: Cascade)

  @@unique([farmId, veterinarianId])
  @@index([farmId])
  @@index([veterinarianId])
  @@map("farm_veterinarian_preferences")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

CREATE TABLE farm_veterinarian_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  veterinarian_id UUID NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE CASCADE,

  UNIQUE(farm_id, veterinarian_id)
);

CREATE INDEX idx_farm_veterinarian_preferences_farm_id ON farm_veterinarian_preferences(farm_id);
CREATE INDEX idx_farm_veterinarian_preferences_veterinarian_id ON farm_veterinarian_preferences(veterinarian_id);

CREATE TRIGGER update_farm_veterinarian_preferences_updated_at
    BEFORE UPDATE ON farm_veterinarian_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## ✅ Checklist

- [ ] Table créée
- [ ] Contrainte unique `(farm_id, veterinarian_id)`
- [ ] API liste vétérinaires préférés
- [ ] Tests

**Phase 23 : TERMINÉE** ✅
