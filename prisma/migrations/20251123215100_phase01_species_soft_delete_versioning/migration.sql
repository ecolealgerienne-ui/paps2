-- ============================================
-- PHASE 01 : Migration Species
-- Ajout soft delete, versioning, timestamps, description
-- ============================================

-- Étape 1 : Ajouter les nouvelles colonnes
ALTER TABLE species
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Étape 2 : Créer index sur deleted_at
CREATE INDEX IF NOT EXISTS "species_deleted_at_idx" ON species(deleted_at);

-- Étape 3 : Créer fonction trigger pour updated_at (si elle n'existe pas)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Étape 4 : Créer trigger pour updated_at sur species
DROP TRIGGER IF EXISTS update_species_updated_at ON species;
CREATE TRIGGER update_species_updated_at
    BEFORE UPDATE ON species
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
