-- ============================================
-- PHASE 17 : Création table ProductCountries
-- Table de liaison Produits ↔ Pays
-- ============================================

BEGIN;

-- Étape 1 : Créer table product_countries
CREATE TABLE product_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  numero_amm VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (product_id) REFERENCES global_medical_products(id) ON DELETE CASCADE,
  FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE,

  UNIQUE(product_id, country_code)
);

-- Étape 2 : Créer indexes
CREATE INDEX idx_product_countries_product_id ON product_countries(product_id);
CREATE INDEX idx_product_countries_country_code ON product_countries(country_code);

-- Étape 3 : Créer trigger updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_countries_updated_at'
  ) THEN
    CREATE TRIGGER update_product_countries_updated_at
      BEFORE UPDATE ON product_countries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Étape 4 : Seed data - Associations produits-pays
INSERT INTO product_countries (product_id, country_code, numero_amm) VALUES
  ((SELECT id FROM global_medical_products WHERE code = 'enrofloxacine_100'), 'FR', 'FR/V/1234567'),
  ((SELECT id FROM global_medical_products WHERE code = 'enrofloxacine_100'), 'DZ', 'DZ/V/2024/001'),
  ((SELECT id FROM global_medical_products WHERE code = 'ivermectine_1'), 'FR', 'FR/V/7654321'),
  ((SELECT id FROM global_medical_products WHERE code = 'ivermectine_1'), 'DZ', 'DZ/V/2024/002'),
  ((SELECT id FROM global_medical_products WHERE code = 'ivermectine_1'), 'MA', 'MA/V/2024/001')
ON CONFLICT (product_id, country_code) DO NOTHING;

COMMIT;
