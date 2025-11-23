-- PHASE_13: Add geographic fields and indexes to veterinarians table
BEGIN;

-- Add geographic columns
ALTER TABLE veterinarians
  ADD COLUMN IF NOT EXISTS department VARCHAR(3),
  ADD COLUMN IF NOT EXISTS commune VARCHAR(5);

-- 🆕 PHASE_13: Contraintes CHECK géographiques
ALTER TABLE veterinarians
  ADD CONSTRAINT check_vet_department_format
  CHECK (department IS NULL OR department ~ '^[0-9A-Z]{2,3}$');

ALTER TABLE veterinarians
  ADD CONSTRAINT check_vet_commune_format
  CHECK (commune IS NULL OR commune ~ '^[0-9]{5}$');

-- 🆕 PHASE_13: Index simples
CREATE INDEX IF NOT EXISTS idx_veterinarians_is_active ON veterinarians(is_active);
CREATE INDEX IF NOT EXISTS idx_veterinarians_is_default ON veterinarians(is_default);
CREATE INDEX IF NOT EXISTS idx_veterinarians_department ON veterinarians(department);

-- 🆕 PHASE_13: Index composites
CREATE INDEX IF NOT EXISTS idx_vets_farm_active ON veterinarians(farm_id, is_active, deleted_at);
CREATE INDEX IF NOT EXISTS idx_vets_dept_active ON veterinarians(department, is_active);
CREATE INDEX IF NOT EXISTS idx_vets_farm_default ON veterinarians(farm_id, is_default);

COMMIT;
