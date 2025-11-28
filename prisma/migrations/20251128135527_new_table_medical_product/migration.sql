/*
  Warnings:

  - You are about to drop the `farm_vaccine_preferences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `medical_products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_countries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vaccinations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vaccine_countries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vaccines` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('antibiotic', 'anti_inflammatory', 'antiparasitic', 'vitamin', 'mineral', 'vaccine', 'anesthetic', 'hormone', 'antiseptic', 'analgesic', 'other');

-- CreateEnum
CREATE TYPE "TreatmentType" AS ENUM ('treatment', 'vaccination');

-- CreateEnum
CREATE TYPE "VaccinationType" AS ENUM ('mandatory', 'recommended', 'optional');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('mass', 'volume', 'concentration', 'count', 'percentage', 'other');

-- DropForeignKey
ALTER TABLE "farm_product_preferences" DROP CONSTRAINT "farm_product_preferences_product_id_fkey";

-- DropForeignKey
ALTER TABLE "farm_vaccine_preferences" DROP CONSTRAINT "farm_vaccine_preferences_farm_id_fkey";

-- DropForeignKey
ALTER TABLE "farm_vaccine_preferences" DROP CONSTRAINT "farm_vaccine_preferences_vaccine_id_fkey";

-- DropForeignKey
ALTER TABLE "lots" DROP CONSTRAINT "lots_product_id_fkey";

-- DropForeignKey
ALTER TABLE "medical_products" DROP CONSTRAINT "medical_products_farm_id_fkey";

-- DropForeignKey
ALTER TABLE "personal_campaigns" DROP CONSTRAINT "personal_campaigns_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_countries" DROP CONSTRAINT "product_countries_country_code_fkey";

-- DropForeignKey
ALTER TABLE "product_countries" DROP CONSTRAINT "product_countries_product_id_fkey";

-- DropForeignKey
ALTER TABLE "treatments" DROP CONSTRAINT "treatments_product_id_fkey";

-- DropForeignKey
ALTER TABLE "vaccinations" DROP CONSTRAINT "vaccinations_animal_id_fkey";

-- DropForeignKey
ALTER TABLE "vaccinations" DROP CONSTRAINT "vaccinations_farm_id_fkey";

-- DropForeignKey
ALTER TABLE "vaccinations" DROP CONSTRAINT "vaccinations_vaccine_id_fkey";

-- DropForeignKey
ALTER TABLE "vaccinations" DROP CONSTRAINT "vaccinations_veterinarian_id_fkey";

-- DropForeignKey
ALTER TABLE "vaccine_countries" DROP CONSTRAINT "vaccine_countries_country_code_fkey";

-- DropForeignKey
ALTER TABLE "vaccine_countries" DROP CONSTRAINT "vaccine_countries_vaccine_id_fkey";

-- DropForeignKey
ALTER TABLE "vaccines" DROP CONSTRAINT "vaccines_farm_id_fkey";

-- AlterTable
ALTER TABLE "administration_routes" ADD COLUMN     "abbreviation" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "species" ADD COLUMN     "scientific_name" TEXT;

-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "animal_weight_kg" DOUBLE PRECISION,
ADD COLUMN     "batch_expiry_date" TIMESTAMP(3),
ADD COLUMN     "batch_number" TEXT,
ADD COLUMN     "computed_dose_mg_per_kg" DOUBLE PRECISION,
ADD COLUMN     "computed_withdrawal_meat_date" TIMESTAMP(3),
ADD COLUMN     "computed_withdrawal_milk_date" TIMESTAMP(3),
ADD COLUMN     "indication_id" TEXT,
ADD COLUMN     "next_due_date" TIMESTAMP(3),
ADD COLUMN     "packaging_id" TEXT,
ADD COLUMN     "protocol_step" INTEGER,
ADD COLUMN     "quantity_administered" DOUBLE PRECISION,
ADD COLUMN     "quantity_unit_id" TEXT,
ADD COLUMN     "target_disease" TEXT,
ADD COLUMN     "type" "TreatmentType" NOT NULL DEFAULT 'treatment',
ADD COLUMN     "vaccination_type" "VaccinationType",
ALTER COLUMN "product_id" DROP NOT NULL,
ALTER COLUMN "product_name" DROP NOT NULL,
ALTER COLUMN "dose" DROP NOT NULL,
ALTER COLUMN "withdrawal_end_date" DROP NOT NULL;

-- DropTable
DROP TABLE "farm_vaccine_preferences";

-- DropTable
DROP TABLE "medical_products";

-- DropTable
DROP TABLE "product_countries";

-- DropTable
DROP TABLE "vaccinations";

-- DropTable
DROP TABLE "vaccine_countries";

-- DropTable
DROP TABLE "vaccines";

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "unit_type" "UnitType" NOT NULL,
    "description" TEXT,
    "base_unit_code" TEXT,
    "conversion_factor" DOUBLE PRECISION,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "age_categories" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "species_id" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description" TEXT,
    "age_min_days" INTEGER NOT NULL,
    "age_max_days" INTEGER,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "age_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "active_substances" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_fr" TEXT,
    "name_en" TEXT,
    "name_ar" TEXT,
    "atc_code" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "active_substances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "scope" "DataScope" NOT NULL,
    "farm_id" TEXT,
    "code" TEXT,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT,
    "name_ar" TEXT,
    "commercial_name" TEXT,
    "description" TEXT,
    "type" "ProductType",
    "category_id" TEXT,
    "substance_id" TEXT,
    "atc_vet_code" TEXT,
    "manufacturer" TEXT,
    "form" TEXT,
    "target_disease" TEXT,
    "immunity_duration_days" INTEGER,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_packagings" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "concentration" DOUBLE PRECISION NOT NULL,
    "concentration_unit_id" TEXT NOT NULL,
    "volume" DOUBLE PRECISION,
    "volume_unit_id" TEXT,
    "packaging_label" TEXT NOT NULL,
    "gtin_ean" TEXT,
    "numero_amm" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_packagings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapeutic_indications" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "country_code" TEXT,
    "species_id" TEXT NOT NULL,
    "age_category_id" TEXT,
    "route_id" TEXT NOT NULL,
    "dose_min" DOUBLE PRECISION,
    "dose_max" DOUBLE PRECISION,
    "dose_unit_id" TEXT,
    "dose_original_text" TEXT,
    "protocol_duration_days" INTEGER,
    "withdrawal_meat_days" INTEGER NOT NULL,
    "withdrawal_milk_days" INTEGER,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "validation_notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "therapeutic_indications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "units_code_key" ON "units"("code");

-- CreateIndex
CREATE INDEX "units_code_idx" ON "units"("code");

-- CreateIndex
CREATE INDEX "units_unit_type_idx" ON "units"("unit_type");

-- CreateIndex
CREATE INDEX "units_is_active_idx" ON "units"("is_active");

-- CreateIndex
CREATE INDEX "units_deleted_at_idx" ON "units"("deleted_at");

-- CreateIndex
CREATE INDEX "age_categories_species_id_idx" ON "age_categories"("species_id");

-- CreateIndex
CREATE INDEX "age_categories_code_idx" ON "age_categories"("code");

-- CreateIndex
CREATE INDEX "age_categories_is_active_idx" ON "age_categories"("is_active");

-- CreateIndex
CREATE INDEX "age_categories_deleted_at_idx" ON "age_categories"("deleted_at");

-- CreateIndex
CREATE INDEX "age_categories_species_id_is_active_deleted_at_idx" ON "age_categories"("species_id", "is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "age_categories_species_id_age_min_days_age_max_days_idx" ON "age_categories"("species_id", "age_min_days", "age_max_days");

-- CreateIndex
CREATE UNIQUE INDEX "age_categories_species_id_code_key" ON "age_categories"("species_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "active_substances_code_key" ON "active_substances"("code");

-- CreateIndex
CREATE INDEX "active_substances_code_idx" ON "active_substances"("code");

-- CreateIndex
CREATE INDEX "active_substances_atc_code_idx" ON "active_substances"("atc_code");

-- CreateIndex
CREATE INDEX "active_substances_is_active_idx" ON "active_substances"("is_active");

-- CreateIndex
CREATE INDEX "active_substances_deleted_at_idx" ON "active_substances"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_code_key" ON "product_categories"("code");

-- CreateIndex
CREATE INDEX "product_categories_code_idx" ON "product_categories"("code");

-- CreateIndex
CREATE INDEX "product_categories_is_active_idx" ON "product_categories"("is_active");

-- CreateIndex
CREATE INDEX "product_categories_deleted_at_idx" ON "product_categories"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- CreateIndex
CREATE INDEX "products_scope_idx" ON "products"("scope");

-- CreateIndex
CREATE INDEX "products_farm_id_idx" ON "products"("farm_id");

-- CreateIndex
CREATE INDEX "products_code_idx" ON "products"("code");

-- CreateIndex
CREATE INDEX "products_type_idx" ON "products"("type");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_substance_id_idx" ON "products"("substance_id");

-- CreateIndex
CREATE INDEX "products_manufacturer_idx" ON "products"("manufacturer");

-- CreateIndex
CREATE INDEX "products_is_active_idx" ON "products"("is_active");

-- CreateIndex
CREATE INDEX "products_deleted_at_idx" ON "products"("deleted_at");

-- CreateIndex
CREATE INDEX "products_scope_farm_id_idx" ON "products"("scope", "farm_id");

-- CreateIndex
CREATE INDEX "products_scope_is_active_idx" ON "products"("scope", "is_active");

-- CreateIndex
CREATE INDEX "products_scope_is_active_deleted_at_idx" ON "products"("scope", "is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "products_farm_id_is_active_deleted_at_idx" ON "products"("farm_id", "is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "products_type_is_active_deleted_at_idx" ON "products"("type", "is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "product_packagings_product_id_idx" ON "product_packagings"("product_id");

-- CreateIndex
CREATE INDEX "product_packagings_country_code_idx" ON "product_packagings"("country_code");

-- CreateIndex
CREATE INDEX "product_packagings_gtin_ean_idx" ON "product_packagings"("gtin_ean");

-- CreateIndex
CREATE INDEX "product_packagings_is_active_idx" ON "product_packagings"("is_active");

-- CreateIndex
CREATE INDEX "product_packagings_deleted_at_idx" ON "product_packagings"("deleted_at");

-- CreateIndex
CREATE INDEX "product_packagings_product_id_country_code_idx" ON "product_packagings"("product_id", "country_code");

-- CreateIndex
CREATE UNIQUE INDEX "product_packagings_product_id_country_code_gtin_ean_key" ON "product_packagings"("product_id", "country_code", "gtin_ean");

-- CreateIndex
CREATE INDEX "therapeutic_indications_product_id_idx" ON "therapeutic_indications"("product_id");

-- CreateIndex
CREATE INDEX "therapeutic_indications_country_code_idx" ON "therapeutic_indications"("country_code");

-- CreateIndex
CREATE INDEX "therapeutic_indications_species_id_idx" ON "therapeutic_indications"("species_id");

-- CreateIndex
CREATE INDEX "therapeutic_indications_age_category_id_idx" ON "therapeutic_indications"("age_category_id");

-- CreateIndex
CREATE INDEX "therapeutic_indications_route_id_idx" ON "therapeutic_indications"("route_id");

-- CreateIndex
CREATE INDEX "therapeutic_indications_is_active_idx" ON "therapeutic_indications"("is_active");

-- CreateIndex
CREATE INDEX "therapeutic_indications_deleted_at_idx" ON "therapeutic_indications"("deleted_at");

-- CreateIndex
CREATE INDEX "therapeutic_indications_product_id_species_id_route_id_idx" ON "therapeutic_indications"("product_id", "species_id", "route_id");

-- CreateIndex
CREATE UNIQUE INDEX "therapeutic_indications_product_id_country_code_species_id__key" ON "therapeutic_indications"("product_id", "country_code", "species_id", "age_category_id", "route_id");

-- CreateIndex
CREATE INDEX "administration_routes_is_active_idx" ON "administration_routes"("is_active");

-- CreateIndex
CREATE INDEX "treatments_packaging_id_idx" ON "treatments"("packaging_id");

-- CreateIndex
CREATE INDEX "treatments_indication_id_idx" ON "treatments"("indication_id");

-- CreateIndex
CREATE INDEX "treatments_route_id_idx" ON "treatments"("route_id");

-- CreateIndex
CREATE INDEX "treatments_type_idx" ON "treatments"("type");

-- CreateIndex
CREATE INDEX "treatments_batch_number_idx" ON "treatments"("batch_number");

-- CreateIndex
CREATE INDEX "treatments_farm_id_type_deleted_at_idx" ON "treatments"("farm_id", "type", "deleted_at");

-- CreateIndex
CREATE INDEX "treatments_animal_id_type_deleted_at_idx" ON "treatments"("animal_id", "type", "deleted_at");

-- CreateIndex
CREATE INDEX "treatments_computed_withdrawal_meat_date_idx" ON "treatments"("computed_withdrawal_meat_date");

-- CreateIndex
CREATE INDEX "treatments_computed_withdrawal_milk_date_idx" ON "treatments"("computed_withdrawal_milk_date");

-- AddForeignKey
ALTER TABLE "age_categories" ADD CONSTRAINT "age_categories_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_substance_id_fkey" FOREIGN KEY ("substance_id") REFERENCES "active_substances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_packagings" ADD CONSTRAINT "product_packagings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_packagings" ADD CONSTRAINT "product_packagings_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_packagings" ADD CONSTRAINT "product_packagings_concentration_unit_id_fkey" FOREIGN KEY ("concentration_unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_packagings" ADD CONSTRAINT "product_packagings_volume_unit_id_fkey" FOREIGN KEY ("volume_unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapeutic_indications" ADD CONSTRAINT "therapeutic_indications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapeutic_indications" ADD CONSTRAINT "therapeutic_indications_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapeutic_indications" ADD CONSTRAINT "therapeutic_indications_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapeutic_indications" ADD CONSTRAINT "therapeutic_indications_age_category_id_fkey" FOREIGN KEY ("age_category_id") REFERENCES "age_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapeutic_indications" ADD CONSTRAINT "therapeutic_indications_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "administration_routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapeutic_indications" ADD CONSTRAINT "therapeutic_indications_dose_unit_id_fkey" FOREIGN KEY ("dose_unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_packaging_id_fkey" FOREIGN KEY ("packaging_id") REFERENCES "product_packagings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_indication_id_fkey" FOREIGN KEY ("indication_id") REFERENCES "therapeutic_indications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_quantity_unit_id_fkey" FOREIGN KEY ("quantity_unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_campaigns" ADD CONSTRAINT "personal_campaigns_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_product_preferences" ADD CONSTRAINT "farm_product_preferences_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
