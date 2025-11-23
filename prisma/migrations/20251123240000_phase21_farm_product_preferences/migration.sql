-- ============================================
-- PHASE 21 : Farm Product Preferences
-- Table des préférences produits par ferme
-- CONTRAINTE XOR : global OU custom (pas les deux)
-- ============================================

BEGIN;

-- Étape 1 : Créer table avec contrainte CHECK XOR
CREATE TABLE farm_product_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  global_product_id UUID,
  custom_product_id UUID,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (global_product_id) REFERENCES global_medical_products(id) ON DELETE CASCADE,
  FOREIGN KEY (custom_product_id) REFERENCES custom_medical_products(id) ON DELETE CASCADE,

  -- 🆕 CONTRAINTE XOR : Exactement UN des deux doit être non-null
  CONSTRAINT check_product_xor CHECK (
    (global_product_id IS NOT NULL AND custom_product_id IS NULL) OR
    (global_product_id IS NULL AND custom_product_id IS NOT NULL)
  )
);

-- Étape 2 : Créer indexes
CREATE INDEX idx_farm_product_preferences_farm_id ON farm_product_preferences(farm_id);
CREATE INDEX idx_farm_product_preferences_global_product_id ON farm_product_preferences(global_product_id);
CREATE INDEX idx_farm_product_preferences_custom_product_id ON farm_product_preferences(custom_product_id);

-- Étape 3 : Créer trigger updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_farm_product_preferences_updated_at'
  ) THEN
    CREATE TRIGGER update_farm_product_preferences_updated_at
      BEFORE UPDATE ON farm_product_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

COMMIT;
