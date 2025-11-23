# 🔧 PHASE 18 : Vaccine Countries

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `vaccine_countries` |
| **Type** | Nouvelle table de liaison (Vaccine ↔ Country) |
| **Complexité** | 🟢 Simple |
| **Durée estimée** | 2h |
| **Dépendances** | ⚠️ **Phases 6 (Vaccines) + 4 (Countries)** |
| **Bloc** | BLOC 3 - Liaisons Pays |

---

## 📊 Schéma Prisma

```prisma
model VaccineCountry {
  id          String    @id @default(uuid())
  vaccineId   String    @map("vaccine_id")
  countryCode String    @map("country_code")
  numeroAMM   String?   @map("numero_amm")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  vaccine Vaccine @relation(fields: [vaccineId], references: [id], onDelete: Cascade)
  country Country @relation(fields: [countryCode], references: [code], onDelete: Cascade)

  @@unique([vaccineId, countryCode])
  @@index([vaccineId])
  @@index([countryCode])
  @@map("vaccine_countries")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

CREATE TABLE vaccine_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vaccine_id UUID NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  numero_amm VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (vaccine_id) REFERENCES vaccines(id) ON DELETE CASCADE,
  FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE,

  UNIQUE(vaccine_id, country_code)
);

CREATE INDEX idx_vaccine_countries_vaccine_id ON vaccine_countries(vaccine_id);
CREATE INDEX idx_vaccine_countries_country_code ON vaccine_countries(country_code);

CREATE TRIGGER update_vaccine_countries_updated_at
    BEFORE UPDATE ON vaccine_countries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data
INSERT INTO vaccine_countries (vaccine_id, country_code, numero_amm) VALUES
  ((SELECT id FROM vaccines WHERE code = 'brucellose_b19'), 'DZ', 'DZ/V/2024/B19'),
  ((SELECT id FROM vaccines WHERE code = 'brucellose_b19'), 'MA', 'MA/V/2024/B19'),
  ((SELECT id FROM vaccines WHERE code = 'brucellose_b19'), 'TN', 'TN/V/2024/B19'),
  ((SELECT id FROM vaccines WHERE code = 'fcov_ppr'), 'DZ', 'DZ/V/2024/PPR'),
  ((SELECT id FROM vaccines WHERE code = 'fcov_ppr'), 'MA', 'MA/V/2024/PPR')
ON CONFLICT (vaccine_id, country_code) DO NOTHING;

COMMIT;
```

---

## ✅ Checklist

- [ ] Table créée
- [ ] Seed : 5+ associations
- [ ] API

**Phase 18 : TERMINÉE** ✅
