-- ============================================
-- PHASE 06 : Création table Vaccines Global
-- Référentiel international des vaccins
-- ============================================

BEGIN;

-- Étape 1 : Créer ENUM pour les maladies cibles
CREATE TYPE "VaccineTargetDisease" AS ENUM (
  'brucellosis',
  'bluetongue',
  'foot_and_mouth',
  'rabies',
  'anthrax',
  'lumpy_skin',
  'ppr',
  'sheep_pox',
  'enterotoxemia',
  'pasteurellosis',
  'other'
);

-- Étape 2 : Créer table vaccines_global
CREATE TABLE vaccines_global (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name_fr VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  name_ar VARCHAR(200) NOT NULL,
  description TEXT,
  target_disease "VaccineTargetDisease" NOT NULL,
  laboratoire VARCHAR(200),
  numero_amm VARCHAR(100),
  dosage_recommande VARCHAR(500),
  duree_immunite INT,
  version INT DEFAULT 1 NOT NULL,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Étape 3 : Créer indexes
CREATE INDEX idx_vaccines_global_code ON vaccines_global(code);
CREATE INDEX idx_vaccines_global_target_disease ON vaccines_global(target_disease);
CREATE INDEX idx_vaccines_global_deleted_at ON vaccines_global(deleted_at);

-- Étape 4 : Créer trigger updated_at
CREATE TRIGGER update_vaccines_global_updated_at
    BEFORE UPDATE ON vaccines_global
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 5 : Seed data - Vaccins prioritaires PAPS2
INSERT INTO vaccines_global (code, name_fr, name_en, name_ar, target_disease, laboratoire, duree_immunite) VALUES
  -- Brucellose (priorité 1 - Maghreb)
  ('brucellose_b19', 'Brucellosis B19', 'Brucellosis B19', 'بروسيلا B19', 'brucellosis', 'Ceva', 365),

  -- Fièvre aphteuse (priorité 1 - épidémies fréquentes)
  ('fievre_aphteuse', 'Fièvre Aphteuse', 'Foot and Mouth Disease', 'الحمى القلاعية', 'foot_and_mouth', 'Merial', 180),

  -- PPR - Peste des Petits Ruminants (priorité 1 - ovins/caprins)
  ('fcov_ppr', 'FCOV PPR', 'PPR Vaccine', 'لقاح طاعون المجترات الصغيرة', 'ppr', 'Institut Pasteur', 365),

  -- Clavelée (priorité 1 - ovins)
  ('clavele', 'Clavelée', 'Sheep Pox', 'جدري الأغنام', 'sheep_pox', 'Biovac', 365),

  -- Rage (priorité 2 - zoonose)
  ('rage', 'Rage', 'Rabies', 'داء الكلب', 'rabies', 'Virbac', 365),

  -- Fièvre catarrhale (Blue Tongue) (priorité 2)
  ('bluetongue', 'Fièvre Catarrhale Ovine', 'Bluetongue', 'مرض اللسان الأزرق', 'bluetongue', 'Zoetis', 365),

  -- Charbon bactéridien (priorité 2)
  ('charbon', 'Charbon Bactéridien', 'Anthrax', 'الجمرة الخبيثة', 'anthrax', 'Intervet', 365),

  -- Dermatose nodulaire (Lumpy Skin) (priorité 2 - bovins)
  ('lumpy_skin', 'Dermatose Nodulaire', 'Lumpy Skin Disease', 'مرض الجلد العقدي', 'lumpy_skin', 'MSD', 365),

  -- Entérotoxémie (priorité 3)
  ('enterotoxemie', 'Entérotoxémie', 'Enterotoxemia', 'التسمم المعوي', 'enterotoxemia', 'Hipra', 365),

  -- Pasteurellose (priorité 3)
  ('pasteurellose', 'Pasteurellose', 'Pasteurellosis', 'داء البسترة', 'pasteurellosis', 'Boehringer', 365)
ON CONFLICT (code) DO NOTHING;

-- Étape 6 : Vérification
SELECT code, name_fr, name_en, name_ar, target_disease, laboratoire, duree_immunite
FROM vaccines_global
ORDER BY target_disease, name_fr;

COMMIT;
