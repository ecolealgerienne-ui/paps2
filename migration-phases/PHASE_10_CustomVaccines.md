# 🔧 PHASE 10 : Custom Vaccines

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `custom_vaccines` |
| **Type** | Renommage table (Vaccine → custom_vaccines) |
| **Complexité** | 🟢 Simple |
| **Durée estimée** | 1h |
| **Dépendances** | Aucune (BLOC 1 - Parallèle ✅) |

---

## 📊 Schéma Prisma

```prisma
model CustomVaccine {
  id                String    @id @default(uuid())
  farmId            String    @map("farm_id")
  name              String
  description       String?
  targetDisease     String?   @map("target_disease")
  laboratoire       String?
  dosage            String?
  version           Int       @default(1)
  deletedAt         DateTime? @map("deleted_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  farm              Farm      @relation(fields: [farmId], references: [id], onDelete: Cascade)
  farmPreferences   FarmVaccinePreference[]

  @@index([farmId])
  @@index([deletedAt])
  @@map("custom_vaccines")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

-- Renommer table
ALTER TABLE IF EXISTS vaccines_custom RENAME TO custom_vaccines;

-- Ajouter colonnes
ALTER TABLE custom_vaccines
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_custom_vaccines_farm_id ON custom_vaccines(farm_id);
CREATE INDEX IF NOT EXISTS idx_custom_vaccines_deleted_at ON custom_vaccines(deleted_at);

-- Trigger
CREATE TRIGGER update_custom_vaccines_updated_at
    BEFORE UPDATE ON custom_vaccines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## ✅ Checklist

- [ ] Table renommée `custom_vaccines`
- [ ] Soft delete + versioning
- [ ] Indexes
- [ ] API par farmId

**Phase 10 : TERMINÉE** ✅
