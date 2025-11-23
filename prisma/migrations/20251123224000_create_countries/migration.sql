-- ============================================
-- PHASE 04 : Création table Countries
-- Référentiel international des pays
-- ============================================

BEGIN;

-- Étape 1 : Créer table
CREATE TABLE countries (
  code VARCHAR(2) PRIMARY KEY,
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  region VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Étape 2 : Créer indexes
CREATE INDEX idx_countries_is_active ON countries(is_active);
CREATE INDEX idx_countries_region ON countries(region);

-- Étape 3 : Créer trigger updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_countries_updated_at'
  ) THEN
    CREATE TRIGGER update_countries_updated_at
      BEFORE UPDATE ON countries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Étape 4 : Seed data - Pays prioritaires PAPS2
INSERT INTO countries (code, name_fr, name_en, name_ar, region, is_active) VALUES
  -- Maghreb (priorité 1)
  ('DZ', 'Algérie', 'Algeria', 'الجزائر', 'Africa', TRUE),
  ('MA', 'Maroc', 'Morocco', 'المغرب', 'Africa', TRUE),
  ('TN', 'Tunisie', 'Tunisia', 'تونس', 'Africa', TRUE),
  ('LY', 'Libye', 'Libya', 'ليبيا', 'Africa', TRUE),
  ('MR', 'Mauritanie', 'Mauritania', 'موريتانيا', 'Africa', TRUE),

  -- Europe Ouest (priorité 2 - élevage ovin/bovin)
  ('FR', 'France', 'France', 'فرنسا', 'Europe', TRUE),
  ('ES', 'Espagne', 'Spain', 'إسبانيا', 'Europe', TRUE),
  ('IT', 'Italie', 'Italy', 'إيطاليا', 'Europe', TRUE),
  ('PT', 'Portugal', 'Portugal', 'البرتغال', 'Europe', TRUE),
  ('GB', 'Royaume-Uni', 'United Kingdom', 'المملكة المتحدة', 'Europe', TRUE),
  ('IE', 'Irlande', 'Ireland', 'أيرلندا', 'Europe', TRUE),

  -- Europe Centrale
  ('DE', 'Allemagne', 'Germany', 'ألمانيا', 'Europe', TRUE),
  ('BE', 'Belgique', 'Belgium', 'بلجيكا', 'Europe', TRUE),
  ('NL', 'Pays-Bas', 'Netherlands', 'هولندا', 'Europe', TRUE),
  ('CH', 'Suisse', 'Switzerland', 'سويسرا', 'Europe', TRUE),
  ('AT', 'Autriche', 'Austria', 'النمسا', 'Europe', TRUE),

  -- Moyen-Orient
  ('EG', 'Égypte', 'Egypt', 'مصر', 'Africa', TRUE),
  ('SA', 'Arabie Saoudite', 'Saudi Arabia', 'المملكة العربية السعودية', 'Asia', TRUE),
  ('AE', 'Émirats Arabes Unis', 'United Arab Emirates', 'الإمارات العربية المتحدة', 'Asia', TRUE),
  ('TR', 'Turquie', 'Turkey', 'تركيا', 'Asia', TRUE),

  -- Autres Africa
  ('SN', 'Sénégal', 'Senegal', 'السنغال', 'Africa', TRUE),
  ('ML', 'Mali', 'Mali', 'مالي', 'Africa', TRUE),
  ('NE', 'Niger', 'Niger', 'النيجر', 'Africa', TRUE),
  ('BF', 'Burkina Faso', 'Burkina Faso', 'بوركينا فاسو', 'Africa', TRUE),

  -- Amérique (pour référence)
  ('US', 'États-Unis', 'United States', 'الولايات المتحدة', 'Americas', TRUE),
  ('CA', 'Canada', 'Canada', 'كندا', 'Americas', TRUE),
  ('BR', 'Brésil', 'Brazil', 'البرازيل', 'Americas', TRUE),
  ('AR', 'Argentine', 'Argentina', 'الأرجنتين', 'Americas', TRUE),

  -- Océanie
  ('AU', 'Australie', 'Australia', 'أستراليا', 'Oceania', TRUE),
  ('NZ', 'Nouvelle-Zélande', 'New Zealand', 'نيوزيلندا', 'Oceania', TRUE)
ON CONFLICT (code) DO NOTHING;

COMMIT;
