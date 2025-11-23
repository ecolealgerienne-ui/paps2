-- ============================================
-- PHASE 12 : Amélioration table Breeds
-- Ajout code unique + soft delete + versioning + indexes composites
-- ============================================

BEGIN;

-- Étape 1 : Ajouter colonnes manquantes
ALTER TABLE breeds
  ADD COLUMN IF NOT EXISTS code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Étape 2 : Ajouter contrainte UNIQUE sur code
ALTER TABLE breeds
  ADD CONSTRAINT unique_breed_code UNIQUE (code);

-- Étape 3 : Créer indexes simples
CREATE INDEX IF NOT EXISTS idx_breeds_species_id ON breeds(species_id);
CREATE INDEX IF NOT EXISTS idx_breeds_code ON breeds(code);
CREATE INDEX IF NOT EXISTS idx_breeds_deleted_at ON breeds(deleted_at);
CREATE INDEX IF NOT EXISTS idx_breeds_display_order ON breeds(display_order);
CREATE INDEX IF NOT EXISTS idx_breeds_is_active ON breeds(is_active);

-- Étape 4 : Créer index composites (RECOMMANDATIONS - performance)
CREATE INDEX IF NOT EXISTS idx_breeds_species_active ON breeds(species_id, is_active, deleted_at);
CREATE INDEX IF NOT EXISTS idx_breeds_species_order ON breeds(species_id, display_order);

-- Étape 5 : Créer trigger updated_at
CREATE TRIGGER update_breeds_updated_at
    BEFORE UPDATE ON breeds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 6 : Seed data - Races prioritaires PAPS2
INSERT INTO breeds (id, code, species_id, name_fr, name_en, name_ar, display_order) VALUES
  -- Races ovines (4)
  (gen_random_uuid(), 'lacaune', 'ovine', 'Lacaune', 'Lacaune', 'لاكون', 1),
  (gen_random_uuid(), 'merinos', 'ovine', 'Mérinos', 'Merino', 'ميرينو', 2),
  (gen_random_uuid(), 'ouled_djellal', 'ovine', 'Ouled Djellal', 'Ouled Djellal', 'أولاد جلال', 3),
  (gen_random_uuid(), 'rembi', 'ovine', 'Rembi', 'Rembi', 'رمبي', 4),

  -- Races caprines (3)
  (gen_random_uuid(), 'alpine', 'caprine', 'Alpine', 'Alpine', 'ألبين', 1),
  (gen_random_uuid(), 'saanen', 'caprine', 'Saanen', 'Saanen', 'سانين', 2),
  (gen_random_uuid(), 'arabe', 'caprine', 'Chèvre Arabe', 'Arabian Goat', 'الماعز العربي', 3),

  -- Races bovines (4)
  (gen_random_uuid(), 'holstein', 'bovine', 'Holstein', 'Holstein', 'هولشتاين', 1),
  (gen_random_uuid(), 'montbeliarde', 'bovine', 'Montbéliarde', 'Montbeliard', 'مونبليارد', 2),
  (gen_random_uuid(), 'charolaise', 'bovine', 'Charolaise', 'Charolais', 'شارولي', 3),
  (gen_random_uuid(), 'brune_atlas', 'bovine', 'Brune de l''Atlas', 'Atlas Brown', 'بني الأطلس', 4)
ON CONFLICT (code) DO NOTHING;

-- Étape 7 : Vérification
SELECT code, species_id, name_fr, name_en, name_ar, display_order, is_active
FROM breeds
ORDER BY species_id, display_order;

COMMIT;
