-- ============================================
-- PHASE 02 : Migration AdministrationRoute
-- Ajout soft delete, versioning, timestamps, code, description
-- ============================================

BEGIN;

-- Étape 1 : Ajouter les nouvelles colonnes
ALTER TABLE administration_routes
  ADD COLUMN IF NOT EXISTS code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Étape 2 : Modifier l'ID pour avoir un default uuid (si pas déjà fait)
-- Note: Cette opération peut nécessiter une attention particulière si des données existent

-- Étape 3 : Ajouter contrainte UNIQUE sur code (après avoir rempli les valeurs)
-- Cette étape sera faite après le seed des données

-- Étape 4 : Créer index sur code
CREATE INDEX IF NOT EXISTS idx_administration_routes_code ON administration_routes(code);

-- Étape 5 : Créer index sur deleted_at
CREATE INDEX IF NOT EXISTS idx_administration_routes_deleted_at ON administration_routes(deleted_at);

-- Étape 6 : Créer trigger pour updated_at (si pas déjà créé)
-- (Si fonction existe déjà, cette commande sera ignorée)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour la table administration_routes
DROP TRIGGER IF EXISTS update_administration_routes_updated_at ON administration_routes;
CREATE TRIGGER update_administration_routes_updated_at
    BEFORE UPDATE ON administration_routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 7 : Vérification
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'administration_routes'
ORDER BY ordinal_position;

COMMIT;
