# 🔧 PHASE 19 : Campaign Countries

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `campaign_countries` |
| **Type** | Nouvelle table de liaison (NationalCampaign ↔ Country) |
| **Complexité** | 🟢 Simple |
| **Durée estimée** | 2h |
| **Dépendances** | ⚠️ **Phases 7 (NationalCampaigns) + 4 (Countries)** |
| **Bloc** | BLOC 3 - Liaisons Pays |

---

## 📊 Schéma Prisma

```prisma
model CampaignCountry {
  id         String    @id @default(uuid())
  campaignId String    @map("campaign_id")
  countryCode String   @map("country_code")
  isActive   Boolean   @default(true) @map("is_active")
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  campaign NationalCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  country  Country          @relation(fields: [countryCode], references: [code], onDelete: Cascade)

  @@unique([campaignId, countryCode])
  @@index([campaignId])
  @@index([countryCode])
  @@map("campaign_countries")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

CREATE TABLE campaign_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (campaign_id) REFERENCES national_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE,

  UNIQUE(campaign_id, country_code)
);

CREATE INDEX idx_campaign_countries_campaign_id ON campaign_countries(campaign_id);
CREATE INDEX idx_campaign_countries_country_code ON campaign_countries(country_code);

CREATE TRIGGER update_campaign_countries_updated_at
    BEFORE UPDATE ON campaign_countries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data
INSERT INTO campaign_countries (campaign_id, country_code) VALUES
  ((SELECT id FROM national_campaigns WHERE code = 'brucellose_2025'), 'DZ'),
  ((SELECT id FROM national_campaigns WHERE code = 'brucellose_2025'), 'MA'),
  ((SELECT id FROM national_campaigns WHERE code = 'brucellose_2025'), 'TN'),
  ((SELECT id FROM national_campaigns WHERE code = 'ppr_maghreb_2025'), 'DZ'),
  ((SELECT id FROM national_campaigns WHERE code = 'ppr_maghreb_2025'), 'MA'),
  ((SELECT id FROM national_campaigns WHERE code = 'ppr_maghreb_2025'), 'TN'),
  ((SELECT id FROM national_campaigns WHERE code = 'ppr_maghreb_2025'), 'MR')
ON CONFLICT (campaign_id, country_code) DO NOTHING;

COMMIT;
```

---

## ✅ Checklist

- [ ] Table créée
- [ ] Seed : 5+ associations
- [ ] API liste pays d'une campagne
- [ ] API liste campagnes d'un pays

**Phase 19 : TERMINÉE** ✅

---

## 🎉 **FIN DU BLOC 3** (19/24 phases)

✅ **Toutes les liaisons pays terminées** → On peut passer au BLOC 4 !
