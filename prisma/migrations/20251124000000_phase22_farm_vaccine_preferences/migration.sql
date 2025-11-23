-- ============================================
-- PHASE 22 : Préférences Vaccins Ferme
-- Table de préférences vaccins (global OU custom) par ferme
-- ============================================

BEGIN;

-- Étape 1 : Créer table farm_vaccine_preferences avec contrainte XOR
CREATE TABLE farm_vaccine_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  global_vaccine_id UUID,
  custom_vaccine_id UUID,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (global_vaccine_id) REFERENCES vaccines_global(id) ON DELETE CASCADE,
  FOREIGN KEY (custom_vaccine_id) REFERENCES custom_vaccines(id) ON DELETE CASCADE,

  -- Contrainte XOR : global OU custom (jamais les deux, jamais aucun)
  CONSTRAINT check_vaccine_xor CHECK (
    (global_vaccine_id IS NOT NULL AND custom_vaccine_id IS NULL) OR
    (global_vaccine_id IS NULL AND custom_vaccine_id IS NOT NULL)
  )
);

-- Étape 2 : Créer indexes
CREATE INDEX idx_farm_vaccine_preferences_farm_id ON farm_vaccine_preferences(farm_id);
CREATE INDEX idx_farm_vaccine_preferences_global_vaccine_id ON farm_vaccine_preferences(global_vaccine_id);
CREATE INDEX idx_farm_vaccine_preferences_custom_vaccine_id ON farm_vaccine_preferences(custom_vaccine_id);

-- Étape 3 : Créer trigger updated_at
CREATE TRIGGER update_farm_vaccine_preferences_updated_at
    BEFORE UPDATE ON farm_vaccine_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
