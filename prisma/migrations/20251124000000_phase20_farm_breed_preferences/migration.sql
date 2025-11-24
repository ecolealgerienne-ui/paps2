-- PHASE_20: FarmBreedPreferences - Table de préférences Farm ↔ Breeds
BEGIN;

-- Créer table farm_breed_preferences
CREATE TABLE farm_breed_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  breed_id UUID NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (breed_id) REFERENCES breeds(id) ON DELETE CASCADE,

  UNIQUE(farm_id, breed_id)
);

-- Indexes
CREATE INDEX idx_farm_breed_preferences_farm_id ON farm_breed_preferences(farm_id);
CREATE INDEX idx_farm_breed_preferences_breed_id ON farm_breed_preferences(breed_id);
CREATE INDEX idx_farm_breed_preferences_display_order ON farm_breed_preferences(display_order);

-- Trigger
CREATE TRIGGER update_farm_breed_preferences_updated_at
    BEFORE UPDATE ON farm_breed_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
