# 🔧 PHASE 07 : National Campaigns

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `national_campaigns` |
| **Type** | Nouvelle table globale + CRUD |
| **Complexité** | 🟡 Moyenne |
| **Durée estimée** | 5h |
| **Dépendances** | Aucune (BLOC 1 - Parallèle ✅) |

---

## 📊 Schéma Prisma

```prisma
enum CampaignType {
  vaccination
  deworming
  screening
  treatment
  census
  other
}

model NationalCampaign {
  id              String        @id @default(uuid())
  code            String        @unique
  nameFr          String        @map("name_fr")
  nameEn          String        @map("name_en")
  nameAr          String        @map("name_ar")
  description     String?
  type            CampaignType
  startDate       DateTime      @map("start_date")
  endDate         DateTime      @map("end_date")
  isActive        Boolean       @default(true) @map("is_active")
  version         Int           @default(1)
  deletedAt       DateTime?     @map("deleted_at")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  campaignCountries CampaignCountry[]
  farmPreferences   FarmNationalCampaignPreference[]

  @@index([code])
  @@index([type])
  @@index([isActive])
  @@index([startDate])
  @@index([deletedAt])
  @@map("national_campaigns")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

CREATE TYPE "CampaignType" AS ENUM (
  'vaccination', 'deworming', 'screening', 'treatment', 'census', 'other'
);

CREATE TABLE national_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name_fr VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  name_ar VARCHAR(200) NOT NULL,
  description TEXT,
  type "CampaignType" NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  version INT DEFAULT 1 NOT NULL,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_national_campaigns_code ON national_campaigns(code);
CREATE INDEX idx_national_campaigns_type ON national_campaigns(type);
CREATE INDEX idx_national_campaigns_is_active ON national_campaigns(is_active);
CREATE INDEX idx_national_campaigns_start_date ON national_campaigns(start_date);
CREATE INDEX idx_national_campaigns_deleted_at ON national_campaigns(deleted_at);

CREATE TRIGGER update_national_campaigns_updated_at
    BEFORE UPDATE ON national_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data
INSERT INTO national_campaigns (code, name_fr, name_en, name_ar, type, start_date, end_date) VALUES
  ('brucellose_2025', 'Campagne Brucellose 2025', 'Brucellosis Campaign 2025', 'حملة البروسيلا 2025', 'vaccination', '2025-01-01', '2025-12-31'),
  ('ppr_maghreb_2025', 'PPR Maghreb 2025', 'PPR Maghreb 2025', 'طاعون المجترات الصغيرة المغرب العربي 2025', 'vaccination', '2025-03-01', '2025-11-30'),
  ('recensement_2025', 'Recensement National 2025', 'National Census 2025', 'الإحصاء الوطني 2025', 'census', '2025-01-01', '2025-02-28')
ON CONFLICT (code) DO NOTHING;

COMMIT;
```

---

## 🚀 API (Extraits)

```typescript
@ApiTags('national-campaigns')
@Controller('national-campaigns')
export class NationalCampaignsController {
  @Get()
  @ApiQuery({ name: 'type', required: false, enum: CampaignType })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  findAll(
    @Query('type') type?: CampaignType,
    @Query('active') active?: string
  ) {
    const isActive = active === 'true' ? true : active === 'false' ? false : undefined;
    return this.service.findAll({ type, isActive });
  }

  @Get('current')
  findCurrent() {
    // Campagnes en cours (today between start_date and end_date)
    return this.service.findCurrent();
  }
}
```

---

## ✅ Checklist

- [ ] ENUM `CampaignType` créé
- [ ] Table `national_campaigns` + indexes
- [ ] Seed : 3 campagnes nationales
- [ ] API filtre par type + isActive
- [ ] Endpoint `/national-campaigns/current` liste campagnes en cours
- [ ] Tests
- [ ] Protection suppression

**Phase 07 : TERMINÉE** ✅
