-- ================================================
-- MIGRATION PHASE_14 : Alert Configuration
-- ================================================
-- Description: Refonte complète du modèle AlertConfiguration
--              - Suppression anciennes colonnes
--              - Ajout nouvelles colonnes de configuration
--              - farmId devient UNIQUE (1 config par ferme)
-- Date: 2025-11-23
-- ================================================

BEGIN;

-- 1. Supprimer anciennes colonnes (ancien modèle)
ALTER TABLE alert_configurations
  DROP COLUMN IF EXISTS evaluation_type,
  DROP COLUMN IF EXISTS type,
  DROP COLUMN IF EXISTS category,
  DROP COLUMN IF EXISTS title_key,
  DROP COLUMN IF EXISTS message_key,
  DROP COLUMN IF EXISTS severity,
  DROP COLUMN IF EXISTS icon_name,
  DROP COLUMN IF EXISTS color_hex,
  DROP COLUMN IF EXISTS enabled,
  DROP COLUMN IF EXISTS alert_type,
  DROP COLUMN IF EXISTS is_enabled,
  DROP COLUMN IF EXISTS days_before_due,
  DROP COLUMN IF EXISTS priority;

-- 2. Ajouter nouvelles colonnes (PHASE_14)
ALTER TABLE alert_configurations
  ADD COLUMN IF NOT EXISTS enable_email_alerts BOOLEAN DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS enable_sms_alerts BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS enable_push_alerts BOOLEAN DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS vaccination_reminder_days INT DEFAULT 7 NOT NULL,
  ADD COLUMN IF NOT EXISTS treatment_reminder_days INT DEFAULT 3 NOT NULL,
  ADD COLUMN IF NOT EXISTS health_check_reminder_days INT DEFAULT 30 NOT NULL;

-- 3. Ajouter colonnes soft delete + versioning + timestamps (si manquantes)
ALTER TABLE alert_configurations
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- 4. Ajouter contrainte UNIQUE sur farm_id (1 config par ferme)
-- D'abord, supprimer les doublons potentiels (garder le plus récent)
DELETE FROM alert_configurations a
USING alert_configurations b
WHERE a.id < b.id
  AND a.farm_id = b.farm_id
  AND a.deleted_at IS NULL
  AND b.deleted_at IS NULL;

-- Ensuite, ajouter la contrainte UNIQUE
ALTER TABLE alert_configurations
  DROP CONSTRAINT IF EXISTS alert_configurations_farm_id_key;

ALTER TABLE alert_configurations
  ADD CONSTRAINT alert_configurations_farm_id_key UNIQUE (farm_id);

-- 5. Créer index sur deleted_at (si manquant)
CREATE INDEX IF NOT EXISTS idx_alert_configurations_deleted_at ON alert_configurations(deleted_at);

-- 6. Supprimer ancien index sur farm_id (maintenant inutile car UNIQUE)
DROP INDEX IF EXISTS idx_alert_configurations_farm_id;

-- 7. Créer trigger pour updated_at
DROP TRIGGER IF EXISTS update_alert_configurations_updated_at ON alert_configurations;

CREATE TRIGGER update_alert_configurations_updated_at
    BEFORE UPDATE ON alert_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ================================================
-- FIN MIGRATION PHASE_14
-- ================================================
