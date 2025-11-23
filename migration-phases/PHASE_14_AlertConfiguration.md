# 🔧 PHASE 14 : Alert Configuration

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `AlertConfiguration` |
| **Type** | Corrections + soft delete + versioning |
| **Complexité** | 🟡 Moyenne |
| **Durée estimée** | 2h |
| **Dépendances** | ⚠️ **Phase 3 (Farms)** |
| **Bloc** | BLOC 2 - Dépendances Niveau 1 |

---

## 📊 Schéma Prisma

```prisma
model AlertConfiguration {
  id                      String    @id @default(uuid())
  farmId                  String    @unique @map("farm_id")
  enableEmailAlerts       Boolean   @default(true) @map("enable_email_alerts")
  enableSmsAlerts         Boolean   @default(false) @map("enable_sms_alerts")
  enablePushAlerts        Boolean   @default(true) @map("enable_push_alerts")
  vaccinationReminderDays Int       @default(7) @map("vaccination_reminder_days")
  treatmentReminderDays   Int       @default(3) @map("treatment_reminder_days")
  healthCheckReminderDays Int       @default(30) @map("health_check_reminder_days")
  version                 Int       @default(1)
  deletedAt               DateTime? @map("deleted_at")
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  farm Farm @relation(fields: [farmId], references: [id], onDelete: Cascade)

  @@index([deletedAt])
  @@map("alert_configurations")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

-- Ajouter colonnes
ALTER TABLE alert_configurations
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Index
CREATE INDEX IF NOT EXISTS idx_alert_configurations_deleted_at ON alert_configurations(deleted_at);

-- Trigger
CREATE TRIGGER update_alert_configurations_updated_at
    BEFORE UPDATE ON alert_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## ✅ Checklist

- [ ] Soft delete + versioning
- [ ] API CRUD par farmId
- [ ] Tests

**Phase 14 : TERMINÉE** ✅
