-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('vaccination', 'deworming', 'screening', 'treatment', 'census', 'other');

-- CreateEnum
CREATE TYPE "PersonalCampaignStatus" AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');

BEGIN;

-- Ajouter colonne description
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS description TEXT;

-- Convertir colonne type (String? -> CampaignType)
-- Étape 1 : Créer colonne temporaire avec ENUM
ALTER TABLE campaigns ADD COLUMN type_new "CampaignType";

-- Étape 2 : Migrer les données (mapping String -> ENUM)
UPDATE campaigns
SET type_new = CASE
  WHEN type IS NULL THEN 'other'
  WHEN type = 'vaccination' THEN 'vaccination'::"CampaignType"
  WHEN type = 'deworming' THEN 'deworming'::"CampaignType"
  WHEN type = 'screening' THEN 'screening'::"CampaignType"
  WHEN type = 'treatment' THEN 'treatment'::"CampaignType"
  WHEN type = 'census' THEN 'census'::"CampaignType"
  WHEN type = 'weighing' THEN 'other'::"CampaignType"  -- mapping ancien vers 'other'
  WHEN type = 'identification' THEN 'other'::"CampaignType"  -- mapping ancien vers 'other'
  ELSE 'other'::"CampaignType"
END;

-- Étape 3 : Supprimer ancienne colonne et renommer
ALTER TABLE campaigns DROP COLUMN type;
ALTER TABLE campaigns RENAME COLUMN type_new TO type;
ALTER TABLE campaigns ALTER COLUMN type SET NOT NULL;

-- Convertir colonne status (String -> PersonalCampaignStatus)
-- Étape 1 : Créer colonne temporaire avec ENUM
ALTER TABLE campaigns ADD COLUMN status_new "PersonalCampaignStatus";

-- Étape 2 : Migrer les données
UPDATE campaigns
SET status_new = CASE
  WHEN status = 'planned' THEN 'planned'::"PersonalCampaignStatus"
  WHEN status = 'in_progress' THEN 'in_progress'::"PersonalCampaignStatus"
  WHEN status = 'completed' THEN 'completed'::"PersonalCampaignStatus"
  WHEN status = 'cancelled' THEN 'cancelled'::"PersonalCampaignStatus"
  ELSE 'planned'::"PersonalCampaignStatus"
END;

-- Étape 3 : Supprimer ancienne colonne et renommer
ALTER TABLE campaigns DROP COLUMN status;
ALTER TABLE campaigns RENAME COLUMN status_new TO status;
ALTER TABLE campaigns ALTER COLUMN status SET DEFAULT 'planned';
ALTER TABLE campaigns ALTER COLUMN status SET NOT NULL;

-- Renommer la table
ALTER TABLE campaigns RENAME TO personal_campaigns;

-- Créer index sur status
CREATE INDEX IF NOT EXISTS idx_personal_campaigns_status ON personal_campaigns(status);

-- Les autres indexes existent déjà (farm_id, start_date, deleted_at) donc on ne les recrée pas

-- Créer trigger pour updated_at (si pas déjà existant)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_personal_campaigns_updated_at'
  ) THEN
    CREATE TRIGGER update_personal_campaigns_updated_at
      BEFORE UPDATE ON personal_campaigns
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

COMMIT;
