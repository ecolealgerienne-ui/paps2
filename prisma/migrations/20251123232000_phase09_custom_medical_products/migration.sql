-- ============================================
-- PHASE 09 : Renommage Custom Medical Products
-- Clarification : produits personnalisés par ferme
-- ============================================

BEGIN;

-- Étape 1 : Renommer la table
ALTER TABLE IF EXISTS medical_products RENAME TO custom_medical_products;

-- Étape 2 : Vérifier et créer les indexes s'ils n'existent pas déjà
-- (version et deleted_at sont déjà présents dans le modèle actuel)

-- Index sur farm_id (devrait déjà exister)
CREATE INDEX IF NOT EXISTS idx_custom_medical_products_farm_id ON custom_medical_products(farm_id);

-- Index sur deleted_at (devrait déjà exister)
CREATE INDEX IF NOT EXISTS idx_custom_medical_products_deleted_at ON custom_medical_products(deleted_at);

-- Étape 3 : Recréer le trigger avec le nouveau nom de table
-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS update_medical_products_updated_at ON custom_medical_products;

-- Créer le nouveau trigger
CREATE TRIGGER update_custom_medical_products_updated_at
    BEFORE UPDATE ON custom_medical_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 4 : Vérification
SELECT COUNT(*) as total_products FROM custom_medical_products;

COMMIT;
