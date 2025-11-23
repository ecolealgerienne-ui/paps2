# 🔧 PHASE 11 : Personal Campaigns

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `personal_campaigns` |
| **Type** | Renommage Campaign → personal_campaigns + ENUM |
| **Complexité** | 🟢 Simple |
| **Durée estimée** | 2h |
| **Dépendances** | Aucune (BLOC 1 - Parallèle ✅) |

---

## 📊 Schéma Prisma

```prisma
enum PersonalCampaignStatus {
  planned
  in_progress
  completed
  cancelled
}

model PersonalCampaign {
  id          String                   @id @default(uuid())
  farmId      String                   @map("farm_id")
  name        String
  description String?
  type        CampaignType             // Réutilise ENUM de national_campaigns
  status      PersonalCampaignStatus   @default(planned)
  startDate   DateTime?                @map("start_date")
  endDate     DateTime?                @map("end_date")
  version     Int                      @default(1)
  deletedAt   DateTime?                @map("deleted_at")
  createdAt   DateTime                 @default(now()) @map("created_at")
  updatedAt   DateTime                 @updatedAt @map("updated_at")

  farm        Farm                     @relation(fields: [farmId], references: [id], onDelete: Cascade)

  @@index([farmId])
  @@index([status])
  @@index([deletedAt])
  @@map("personal_campaigns")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

-- ENUM status
CREATE TYPE "PersonalCampaignStatus" AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');

-- Renommer table
ALTER TABLE IF EXISTS campaigns RENAME TO personal_campaigns;

-- Ajouter colonnes
ALTER TABLE personal_campaigns
  ADD COLUMN IF NOT EXISTS status "PersonalCampaignStatus" DEFAULT 'planned',
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_personal_campaigns_farm_id ON personal_campaigns(farm_id);
CREATE INDEX IF NOT EXISTS idx_personal_campaigns_status ON personal_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_personal_campaigns_deleted_at ON personal_campaigns(deleted_at);

-- Trigger
CREATE TRIGGER update_personal_campaigns_updated_at
    BEFORE UPDATE ON personal_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## ✅ Checklist

- [ ] ENUM `PersonalCampaignStatus` créé
- [ ] Table renommée `personal_campaigns`
- [ ] Soft delete + versioning + status
- [ ] API filtre par farmId + status

**Phase 11 : TERMINÉE** ✅

---

## 🎉 **FIN DU BLOC 1** (11/24 phases)

✅ **Toutes les phases indépendantes sont terminées** → On peut passer au BLOC 2 !
