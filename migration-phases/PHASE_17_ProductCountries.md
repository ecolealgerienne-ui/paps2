# 🔧 PHASE 17 : Product Countries

## 📋 Résumé

| Paramètre | Valeur |
|-----------|--------|
| **Table** | `product_countries` |
| **Type** | Nouvelle table de liaison (MedicalProduct ↔ Country) |
| **Complexité** | 🟢 Simple |
| **Durée estimée** | 2h |
| **Dépendances** | ⚠️ **Phases 5 (MedicalProducts) + 4 (Countries)** |
| **Bloc** | BLOC 3 - Liaisons Pays |

---

## 📊 Schéma Prisma

```prisma
model ProductCountry {
  id          String    @id @default(uuid())
  productId   String    @map("product_id")
  countryCode String    @map("country_code")
  numeroAMM   String?   @map("numero_amm")    // AMM spécifique au pays
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  product MedicalProduct @relation(fields: [productId], references: [id], onDelete: Cascade)
  country Country        @relation(fields: [countryCode], references: [code], onDelete: Cascade)

  @@unique([productId, countryCode])
  @@index([productId])
  @@index([countryCode])
  @@map("product_countries")
}
```

---

## 🗄️ Migration SQL

```sql
BEGIN;

CREATE TABLE product_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  numero_amm VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (product_id) REFERENCES medical_products(id) ON DELETE CASCADE,
  FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE,

  UNIQUE(product_id, country_code)
);

CREATE INDEX idx_product_countries_product_id ON product_countries(product_id);
CREATE INDEX idx_product_countries_country_code ON product_countries(country_code);

CREATE TRIGGER update_product_countries_updated_at
    BEFORE UPDATE ON product_countries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data
INSERT INTO product_countries (product_id, country_code, numero_amm) VALUES
  ((SELECT id FROM medical_products WHERE code = 'enrofloxacine_100'), 'FR', 'FR/V/1234567'),
  ((SELECT id FROM medical_products WHERE code = 'enrofloxacine_100'), 'DZ', 'DZ/V/2024/001'),
  ((SELECT id FROM medical_products WHERE code = 'ivermectine_1'), 'FR', 'FR/V/7654321'),
  ((SELECT id FROM medical_products WHERE code = 'ivermectine_1'), 'DZ', 'DZ/V/2024/002'),
  ((SELECT id FROM medical_products WHERE code = 'ivermectine_1'), 'MA', 'MA/V/2024/001')
ON CONFLICT (product_id, country_code) DO NOTHING;

COMMIT;
```

---

## ✅ Checklist

- [ ] Table créée avec FK
- [ ] Seed : 5+ associations
- [ ] API liste pays d'un produit
- [ ] API liste produits d'un pays

**Phase 17 : TERMINÉE** ✅
