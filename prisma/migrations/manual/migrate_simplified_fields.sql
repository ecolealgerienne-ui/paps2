-- Migration: Populate simplified fields from reference tables
-- Run this BEFORE removing FK constraints
-- Date: 2025-12-13

-- ============================================================
-- STEP 1: Migrate Product fields
-- ============================================================

-- Migrate categoryCode from ProductCategory
UPDATE "products" p
SET "category_code" = pc.code
FROM "product_categories" pc
WHERE p."category_id" = pc.id
  AND p."category_code" IS NULL;

-- Migrate composition from ActiveSubstance
UPDATE "products" p
SET "composition" = COALESCE(asub."name_fr", asub.name)
FROM "active_substances" asub
WHERE p."substance_id" = asub.id
  AND p."composition" IS NULL;

-- Set therapeuticForm from existing form field if not set
UPDATE "products"
SET "therapeutic_form" = form
WHERE "therapeutic_form" IS NULL
  AND form IS NOT NULL;

-- ============================================================
-- STEP 2: Migrate Treatment fields
-- ============================================================

-- Migrate administrationRoute from AdministrationRoute
UPDATE "treatments" t
SET "administration_route" = ar.code
FROM "administration_routes" ar
WHERE t."route_id" = ar.id
  AND t."administration_route" IS NULL;

-- ============================================================
-- STEP 3: Populate Product withdrawal defaults from TherapeuticIndication
-- (Take the most common/first indication values as defaults)
-- ============================================================

-- This is a more complex migration - only run if you want to set defaults
-- from existing therapeutic indications
WITH product_withdrawals AS (
  SELECT DISTINCT ON (ti."product_id")
    ti."product_id",
    ti."withdrawal_meat_days",
    ti."withdrawal_milk_days"
  FROM "therapeutic_indications" ti
  WHERE ti."withdrawal_meat_days" IS NOT NULL
  ORDER BY ti."product_id", ti."is_verified" DESC, ti."created_at" ASC
)
UPDATE "products" p
SET
  "withdrawal_meat_days" = pw."withdrawal_meat_days",
  "withdrawal_milk_hours" = CASE
    WHEN pw."withdrawal_milk_days" IS NOT NULL
    THEN pw."withdrawal_milk_days" * 24
    ELSE NULL
  END
FROM product_withdrawals pw
WHERE p.id = pw."product_id"
  AND p."withdrawal_meat_days" IS NULL;

-- ============================================================
-- VERIFICATION QUERIES (run to check migration success)
-- ============================================================

-- Check Product migration
-- SELECT
--   COUNT(*) as total,
--   COUNT(category_code) as with_category,
--   COUNT(composition) as with_composition,
--   COUNT(therapeutic_form) as with_form,
--   COUNT(withdrawal_meat_days) as with_withdrawal
-- FROM products;

-- Check Treatment migration
-- SELECT
--   COUNT(*) as total,
--   COUNT(administration_route) as with_route
-- FROM treatments;

-- ============================================================
-- ROLLBACK (if needed)
-- ============================================================

-- To rollback, simply set the new fields to NULL:
-- UPDATE products SET category_code = NULL, composition = NULL, therapeutic_form = NULL;
-- UPDATE treatments SET administration_route = NULL;
