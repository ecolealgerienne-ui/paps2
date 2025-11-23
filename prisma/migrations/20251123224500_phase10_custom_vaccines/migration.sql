-- ================================================
-- MIGRATION PHASE_10 : Custom Vaccines
-- ================================================
-- Description: Renommer table vaccines → custom_vaccines
--              et simplifier le schéma
-- Date: 2025-11-23
-- ================================================

BEGIN;

-- 1. Renommer la table vaccines → custom_vaccines
ALTER TABLE IF EXISTS vaccines RENAME TO custom_vaccines;

-- 2. Ajouter nouvelles colonnes (soft delete, versioning, timestamps)
ALTER TABLE custom_vaccines
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- 3. Ajouter nouveaux champs simplifiés
ALTER TABLE custom_vaccines
  ADD COLUMN IF NOT EXISTS target_disease VARCHAR(255),
  ADD COLUMN IF NOT EXISTS laboratoire VARCHAR(255),
  ADD COLUMN IF NOT EXISTS dosage VARCHAR(255);

-- 4. Supprimer anciennes colonnes complexes
ALTER TABLE custom_vaccines
  DROP COLUMN IF EXISTS manufacturer,
  DROP COLUMN IF EXISTS target_species,
  DROP COLUMN IF EXISTS target_diseases,
  DROP COLUMN IF EXISTS standard_dose,
  DROP COLUMN IF EXISTS injections_required,
  DROP COLUMN IF EXISTS injection_interval_days,
  DROP COLUMN IF EXISTS meat_withdrawal_days,
  DROP COLUMN IF EXISTS milk_withdrawal_days,
  DROP COLUMN IF EXISTS administration_route,
  DROP COLUMN IF EXISTS is_active;

-- 5. Créer indexes
CREATE INDEX IF NOT EXISTS idx_custom_vaccines_farm_id ON custom_vaccines(farm_id);
CREATE INDEX IF NOT EXISTS idx_custom_vaccines_deleted_at ON custom_vaccines(deleted_at);

-- 6. Créer trigger pour updated_at
CREATE TRIGGER update_custom_vaccines_updated_at
    BEFORE UPDATE ON custom_vaccines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ================================================
-- FIN MIGRATION PHASE_10
-- ================================================
