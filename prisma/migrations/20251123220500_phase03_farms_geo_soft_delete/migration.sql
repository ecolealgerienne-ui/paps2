-- ============================================
-- PHASE 03 : Migration Farms
-- Ajout soft delete, versioning, timestamps, geo, CHECK
-- ============================================

BEGIN;

-- Étape 1 : Ajouter les nouvelles colonnes
ALTER TABLE farms
  ADD COLUMN IF NOT EXISTS address VARCHAR(500),
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS country VARCHAR(2),
  ADD COLUMN IF NOT EXISTS department VARCHAR(3),
  ADD COLUMN IF NOT EXISTS commune VARCHAR(5),
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Note: created_at et updated_at existent déjà dans le schéma, donc pas besoin de les ajouter

-- Étape 2 : Ajouter contraintes CHECK pour validation géographique
ALTER TABLE farms
  ADD CONSTRAINT IF NOT EXISTS check_country_format
  CHECK (country IS NULL OR country ~ '^[A-Z]{2}$');

ALTER TABLE farms
  ADD CONSTRAINT IF NOT EXISTS check_department_format
  CHECK (department IS NULL OR department ~ '^[0-9A-Z]{2,3}$');

ALTER TABLE farms
  ADD CONSTRAINT IF NOT EXISTS check_commune_format
  CHECK (commune IS NULL OR commune ~ '^[0-9]{5}$');

-- Étape 3 : Créer indexes simples
CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON farms(owner_id);
CREATE INDEX IF NOT EXISTS idx_farms_group_id ON farms(group_id);
CREATE INDEX IF NOT EXISTS idx_farms_is_default ON farms(is_default);
CREATE INDEX IF NOT EXISTS idx_farms_deleted_at ON farms(deleted_at);
CREATE INDEX IF NOT EXISTS idx_farms_is_active ON farms(is_active);
CREATE INDEX IF NOT EXISTS idx_farms_country ON farms(country);
CREATE INDEX IF NOT EXISTS idx_farms_department ON farms(department);

-- Étape 4 : Créer index composites (RECOMMANDATIONS)
CREATE INDEX IF NOT EXISTS idx_farms_owner_active ON farms(owner_id, is_active, deleted_at);
CREATE INDEX IF NOT EXISTS idx_farms_geo ON farms(country, department);
CREATE INDEX IF NOT EXISTS idx_farms_owner_default ON farms(owner_id, is_default);

-- Étape 5 : Créer trigger pour updated_at (la fonction existe déjà depuis PHASE_01)
DROP TRIGGER IF EXISTS update_farms_updated_at ON farms;
CREATE TRIGGER update_farms_updated_at
    BEFORE UPDATE ON farms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 6 : Vérification des colonnes
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'farms'
ORDER BY ordinal_position;

-- Étape 7 : Vérification des contraintes CHECK
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'farms'::regclass
  AND contype = 'c';

COMMIT;
