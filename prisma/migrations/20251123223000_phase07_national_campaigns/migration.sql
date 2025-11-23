-- ============================================
-- PHASE 07 : Migration National Campaigns
-- Création ENUM, table globale, indexes, trigger, seed data
-- ============================================

BEGIN;

-- Étape 1 : Créer l'ENUM CampaignType
CREATE TYPE "CampaignType" AS ENUM (
  'vaccination',
  'deworming',
  'screening',
  'treatment',
  'census',
  'other'
);

-- Étape 2 : Créer la table national_campaigns
CREATE TABLE national_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name_fr VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  name_ar VARCHAR(200) NOT NULL,
  description TEXT,
  type "CampaignType" NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  version INT DEFAULT 1 NOT NULL,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Étape 3 : Créer les indexes
CREATE INDEX idx_national_campaigns_code ON national_campaigns(code);
CREATE INDEX idx_national_campaigns_type ON national_campaigns(type);
CREATE INDEX idx_national_campaigns_is_active ON national_campaigns(is_active);
CREATE INDEX idx_national_campaigns_start_date ON national_campaigns(start_date);
CREATE INDEX idx_national_campaigns_deleted_at ON national_campaigns(deleted_at);

-- Étape 4 : Créer le trigger pour updated_at (fonction existe déjà depuis PHASE_01)
CREATE TRIGGER update_national_campaigns_updated_at
    BEFORE UPDATE ON national_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 5 : Seed data - 3 campagnes nationales
INSERT INTO national_campaigns (code, name_fr, name_en, name_ar, type, start_date, end_date) VALUES
  ('brucellose_2025', 'Campagne Brucellose 2025', 'Brucellosis Campaign 2025', 'حملة البروسيلا 2025', 'vaccination', '2025-01-01', '2025-12-31'),
  ('ppr_maghreb_2025', 'PPR Maghreb 2025', 'PPR Maghreb 2025', 'طاعون المجترات الصغيرة المغرب العربي 2025', 'vaccination', '2025-03-01', '2025-11-30'),
  ('recensement_2025', 'Recensement National 2025', 'National Census 2025', 'الإحصاء الوطني 2025', 'census', '2025-01-01', '2025-02-28')
ON CONFLICT (code) DO NOTHING;

-- Étape 6 : Vérification
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'national_campaigns'
ORDER BY ordinal_position;

COMMIT;
