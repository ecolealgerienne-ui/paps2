-- ================================================
-- MIGRATION PHASE_15 : Farm Preferences ENUMs
-- ================================================
-- Description: Conversion des champs String en ENUMs typés
--              - Language (fr, en, ar)
--              - WeightUnit (kg, lb)
--              - Currency (DZD, EUR, USD, MAD)
-- Date: 2025-11-23
-- ================================================

BEGIN;

-- 1. Créer les types ENUM (RECOMMANDATIONS URGENTES)
CREATE TYPE "Language" AS ENUM ('fr', 'en', 'ar');
CREATE TYPE "WeightUnit" AS ENUM ('kg', 'lb');
CREATE TYPE "Currency" AS ENUM ('DZD', 'EUR', 'USD', 'MAD');

-- 2. Ajouter colonnes soft delete + versioning + timestamps (si manquantes)
ALTER TABLE farm_preferences
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- 3. Modifier colonnes pour utiliser ENUM (conversion String → ENUM)
-- IMPORTANT: USING permet de convertir les valeurs existantes
ALTER TABLE farm_preferences
  ALTER COLUMN language TYPE "Language" USING language::"Language",
  ALTER COLUMN weight_unit TYPE "WeightUnit" USING weight_unit::"WeightUnit",
  ALTER COLUMN currency TYPE "Currency" USING currency::"Currency";

-- 4. Définir defaults ENUM (pas String)
ALTER TABLE farm_preferences
  ALTER COLUMN language SET DEFAULT 'fr',
  ALTER COLUMN weight_unit SET DEFAULT 'kg',
  ALTER COLUMN currency SET DEFAULT 'DZD';

-- 5. Créer index sur deleted_at (si manquant)
CREATE INDEX IF NOT EXISTS idx_farm_preferences_deleted_at ON farm_preferences(deleted_at);

-- 6. Créer trigger pour updated_at (si manquant)
DROP TRIGGER IF EXISTS update_farm_preferences_updated_at ON farm_preferences;

CREATE TRIGGER update_farm_preferences_updated_at
    BEFORE UPDATE ON farm_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ================================================
-- FIN MIGRATION PHASE_15
-- ================================================
