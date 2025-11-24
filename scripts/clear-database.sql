-- Script pour vider complètement la base de données
-- ATTENTION: Supprime TOUTES les données!

-- Désactiver les contraintes temporairement
SET session_replication_role = 'replica';

-- Supprimer toutes les données dans l'ordre correct
TRUNCATE TABLE farm_national_campaign_preferences CASCADE;
TRUNCATE TABLE farm_veterinarian_preferences CASCADE;
TRUNCATE TABLE farm_vaccine_preferences CASCADE;
TRUNCATE TABLE farm_product_preferences CASCADE;
TRUNCATE TABLE farm_breed_preferences CASCADE;
TRUNCATE TABLE campaign_countries CASCADE;
TRUNCATE TABLE vaccine_countries CASCADE;
TRUNCATE TABLE product_countries CASCADE;
TRUNCATE TABLE breed_countries CASCADE;
TRUNCATE TABLE sync_queues CASCADE;
TRUNCATE TABLE weights CASCADE;
TRUNCATE TABLE documents CASCADE;
TRUNCATE TABLE personal_campaigns CASCADE;
TRUNCATE TABLE breedings CASCADE;
TRUNCATE TABLE vaccinations CASCADE;
TRUNCATE TABLE treatments CASCADE;
TRUNCATE TABLE movement_animals CASCADE;
TRUNCATE TABLE movements CASCADE;
TRUNCATE TABLE lot_animals CASCADE;
TRUNCATE TABLE lots CASCADE;
TRUNCATE TABLE animals CASCADE;
TRUNCATE TABLE alert_configurations CASCADE;
TRUNCATE TABLE farm_preferences CASCADE;
TRUNCATE TABLE custom_vaccines CASCADE;
TRUNCATE TABLE custom_medical_products CASCADE;
TRUNCATE TABLE farms CASCADE;
TRUNCATE TABLE veterinarians CASCADE;
TRUNCATE TABLE alert_templates CASCADE;
TRUNCATE TABLE national_campaigns CASCADE;
TRUNCATE TABLE vaccines_global CASCADE;
TRUNCATE TABLE global_medical_products CASCADE;
TRUNCATE TABLE breeds CASCADE;
TRUNCATE TABLE species CASCADE;
TRUNCATE TABLE countries CASCADE;
TRUNCATE TABLE administration_routes CASCADE;

-- Réactiver les contraintes
SET session_replication_role = 'origin';

-- Reset les séquences
DO $$
DECLARE
  seq_name text;
BEGIN
  FOR seq_name IN
    SELECT sequence_name FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  LOOP
    EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RESTART WITH 1';
  END LOOP;
END $$;

SELECT 'Base de données vidée avec succès!' AS resultat;
