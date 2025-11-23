-- PHASE_16: BreedCountries - Table de liaison Breeds ↔ Countries
BEGIN;

-- Créer table
CREATE TABLE breed_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breed_id UUID NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (breed_id) REFERENCES breeds(id) ON DELETE CASCADE,
  FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE,

  UNIQUE(breed_id, country_code)
);

-- Indexes
CREATE INDEX idx_breed_countries_breed_id ON breed_countries(breed_id);
CREATE INDEX idx_breed_countries_country_code ON breed_countries(country_code);
CREATE INDEX idx_breed_countries_is_active ON breed_countries(is_active);

-- Trigger
CREATE TRIGGER update_breed_countries_updated_at
    BEFORE UPDATE ON breed_countries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data : Associer races aux pays
INSERT INTO breed_countries (breed_id, country_code) VALUES
  -- Lacaune (France principalement)
  ((SELECT id FROM breeds WHERE code = 'lacaune'), 'FR'),

  -- Ouled Djellal (Algérie)
  ((SELECT id FROM breeds WHERE code = 'ouled_djellal'), 'DZ'),

  -- Mérinos (France, Espagne, Maroc, Algérie)
  ((SELECT id FROM breeds WHERE code = 'merinos'), 'FR'),
  ((SELECT id FROM breeds WHERE code = 'merinos'), 'ES'),
  ((SELECT id FROM breeds WHERE code = 'merinos'), 'MA'),
  ((SELECT id FROM breeds WHERE code = 'merinos'), 'DZ'),

  -- Holstein (international)
  ((SELECT id FROM breeds WHERE code = 'holstein'), 'FR'),
  ((SELECT id FROM breeds WHERE code = 'holstein'), 'DZ'),
  ((SELECT id FROM breeds WHERE code = 'holstein'), 'MA'),
  ((SELECT id FROM breeds WHERE code = 'holstein'), 'TN'),

  -- Brune de l'Atlas (Algérie, Maroc)
  ((SELECT id FROM breeds WHERE code = 'brune_atlas'), 'DZ'),
  ((SELECT id FROM breeds WHERE code = 'brune_atlas'), 'MA')
ON CONFLICT (breed_id, country_code) DO NOTHING;

COMMIT;
