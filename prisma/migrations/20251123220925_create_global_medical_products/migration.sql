-- ============================================
-- PHASE 05 : Création Global Medical Products
-- Table globale (catalogue international)
-- ============================================

BEGIN;

-- Étape 1 : Créer ENUM type
CREATE TYPE "MedicalProductType" AS ENUM (
  'antibiotic',
  'antiparasitic',
  'anti_inflammatory',
  'vitamin',
  'vaccine',
  'anesthetic',
  'hormone',
  'other'
);

-- Étape 2 : Créer table global_medical_products
CREATE TABLE global_medical_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name_fr VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  name_ar VARCHAR(200) NOT NULL,
  description TEXT,
  type "MedicalProductType" NOT NULL,
  principe_actif VARCHAR(200),
  laboratoire VARCHAR(200),
  numero_amm VARCHAR(100),
  version INT DEFAULT 1 NOT NULL,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Étape 3 : Créer indexes
CREATE INDEX idx_global_medical_products_code ON global_medical_products(code);
CREATE INDEX idx_global_medical_products_type ON global_medical_products(type);
CREATE INDEX idx_global_medical_products_laboratoire ON global_medical_products(laboratoire);
CREATE INDEX idx_global_medical_products_deleted_at ON global_medical_products(deleted_at);

-- Étape 4 : Créer trigger pour updated_at (fonction existe déjà de Phase 02)
CREATE TRIGGER update_global_medical_products_updated_at
    BEFORE UPDATE ON global_medical_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 5 : Seed data - Produits de référence
INSERT INTO global_medical_products (code, name_fr, name_en, name_ar, type, principe_actif, laboratoire) VALUES
  ('enrofloxacine_100', 'Enrofloxacine 10%', 'Enrofloxacin 10%', 'إنروفلوكساسين 10%', 'antibiotic', 'Enrofloxacine', 'Ceva'),
  ('oxytetracycline_200', 'Oxytétracycline 200mg', 'Oxytetracycline 200mg', 'أوكسي تتراسيكلين 200 ملغ', 'antibiotic', 'Oxytétracycline', 'Zoetis'),
  ('ivermectine_1', 'Ivermectine 1%', 'Ivermectin 1%', 'إيفرمكتين 1%', 'antiparasitic', 'Ivermectine', 'Merial'),
  ('meloxicam_5', 'Méloxicam 5mg/ml', 'Meloxicam 5mg/ml', 'ميلوكسيكام 5 ملغ/مل', 'anti_inflammatory', 'Méloxicam', 'Boehringer'),
  ('vitamine_ad3e', 'Vitamine AD3E', 'Vitamin AD3E', 'فيتامين AD3E', 'vitamin', 'Vitamines A, D3, E', 'Virbac'),
  ('penicilline_g', 'Pénicilline G Procaïne', 'Procaine Penicillin G', 'بنسلين جي بروكايين', 'antibiotic', 'Pénicilline', 'Intervet'),
  ('dexamethasone', 'Dexaméthasone 2mg/ml', 'Dexamethasone 2mg/ml', 'ديكساميثازون 2 ملغ/مل', 'anti_inflammatory', 'Dexaméthasone', 'Virbac')
ON CONFLICT (code) DO NOTHING;

-- Étape 6 : Vérification
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'global_medical_products'
ORDER BY ordinal_position;

COMMIT;
