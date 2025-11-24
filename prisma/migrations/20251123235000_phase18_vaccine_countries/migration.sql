-- ============================================
-- PHASE 18 : Table de liaison Vaccins-Pays
-- Associe les vaccins globaux aux pays autorisés
-- ============================================

BEGIN;

-- Étape 1 : Créer table vaccine_countries
CREATE TABLE vaccine_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vaccine_id UUID NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  numero_amm VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (vaccine_id) REFERENCES vaccines_global(id) ON DELETE CASCADE,
  FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE,

  UNIQUE(vaccine_id, country_code)
);

-- Étape 2 : Créer indexes
CREATE INDEX idx_vaccine_countries_vaccine_id ON vaccine_countries(vaccine_id);
CREATE INDEX idx_vaccine_countries_country_code ON vaccine_countries(country_code);

-- Étape 3 : Créer trigger updated_at
CREATE TRIGGER update_vaccine_countries_updated_at
    BEFORE UPDATE ON vaccine_countries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 4 : Seed data - Associations vaccins prioritaires Maghreb
INSERT INTO vaccine_countries (vaccine_id, country_code, numero_amm) VALUES
  -- Brucellose B19 (Maghreb)
  ((SELECT id FROM vaccines_global WHERE code = 'brucellose_b19'), 'DZ', 'DZ/V/2024/B19'),
  ((SELECT id FROM vaccines_global WHERE code = 'brucellose_b19'), 'MA', 'MA/V/2024/B19'),
  ((SELECT id FROM vaccines_global WHERE code = 'brucellose_b19'), 'TN', 'TN/V/2024/B19'),

  -- PPR (Maghreb + Mauritanie)
  ((SELECT id FROM vaccines_global WHERE code = 'fcov_ppr'), 'DZ', 'DZ/V/2024/PPR'),
  ((SELECT id FROM vaccines_global WHERE code = 'fcov_ppr'), 'MA', 'MA/V/2024/PPR'),
  ((SELECT id FROM vaccines_global WHERE code = 'fcov_ppr'), 'TN', 'TN/V/2024/PPR'),
  ((SELECT id FROM vaccines_global WHERE code = 'fcov_ppr'), 'MR', 'MR/V/2024/PPR'),

  -- Fièvre aphteuse (priorité régionale)
  ((SELECT id FROM vaccines_global WHERE code = 'fievre_aphteuse'), 'DZ', 'DZ/V/2024/FA'),
  ((SELECT id FROM vaccines_global WHERE code = 'fievre_aphteuse'), 'MA', 'MA/V/2024/FA'),

  -- Clavelée (ovins - Maghreb)
  ((SELECT id FROM vaccines_global WHERE code = 'clavele'), 'DZ', 'DZ/V/2024/CLV'),
  ((SELECT id FROM vaccines_global WHERE code = 'clavele'), 'MA', 'MA/V/2024/CLV')
ON CONFLICT (vaccine_id, country_code) DO NOTHING;

-- Étape 5 : Vérification
SELECT
  vc.id,
  v.code AS vaccine_code,
  v.name_fr AS vaccine_name,
  c.code AS country_code,
  c.name_fr AS country_name,
  vc.numero_amm,
  vc.is_active
FROM vaccine_countries vc
JOIN vaccines_global v ON vc.vaccine_id = v.id
JOIN countries c ON vc.country_code = c.code
ORDER BY v.code, c.code;

COMMIT;
