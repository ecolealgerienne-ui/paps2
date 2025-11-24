-- ============================================
-- PHASE 24 : Préférences Campagnes Nationales Ferme
-- Table de préférences d'inscription aux campagnes nationales
-- ============================================

BEGIN;

-- Étape 1 : Créer table farm_national_campaign_preferences
CREATE TABLE farm_national_campaign_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  is_enrolled BOOLEAN DEFAULT FALSE NOT NULL,
  enrolled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES national_campaigns(id) ON DELETE CASCADE,

  -- Contrainte UNIQUE : une seule préférence par couple (farm, campaign)
  UNIQUE(farm_id, campaign_id)
);

-- Étape 2 : Créer indexes
CREATE INDEX idx_farm_national_campaign_preferences_farm_id ON farm_national_campaign_preferences(farm_id);
CREATE INDEX idx_farm_national_campaign_preferences_campaign_id ON farm_national_campaign_preferences(campaign_id);
CREATE INDEX idx_farm_national_campaign_preferences_is_enrolled ON farm_national_campaign_preferences(is_enrolled);

-- Étape 3 : Créer trigger updated_at
CREATE TRIGGER update_farm_national_campaign_preferences_updated_at
    BEFORE UPDATE ON farm_national_campaign_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
