-- ============================================
-- PHASE 23 : Farm Veterinarian Preferences
-- Table des préférences vétérinaires par ferme
-- ============================================

BEGIN;

-- Étape 1 : Créer table avec contrainte UNIQUE
CREATE TABLE farm_veterinarian_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  veterinarian_id UUID NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE CASCADE,

  UNIQUE(farm_id, veterinarian_id)
);

-- Étape 2 : Créer indexes
CREATE INDEX idx_farm_veterinarian_preferences_farm_id ON farm_veterinarian_preferences(farm_id);
CREATE INDEX idx_farm_veterinarian_preferences_veterinarian_id ON farm_veterinarian_preferences(veterinarian_id);

-- Étape 3 : Créer trigger updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_farm_veterinarian_preferences_updated_at'
  ) THEN
    CREATE TRIGGER update_farm_veterinarian_preferences_updated_at
      BEFORE UPDATE ON farm_veterinarian_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

COMMIT;
