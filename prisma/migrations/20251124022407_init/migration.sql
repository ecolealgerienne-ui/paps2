-- CreateEnum
CREATE TYPE "VaccineTargetDisease" AS ENUM ('brucellosis', 'bluetongue', 'foot_and_mouth', 'rabies', 'anthrax', 'lumpy_skin', 'ppr', 'sheep_pox', 'enterotoxemia', 'pasteurellosis', 'other');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('vaccination', 'deworming', 'screening', 'treatment', 'census', 'other');

-- CreateEnum
CREATE TYPE "MedicalProductType" AS ENUM ('antibiotic', 'anti_inflammatory', 'antiparasitic', 'vitamin', 'mineral', 'vaccine', 'anesthetic', 'hormone', 'other');

-- CreateEnum
CREATE TYPE "AlertCategory" AS ENUM ('health', 'vaccination', 'treatment', 'reproduction', 'nutrition', 'administrative', 'other');

-- CreateEnum
CREATE TYPE "AlertPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "PersonalCampaignStatus" AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('fr', 'en', 'ar');

-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('kg', 'lb');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('DZD', 'EUR', 'USD', 'MAD');

-- CreateTable
CREATE TABLE "species" (
    "id" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breeds" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "species_id" TEXT NOT NULL,
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

    CONSTRAINT "breeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "code" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "region" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "breed_countries" (
    "id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breed_countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "national_campaigns" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description" TEXT,
    "type" "CampaignType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "national_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_countries" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_breed_preferences" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_breed_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccines_global" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description" TEXT,
    "target_disease" "VaccineTargetDisease" NOT NULL,
    "laboratoire" TEXT,
    "numero_amm" TEXT,
    "dosage_recommande" TEXT,
    "duree_immunite" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vaccines_global_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccine_countries" (
    "id" TEXT NOT NULL,
    "vaccine_id" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "numero_amm" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vaccine_countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veterinarians" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "title" TEXT,
    "license_number" TEXT NOT NULL,
    "specialties" TEXT NOT NULL,
    "clinic" TEXT,
    "phone" TEXT NOT NULL,
    "mobile" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "department" TEXT,
    "commune" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "emergency_service" BOOLEAN NOT NULL DEFAULT false,
    "working_hours" TEXT,
    "consultation_fee" DOUBLE PRECISION,
    "emergency_fee" DOUBLE PRECISION,
    "currency" TEXT,
    "notes" TEXT,
    "is_preferred" BOOLEAN NOT NULL DEFAULT false,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "total_interventions" INTEGER NOT NULL DEFAULT 0,
    "last_intervention_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veterinarians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_medical_products" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "commercial_name" TEXT,
    "category" TEXT NOT NULL,
    "active_ingredient" TEXT,
    "manufacturer" TEXT,
    "form" TEXT,
    "dosage" DOUBLE PRECISION,
    "dosage_unit" TEXT,
    "withdrawal_period_meat" INTEGER NOT NULL,
    "withdrawal_period_milk" INTEGER NOT NULL,
    "current_stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "min_stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock_unit" TEXT NOT NULL,
    "unit_price" DOUBLE PRECISION,
    "currency" TEXT,
    "batch_number" TEXT,
    "expiry_date" TIMESTAMP(3),
    "storage_conditions" TEXT,
    "prescription" TEXT,
    "type" TEXT NOT NULL DEFAULT 'treatment',
    "target_species" TEXT NOT NULL DEFAULT '',
    "standard_cure_days" INTEGER,
    "administration_frequency" TEXT,
    "dosage_formula" TEXT,
    "vaccination_protocol" TEXT,
    "reminder_days" TEXT,
    "default_administration_route" TEXT,
    "default_injection_site" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_medical_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_vaccines" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "target_disease" TEXT,
    "laboratoire" TEXT,
    "dosage" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_vaccines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administration_routes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administration_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_medical_products" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description" TEXT,
    "type" "MedicalProductType" NOT NULL,
    "principe_actif" TEXT,
    "laboratoire" TEXT,
    "numero_amm" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_medical_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_countries" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "numero_amm" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description_fr" TEXT,
    "description_en" TEXT,
    "description_ar" TEXT,
    "category" "AlertCategory" NOT NULL,
    "priority" "AlertPriority" NOT NULL DEFAULT 'medium',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_configurations" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "enable_email_alerts" BOOLEAN NOT NULL DEFAULT true,
    "enable_sms_alerts" BOOLEAN NOT NULL DEFAULT false,
    "enable_push_alerts" BOOLEAN NOT NULL DEFAULT true,
    "vaccination_reminder_days" INTEGER NOT NULL DEFAULT 7,
    "treatment_reminder_days" INTEGER NOT NULL DEFAULT 3,
    "health_check_reminder_days" INTEGER NOT NULL DEFAULT 30,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "group_id" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "postal_code" TEXT,
    "city" TEXT,
    "country" TEXT,
    "department" TEXT,
    "commune" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "location" TEXT NOT NULL,
    "cheptel_number" TEXT,
    "group_name" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animals" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "current_location_farm_id" TEXT,
    "current_eid" TEXT,
    "official_number" TEXT,
    "visual_id" TEXT,
    "eid_history" TEXT,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "sex" TEXT NOT NULL,
    "mother_id" TEXT,
    "father_id" TEXT,
    "species_id" TEXT,
    "breed_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'alive',
    "validated_at" TIMESTAMP(3),
    "photo_url" TEXT,
    "notes" TEXT,
    "days" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "product_id" TEXT,
    "product_name" TEXT,
    "treatment_date" TIMESTAMP(3),
    "withdrawal_end_date" TIMESTAMP(3),
    "veterinarian_id" TEXT,
    "veterinarian_name" TEXT,
    "price_total" DOUBLE PRECISION,
    "buyer_name" TEXT,
    "seller_name" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lot_animals" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "lot_id" TEXT NOT NULL,
    "animal_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lot_animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatments" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "animal_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "veterinarian_id" TEXT,
    "veterinarian_name" TEXT,
    "campaign_id" TEXT,
    "route_id" TEXT,
    "diagnosis" TEXT,
    "treatment_date" TIMESTAMP(3) NOT NULL,
    "dose" DOUBLE PRECISION NOT NULL,
    "dosage" DOUBLE PRECISION,
    "dosage_unit" TEXT,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "withdrawal_end_date" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccinations" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "animal_id" TEXT,
    "animal_ids" TEXT NOT NULL,
    "protocol_id" TEXT,
    "vaccine_name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "disease" TEXT NOT NULL,
    "vaccination_date" TIMESTAMP(3) NOT NULL,
    "batch_number" TEXT,
    "expiry_date" TIMESTAMP(3),
    "dose" TEXT NOT NULL,
    "administration_route" TEXT NOT NULL,
    "next_due_date" TIMESTAMP(3),
    "veterinarian_id" TEXT,
    "veterinarian_name" TEXT,
    "withdrawal_period_days" INTEGER NOT NULL,
    "dosage" DOUBLE PRECISION,
    "cost" DOUBLE PRECISION,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vaccinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movements" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "lot_id" TEXT,
    "movement_type" TEXT NOT NULL,
    "movement_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ongoing',
    "buyer_name" TEXT,
    "buyer_type" TEXT,
    "buyer_contact" TEXT,
    "buyer_farm_id" TEXT,
    "buyer_qr_signature" TEXT,
    "sale_price" DOUBLE PRECISION,
    "seller_name" TEXT,
    "purchase_price" DOUBLE PRECISION,
    "destination_farm_id" TEXT,
    "origin_farm_id" TEXT,
    "slaughterhouse_name" TEXT,
    "slaughterhouse_id" TEXT,
    "is_temporary" BOOLEAN NOT NULL DEFAULT false,
    "temporary_type" TEXT,
    "expected_return_date" TIMESTAMP(3),
    "return_date" TIMESTAMP(3),
    "return_notes" TEXT,
    "related_movement_id" TEXT,
    "document_number" TEXT,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movement_animals" (
    "id" TEXT NOT NULL,
    "movement_id" TEXT NOT NULL,
    "animal_id" TEXT NOT NULL,

    CONSTRAINT "movement_animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weights" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "animal_id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "weight_date" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breedings" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "mother_id" TEXT NOT NULL,
    "father_id" TEXT,
    "father_name" TEXT,
    "method" TEXT NOT NULL,
    "breeding_date" TIMESTAMP(3) NOT NULL,
    "expected_birth_date" TIMESTAMP(3) NOT NULL,
    "actual_birth_date" TIMESTAMP(3),
    "expected_offspring_count" INTEGER,
    "offspring_ids" JSONB,
    "veterinarian_id" TEXT,
    "veterinarian_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breedings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_campaigns" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "lot_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "campaign_date" TIMESTAMP(3) NOT NULL,
    "withdrawal_end_date" TIMESTAMP(3) NOT NULL,
    "veterinarian_id" TEXT,
    "veterinarian_name" TEXT,
    "animal_ids_json" TEXT NOT NULL,
    "status" "PersonalCampaignStatus" NOT NULL DEFAULT 'planned',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "target_count" INTEGER,
    "completed_count" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "animal_id" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size_bytes" INTEGER,
    "mime_type" TEXT,
    "upload_date" TIMESTAMP(3) NOT NULL,
    "document_number" TEXT,
    "issue_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "uploaded_by" TEXT,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_preferences" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "default_veterinarian_id" TEXT,
    "default_species_id" TEXT,
    "default_breed_id" TEXT,
    "weight_unit" "WeightUnit" NOT NULL DEFAULT 'kg',
    "currency" "Currency" NOT NULL DEFAULT 'DZD',
    "language" "Language" NOT NULL DEFAULT 'fr',
    "date_format" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "enable_notifications" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_product_preferences" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "global_product_id" TEXT,
    "custom_product_id" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_product_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_veterinarian_preferences" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "veterinarian_id" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_veterinarian_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_vaccine_preferences" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "global_vaccine_id" TEXT,
    "custom_vaccine_id" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_vaccine_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_national_campaign_preferences" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "is_enrolled" BOOLEAN NOT NULL DEFAULT false,
    "enrolled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_national_campaign_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_queue_items" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "client_timestamp" TIMESTAMP(3) NOT NULL,
    "server_timestamp" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "conflict_data" JSONB,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "sync_queue_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "sync_type" TEXT NOT NULL,
    "items_count" INTEGER NOT NULL,
    "success_count" INTEGER NOT NULL,
    "failure_count" INTEGER NOT NULL,
    "conflict_count" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "device_info" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "species_deleted_at_idx" ON "species"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "breeds_code_key" ON "breeds"("code");

-- CreateIndex
CREATE INDEX "breeds_species_id_idx" ON "breeds"("species_id");

-- CreateIndex
CREATE INDEX "breeds_code_idx" ON "breeds"("code");

-- CreateIndex
CREATE INDEX "breeds_deleted_at_idx" ON "breeds"("deleted_at");

-- CreateIndex
CREATE INDEX "breeds_display_order_idx" ON "breeds"("display_order");

-- CreateIndex
CREATE INDEX "breeds_is_active_idx" ON "breeds"("is_active");

-- CreateIndex
CREATE INDEX "breeds_species_id_is_active_deleted_at_idx" ON "breeds"("species_id", "is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "breeds_species_id_display_order_idx" ON "breeds"("species_id", "display_order");

-- CreateIndex
CREATE INDEX "countries_is_active_idx" ON "countries"("is_active");

-- CreateIndex
CREATE INDEX "countries_region_idx" ON "countries"("region");

-- CreateIndex
CREATE INDEX "breed_countries_breed_id_idx" ON "breed_countries"("breed_id");

-- CreateIndex
CREATE INDEX "breed_countries_country_code_idx" ON "breed_countries"("country_code");

-- CreateIndex
CREATE INDEX "breed_countries_is_active_idx" ON "breed_countries"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "breed_countries_breed_id_country_code_key" ON "breed_countries"("breed_id", "country_code");

-- CreateIndex
CREATE UNIQUE INDEX "national_campaigns_code_key" ON "national_campaigns"("code");

-- CreateIndex
CREATE INDEX "national_campaigns_code_idx" ON "national_campaigns"("code");

-- CreateIndex
CREATE INDEX "national_campaigns_type_idx" ON "national_campaigns"("type");

-- CreateIndex
CREATE INDEX "national_campaigns_is_active_idx" ON "national_campaigns"("is_active");

-- CreateIndex
CREATE INDEX "national_campaigns_start_date_idx" ON "national_campaigns"("start_date");

-- CreateIndex
CREATE INDEX "national_campaigns_deleted_at_idx" ON "national_campaigns"("deleted_at");

-- CreateIndex
CREATE INDEX "campaign_countries_campaign_id_idx" ON "campaign_countries"("campaign_id");

-- CreateIndex
CREATE INDEX "campaign_countries_country_code_idx" ON "campaign_countries"("country_code");

-- CreateIndex
CREATE INDEX "campaign_countries_is_active_idx" ON "campaign_countries"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_countries_campaign_id_country_code_key" ON "campaign_countries"("campaign_id", "country_code");

-- CreateIndex
CREATE INDEX "farm_breed_preferences_farm_id_idx" ON "farm_breed_preferences"("farm_id");

-- CreateIndex
CREATE INDEX "farm_breed_preferences_breed_id_idx" ON "farm_breed_preferences"("breed_id");

-- CreateIndex
CREATE INDEX "farm_breed_preferences_display_order_idx" ON "farm_breed_preferences"("display_order");

-- CreateIndex
CREATE UNIQUE INDEX "farm_breed_preferences_farm_id_breed_id_key" ON "farm_breed_preferences"("farm_id", "breed_id");

-- CreateIndex
CREATE UNIQUE INDEX "vaccines_global_code_key" ON "vaccines_global"("code");

-- CreateIndex
CREATE INDEX "vaccines_global_code_idx" ON "vaccines_global"("code");

-- CreateIndex
CREATE INDEX "vaccines_global_target_disease_idx" ON "vaccines_global"("target_disease");

-- CreateIndex
CREATE INDEX "vaccines_global_deleted_at_idx" ON "vaccines_global"("deleted_at");

-- CreateIndex
CREATE INDEX "vaccine_countries_vaccine_id_idx" ON "vaccine_countries"("vaccine_id");

-- CreateIndex
CREATE INDEX "vaccine_countries_country_code_idx" ON "vaccine_countries"("country_code");

-- CreateIndex
CREATE UNIQUE INDEX "vaccine_countries_vaccine_id_country_code_key" ON "vaccine_countries"("vaccine_id", "country_code");

-- CreateIndex
CREATE INDEX "veterinarians_farm_id_idx" ON "veterinarians"("farm_id");

-- CreateIndex
CREATE INDEX "veterinarians_deleted_at_idx" ON "veterinarians"("deleted_at");

-- CreateIndex
CREATE INDEX "veterinarians_is_active_idx" ON "veterinarians"("is_active");

-- CreateIndex
CREATE INDEX "veterinarians_is_default_idx" ON "veterinarians"("is_default");

-- CreateIndex
CREATE INDEX "veterinarians_department_idx" ON "veterinarians"("department");

-- CreateIndex
CREATE INDEX "veterinarians_farm_id_is_active_deleted_at_idx" ON "veterinarians"("farm_id", "is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "veterinarians_department_is_active_idx" ON "veterinarians"("department", "is_active");

-- CreateIndex
CREATE INDEX "veterinarians_farm_id_is_default_idx" ON "veterinarians"("farm_id", "is_default");

-- CreateIndex
CREATE INDEX "custom_medical_products_farm_id_idx" ON "custom_medical_products"("farm_id");

-- CreateIndex
CREATE INDEX "custom_medical_products_deleted_at_idx" ON "custom_medical_products"("deleted_at");

-- CreateIndex
CREATE INDEX "custom_vaccines_farm_id_idx" ON "custom_vaccines"("farm_id");

-- CreateIndex
CREATE INDEX "custom_vaccines_deleted_at_idx" ON "custom_vaccines"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "administration_routes_code_key" ON "administration_routes"("code");

-- CreateIndex
CREATE INDEX "administration_routes_code_idx" ON "administration_routes"("code");

-- CreateIndex
CREATE INDEX "administration_routes_deleted_at_idx" ON "administration_routes"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "global_medical_products_code_key" ON "global_medical_products"("code");

-- CreateIndex
CREATE INDEX "global_medical_products_code_idx" ON "global_medical_products"("code");

-- CreateIndex
CREATE INDEX "global_medical_products_type_idx" ON "global_medical_products"("type");

-- CreateIndex
CREATE INDEX "global_medical_products_laboratoire_idx" ON "global_medical_products"("laboratoire");

-- CreateIndex
CREATE INDEX "global_medical_products_deleted_at_idx" ON "global_medical_products"("deleted_at");

-- CreateIndex
CREATE INDEX "product_countries_product_id_idx" ON "product_countries"("product_id");

-- CreateIndex
CREATE INDEX "product_countries_country_code_idx" ON "product_countries"("country_code");

-- CreateIndex
CREATE UNIQUE INDEX "product_countries_product_id_country_code_key" ON "product_countries"("product_id", "country_code");

-- CreateIndex
CREATE UNIQUE INDEX "alert_templates_code_key" ON "alert_templates"("code");

-- CreateIndex
CREATE INDEX "alert_templates_code_idx" ON "alert_templates"("code");

-- CreateIndex
CREATE INDEX "alert_templates_category_idx" ON "alert_templates"("category");

-- CreateIndex
CREATE INDEX "alert_templates_priority_idx" ON "alert_templates"("priority");

-- CreateIndex
CREATE INDEX "alert_templates_is_active_idx" ON "alert_templates"("is_active");

-- CreateIndex
CREATE INDEX "alert_templates_deleted_at_idx" ON "alert_templates"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "alert_configurations_farm_id_key" ON "alert_configurations"("farm_id");

-- CreateIndex
CREATE INDEX "alert_configurations_deleted_at_idx" ON "alert_configurations"("deleted_at");

-- CreateIndex
CREATE INDEX "farms_owner_id_idx" ON "farms"("owner_id");

-- CreateIndex
CREATE INDEX "farms_group_id_idx" ON "farms"("group_id");

-- CreateIndex
CREATE INDEX "farms_is_default_idx" ON "farms"("is_default");

-- CreateIndex
CREATE INDEX "farms_is_active_idx" ON "farms"("is_active");

-- CreateIndex
CREATE INDEX "farms_deleted_at_idx" ON "farms"("deleted_at");

-- CreateIndex
CREATE INDEX "farms_country_idx" ON "farms"("country");

-- CreateIndex
CREATE INDEX "farms_department_idx" ON "farms"("department");

-- CreateIndex
CREATE INDEX "farms_owner_id_is_active_deleted_at_idx" ON "farms"("owner_id", "is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "farms_country_department_idx" ON "farms"("country", "department");

-- CreateIndex
CREATE INDEX "farms_owner_id_is_default_idx" ON "farms"("owner_id", "is_default");

-- CreateIndex
CREATE INDEX "animals_farm_id_idx" ON "animals"("farm_id");

-- CreateIndex
CREATE INDEX "animals_status_idx" ON "animals"("status");

-- CreateIndex
CREATE INDEX "animals_deleted_at_idx" ON "animals"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "animals_farm_id_current_eid_key" ON "animals"("farm_id", "current_eid");

-- CreateIndex
CREATE UNIQUE INDEX "animals_farm_id_official_number_key" ON "animals"("farm_id", "official_number");

-- CreateIndex
CREATE INDEX "lots_farm_id_idx" ON "lots"("farm_id");

-- CreateIndex
CREATE INDEX "lots_deleted_at_idx" ON "lots"("deleted_at");

-- CreateIndex
CREATE INDEX "lot_animals_farm_id_idx" ON "lot_animals"("farm_id");

-- CreateIndex
CREATE INDEX "lot_animals_lot_id_idx" ON "lot_animals"("lot_id");

-- CreateIndex
CREATE INDEX "lot_animals_animal_id_idx" ON "lot_animals"("animal_id");

-- CreateIndex
CREATE UNIQUE INDEX "lot_animals_lot_id_animal_id_joined_at_key" ON "lot_animals"("lot_id", "animal_id", "joined_at");

-- CreateIndex
CREATE INDEX "treatments_farm_id_idx" ON "treatments"("farm_id");

-- CreateIndex
CREATE INDEX "treatments_animal_id_idx" ON "treatments"("animal_id");

-- CreateIndex
CREATE INDEX "treatments_treatment_date_idx" ON "treatments"("treatment_date");

-- CreateIndex
CREATE INDEX "treatments_deleted_at_idx" ON "treatments"("deleted_at");

-- CreateIndex
CREATE INDEX "vaccinations_farm_id_idx" ON "vaccinations"("farm_id");

-- CreateIndex
CREATE INDEX "vaccinations_animal_id_idx" ON "vaccinations"("animal_id");

-- CreateIndex
CREATE INDEX "vaccinations_vaccination_date_idx" ON "vaccinations"("vaccination_date");

-- CreateIndex
CREATE INDEX "vaccinations_deleted_at_idx" ON "vaccinations"("deleted_at");

-- CreateIndex
CREATE INDEX "movements_farm_id_idx" ON "movements"("farm_id");

-- CreateIndex
CREATE INDEX "movements_movement_date_idx" ON "movements"("movement_date");

-- CreateIndex
CREATE INDEX "movements_movement_type_idx" ON "movements"("movement_type");

-- CreateIndex
CREATE INDEX "movements_status_idx" ON "movements"("status");

-- CreateIndex
CREATE INDEX "movements_deleted_at_idx" ON "movements"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "movement_animals_movement_id_animal_id_key" ON "movement_animals"("movement_id", "animal_id");

-- CreateIndex
CREATE INDEX "weights_farm_id_idx" ON "weights"("farm_id");

-- CreateIndex
CREATE INDEX "weights_animal_id_idx" ON "weights"("animal_id");

-- CreateIndex
CREATE INDEX "weights_weight_date_idx" ON "weights"("weight_date");

-- CreateIndex
CREATE INDEX "weights_deleted_at_idx" ON "weights"("deleted_at");

-- CreateIndex
CREATE INDEX "breedings_farm_id_idx" ON "breedings"("farm_id");

-- CreateIndex
CREATE INDEX "breedings_mother_id_idx" ON "breedings"("mother_id");

-- CreateIndex
CREATE INDEX "breedings_breeding_date_idx" ON "breedings"("breeding_date");

-- CreateIndex
CREATE INDEX "breedings_deleted_at_idx" ON "breedings"("deleted_at");

-- CreateIndex
CREATE INDEX "personal_campaigns_farm_id_idx" ON "personal_campaigns"("farm_id");

-- CreateIndex
CREATE INDEX "personal_campaigns_status_idx" ON "personal_campaigns"("status");

-- CreateIndex
CREATE INDEX "personal_campaigns_start_date_idx" ON "personal_campaigns"("start_date");

-- CreateIndex
CREATE INDEX "personal_campaigns_deleted_at_idx" ON "personal_campaigns"("deleted_at");

-- CreateIndex
CREATE INDEX "documents_farm_id_idx" ON "documents"("farm_id");

-- CreateIndex
CREATE INDEX "documents_animal_id_idx" ON "documents"("animal_id");

-- CreateIndex
CREATE INDEX "documents_type_idx" ON "documents"("type");

-- CreateIndex
CREATE INDEX "documents_deleted_at_idx" ON "documents"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "farm_preferences_farm_id_key" ON "farm_preferences"("farm_id");

-- CreateIndex
CREATE INDEX "farm_preferences_deleted_at_idx" ON "farm_preferences"("deleted_at");

-- CreateIndex
CREATE INDEX "farm_product_preferences_farm_id_idx" ON "farm_product_preferences"("farm_id");

-- CreateIndex
CREATE INDEX "farm_product_preferences_global_product_id_idx" ON "farm_product_preferences"("global_product_id");

-- CreateIndex
CREATE INDEX "farm_product_preferences_custom_product_id_idx" ON "farm_product_preferences"("custom_product_id");

-- CreateIndex
CREATE INDEX "farm_veterinarian_preferences_farm_id_idx" ON "farm_veterinarian_preferences"("farm_id");

-- CreateIndex
CREATE INDEX "farm_veterinarian_preferences_veterinarian_id_idx" ON "farm_veterinarian_preferences"("veterinarian_id");

-- CreateIndex
CREATE UNIQUE INDEX "farm_veterinarian_preferences_farm_id_veterinarian_id_key" ON "farm_veterinarian_preferences"("farm_id", "veterinarian_id");

-- CreateIndex
CREATE INDEX "farm_vaccine_preferences_farm_id_idx" ON "farm_vaccine_preferences"("farm_id");

-- CreateIndex
CREATE INDEX "farm_vaccine_preferences_global_vaccine_id_idx" ON "farm_vaccine_preferences"("global_vaccine_id");

-- CreateIndex
CREATE INDEX "farm_vaccine_preferences_custom_vaccine_id_idx" ON "farm_vaccine_preferences"("custom_vaccine_id");

-- CreateIndex
CREATE INDEX "farm_national_campaign_preferences_farm_id_idx" ON "farm_national_campaign_preferences"("farm_id");

-- CreateIndex
CREATE INDEX "farm_national_campaign_preferences_campaign_id_idx" ON "farm_national_campaign_preferences"("campaign_id");

-- CreateIndex
CREATE INDEX "farm_national_campaign_preferences_is_enrolled_idx" ON "farm_national_campaign_preferences"("is_enrolled");

-- CreateIndex
CREATE UNIQUE INDEX "farm_national_campaign_preferences_farm_id_campaign_id_key" ON "farm_national_campaign_preferences"("farm_id", "campaign_id");

-- CreateIndex
CREATE INDEX "sync_queue_items_farm_id_idx" ON "sync_queue_items"("farm_id");

-- CreateIndex
CREATE INDEX "sync_queue_items_status_idx" ON "sync_queue_items"("status");

-- CreateIndex
CREATE INDEX "sync_queue_items_entity_type_entity_id_idx" ON "sync_queue_items"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "sync_queue_items_created_at_idx" ON "sync_queue_items"("created_at");

-- CreateIndex
CREATE INDEX "sync_logs_farm_id_idx" ON "sync_logs"("farm_id");

-- CreateIndex
CREATE INDEX "sync_logs_created_at_idx" ON "sync_logs"("created_at");

-- AddForeignKey
ALTER TABLE "breeds" ADD CONSTRAINT "breeds_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_countries" ADD CONSTRAINT "breed_countries_breed_id_fkey" FOREIGN KEY ("breed_id") REFERENCES "breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_countries" ADD CONSTRAINT "breed_countries_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_countries" ADD CONSTRAINT "campaign_countries_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "national_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_countries" ADD CONSTRAINT "campaign_countries_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_breed_preferences" ADD CONSTRAINT "farm_breed_preferences_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_breed_preferences" ADD CONSTRAINT "farm_breed_preferences_breed_id_fkey" FOREIGN KEY ("breed_id") REFERENCES "breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_countries" ADD CONSTRAINT "vaccine_countries_vaccine_id_fkey" FOREIGN KEY ("vaccine_id") REFERENCES "vaccines_global"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_countries" ADD CONSTRAINT "vaccine_countries_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veterinarians" ADD CONSTRAINT "veterinarians_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_medical_products" ADD CONSTRAINT "custom_medical_products_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_vaccines" ADD CONSTRAINT "custom_vaccines_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_countries" ADD CONSTRAINT "product_countries_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "global_medical_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_countries" ADD CONSTRAINT "product_countries_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_configurations" ADD CONSTRAINT "alert_configurations_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_breed_id_fkey" FOREIGN KEY ("breed_id") REFERENCES "breeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_animals" ADD CONSTRAINT "lot_animals_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_animals" ADD CONSTRAINT "lot_animals_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_animals" ADD CONSTRAINT "lot_animals_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "custom_medical_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "veterinarians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "administration_routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "veterinarians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movement_animals" ADD CONSTRAINT "movement_animals_movement_id_fkey" FOREIGN KEY ("movement_id") REFERENCES "movements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movement_animals" ADD CONSTRAINT "movement_animals_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weights" ADD CONSTRAINT "weights_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weights" ADD CONSTRAINT "weights_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breedings" ADD CONSTRAINT "breedings_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breedings" ADD CONSTRAINT "breedings_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breedings" ADD CONSTRAINT "breedings_father_id_fkey" FOREIGN KEY ("father_id") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_campaigns" ADD CONSTRAINT "personal_campaigns_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_campaigns" ADD CONSTRAINT "personal_campaigns_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_preferences" ADD CONSTRAINT "farm_preferences_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_product_preferences" ADD CONSTRAINT "farm_product_preferences_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_product_preferences" ADD CONSTRAINT "farm_product_preferences_global_product_id_fkey" FOREIGN KEY ("global_product_id") REFERENCES "global_medical_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_product_preferences" ADD CONSTRAINT "farm_product_preferences_custom_product_id_fkey" FOREIGN KEY ("custom_product_id") REFERENCES "custom_medical_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_veterinarian_preferences" ADD CONSTRAINT "farm_veterinarian_preferences_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_veterinarian_preferences" ADD CONSTRAINT "farm_veterinarian_preferences_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "veterinarians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_vaccine_preferences" ADD CONSTRAINT "farm_vaccine_preferences_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_vaccine_preferences" ADD CONSTRAINT "farm_vaccine_preferences_global_vaccine_id_fkey" FOREIGN KEY ("global_vaccine_id") REFERENCES "vaccines_global"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_vaccine_preferences" ADD CONSTRAINT "farm_vaccine_preferences_custom_vaccine_id_fkey" FOREIGN KEY ("custom_vaccine_id") REFERENCES "custom_vaccines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_national_campaign_preferences" ADD CONSTRAINT "farm_national_campaign_preferences_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_national_campaign_preferences" ADD CONSTRAINT "farm_national_campaign_preferences_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "national_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
