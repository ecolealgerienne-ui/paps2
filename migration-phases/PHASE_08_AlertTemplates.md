# 🔧 PHASE 08 : Alert Templates

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `alert_templates` |
| **Type** | Nouvelle table globale + CRUD |
| **Complexité** | 🟡 Moyenne |
| **Durée estimée** | 4h |
| **Dépendances** | Aucune (BLOC 1 - Parallèle ✅) |

---

## 📊 Schéma Prisma

```prisma
enum AlertCategory {
  health
  reproduction
  feeding
  vaccination
  treatment
  administrative
  weather
  other
}

enum AlertPriority {
  low
  medium
  high
  critical
}

model AlertTemplate {
  id              String         @id @default(uuid())
  code            String         @unique
  nameFr          String         @map("name_fr")
  nameEn          String         @map("name_en")
  nameAr          String         @map("name_ar")
  descriptionFr   String?        @map("description_fr")
  descriptionEn   String?        @map("description_en")
  descriptionAr   String?        @map("description_ar")
  category        AlertCategory
  priority        AlertPriority  @default(medium)
  isActive        Boolean        @default(true) @map("is_active")
  version         Int            @default(1)
  deletedAt       DateTime?      @map("deleted_at")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  @@index([code])
  @@index([category])
  @@index([priority])
  @@index([isActive])
  @@index([deletedAt])
  @@map("alert_templates")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

CREATE TYPE "AlertCategory" AS ENUM (
  'health', 'reproduction', 'feeding', 'vaccination', 'treatment', 'administrative', 'weather', 'other'
);

CREATE TYPE "AlertPriority" AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE alert_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name_fr VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  name_ar VARCHAR(200) NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  description_ar TEXT,
  category "AlertCategory" NOT NULL,
  priority "AlertPriority" DEFAULT 'medium' NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  version INT DEFAULT 1 NOT NULL,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_alert_templates_code ON alert_templates(code);
CREATE INDEX idx_alert_templates_category ON alert_templates(category);
CREATE INDEX idx_alert_templates_priority ON alert_templates(priority);
CREATE INDEX idx_alert_templates_is_active ON alert_templates(is_active);
CREATE INDEX idx_alert_templates_deleted_at ON alert_templates(deleted_at);

CREATE TRIGGER update_alert_templates_updated_at
    BEFORE UPDATE ON alert_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data
INSERT INTO alert_templates (code, name_fr, name_en, name_ar, category, priority) VALUES
  ('vaccination_due', 'Vaccination à venir', 'Vaccination Due', 'التطعيم المستحق', 'vaccination', 'high'),
  ('health_check_overdue', 'Visite sanitaire en retard', 'Health Check Overdue', 'الفحص الصحي متأخر', 'health', 'medium'),
  ('low_stock_feed', 'Stock aliment faible', 'Low Feed Stock', 'مخزون العلف منخفض', 'feeding', 'medium'),
  ('birth_expected', 'Naissance prévue', 'Birth Expected', 'الولادة المتوقعة', 'reproduction', 'low'),
  ('treatment_due', 'Traitement à administrer', 'Treatment Due', 'العلاج المستحق', 'treatment', 'high')
ON CONFLICT (code) DO NOTHING;

COMMIT;
```

---

## 🚀 API (Extraits)

```typescript
@ApiTags('alert-templates')
@Controller('alert-templates')
export class AlertTemplatesController {
  @Get()
  @ApiQuery({ name: 'category', required: false, enum: AlertCategory })
  @ApiQuery({ name: 'priority', required: false, enum: AlertPriority })
  findAll(
    @Query('category') category?: AlertCategory,
    @Query('priority') priority?: AlertPriority
  ) {
    return this.service.findAll({ category, priority });
  }
}
```

---

## ✅ Checklist

- [ ] ENUMs `AlertCategory` + `AlertPriority` créés
- [ ] Table `alert_templates` + indexes
- [ ] Seed : 5 templates minimum
- [ ] API filtre par category + priority
- [ ] Tests

**Phase 08 : TERMINÉE** ✅
