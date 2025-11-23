-- PHASE_19: CampaignCountries - Table de liaison NationalCampaign ↔ Countries
BEGIN;

-- Créer table campaign_countries
CREATE TABLE campaign_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (campaign_id) REFERENCES national_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE,

  UNIQUE(campaign_id, country_code)
);

-- Indexes
CREATE INDEX idx_campaign_countries_campaign_id ON campaign_countries(campaign_id);
CREATE INDEX idx_campaign_countries_country_code ON campaign_countries(country_code);
CREATE INDEX idx_campaign_countries_is_active ON campaign_countries(is_active);

-- Trigger
CREATE TRIGGER update_campaign_countries_updated_at
    BEFORE UPDATE ON campaign_countries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data : Associer campagnes nationales aux pays
INSERT INTO campaign_countries (campaign_id, country_code) VALUES
  -- Brucellose 2025 (Algérie, Maroc, Tunisie)
  ((SELECT id FROM national_campaigns WHERE code = 'brucellose_2025'), 'DZ'),
  ((SELECT id FROM national_campaigns WHERE code = 'brucellose_2025'), 'MA'),
  ((SELECT id FROM national_campaigns WHERE code = 'brucellose_2025'), 'TN'),

  -- PPR Maghreb 2025 (Algérie, Maroc, Tunisie, Mauritanie)
  ((SELECT id FROM national_campaigns WHERE code = 'ppr_maghreb_2025'), 'DZ'),
  ((SELECT id FROM national_campaigns WHERE code = 'ppr_maghreb_2025'), 'MA'),
  ((SELECT id FROM national_campaigns WHERE code = 'ppr_maghreb_2025'), 'TN'),
  ((SELECT id FROM national_campaigns WHERE code = 'ppr_maghreb_2025'), 'MR')
ON CONFLICT (campaign_id, country_code) DO NOTHING;

COMMIT;
