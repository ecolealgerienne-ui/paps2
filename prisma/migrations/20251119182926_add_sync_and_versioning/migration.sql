-- AlterTable
ALTER TABLE "animals" ADD COLUMN     "father_id" TEXT;

-- CreateTable
CREATE TABLE "veterinarians" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "license_number" TEXT,
    "specialization" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veterinarians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active_substance" TEXT,
    "manufacturer" TEXT,
    "withdrawal_period_meat" INTEGER,
    "withdrawal_period_milk" INTEGER,
    "dosage_unit" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "disease" TEXT NOT NULL,
    "species_id" TEXT,
    "manufacturer" TEXT,
    "dosage_per_animal" DOUBLE PRECISION,
    "dosage_unit" TEXT,
    "booster_required" BOOLEAN NOT NULL DEFAULT false,
    "booster_interval_days" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vaccines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administration_routes" (
    "id" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "administration_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_configurations" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "alert_type" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "days_before_due" INTEGER NOT NULL DEFAULT 7,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
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
    "lot_id" TEXT NOT NULL,
    "animal_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "lot_animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatments" (
    "id" TEXT NOT NULL,
    "animal_id" TEXT NOT NULL,
    "product_id" TEXT,
    "veterinarian_id" TEXT,
    "route_id" TEXT,
    "diagnosis" TEXT,
    "treatment_date" TIMESTAMP(3) NOT NULL,
    "dosage" DOUBLE PRECISION,
    "dosage_unit" TEXT,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "withdrawal_end_date" TIMESTAMP(3),
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
    "animal_id" TEXT NOT NULL,
    "vaccine_id" TEXT NOT NULL,
    "veterinarian_id" TEXT,
    "route_id" TEXT,
    "campaign_id" TEXT,
    "vaccination_type" TEXT NOT NULL,
    "vaccination_date" TIMESTAMP(3) NOT NULL,
    "next_due_date" TIMESTAMP(3),
    "batch_number" TEXT,
    "dosage" DOUBLE PRECISION,
    "dosage_unit" TEXT,
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
    "movement_type" TEXT NOT NULL,
    "movement_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "buyer_name" TEXT,
    "buyer_type" TEXT,
    "buyer_contact" TEXT,
    "sale_price" DOUBLE PRECISION,
    "seller_name" TEXT,
    "purchase_price" DOUBLE PRECISION,
    "destination_farm_id" TEXT,
    "origin_farm_id" TEXT,
    "temporary_type" TEXT,
    "expected_return_date" TIMESTAMP(3),
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
    "animal_id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "weight_date" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breedings" (
    "id" TEXT NOT NULL,
    "female_id" TEXT NOT NULL,
    "male_id" TEXT,
    "method" TEXT NOT NULL,
    "breeding_date" TIMESTAMP(3) NOT NULL,
    "expected_due_date" TIMESTAMP(3),
    "actual_due_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'planned',
    "offspring_id" TEXT,
    "offspring_count" INTEGER,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breedings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "lot_id" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "target_count" INTEGER,
    "completed_count" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "document_number" TEXT,
    "issue_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "file_url" TEXT,
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
    "default_species_id" TEXT,
    "weight_unit" TEXT NOT NULL DEFAULT 'kg',
    "currency" TEXT NOT NULL DEFAULT 'DZD',
    "language" TEXT NOT NULL DEFAULT 'fr',
    "date_format" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "enable_notifications" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_preferences_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "alert_configurations_farm_id_alert_type_key" ON "alert_configurations"("farm_id", "alert_type");

-- CreateIndex
CREATE INDEX "lots_farm_id_idx" ON "lots"("farm_id");

-- CreateIndex
CREATE INDEX "lots_deleted_at_idx" ON "lots"("deleted_at");

-- CreateIndex
CREATE INDEX "lot_animals_lot_id_idx" ON "lot_animals"("lot_id");

-- CreateIndex
CREATE INDEX "lot_animals_animal_id_idx" ON "lot_animals"("animal_id");

-- CreateIndex
CREATE UNIQUE INDEX "lot_animals_lot_id_animal_id_joined_at_key" ON "lot_animals"("lot_id", "animal_id", "joined_at");

-- CreateIndex
CREATE INDEX "treatments_animal_id_idx" ON "treatments"("animal_id");

-- CreateIndex
CREATE INDEX "treatments_treatment_date_idx" ON "treatments"("treatment_date");

-- CreateIndex
CREATE INDEX "treatments_deleted_at_idx" ON "treatments"("deleted_at");

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
CREATE INDEX "movements_deleted_at_idx" ON "movements"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "movement_animals_movement_id_animal_id_key" ON "movement_animals"("movement_id", "animal_id");

-- CreateIndex
CREATE INDEX "weights_animal_id_idx" ON "weights"("animal_id");

-- CreateIndex
CREATE INDEX "weights_weight_date_idx" ON "weights"("weight_date");

-- CreateIndex
CREATE INDEX "weights_deleted_at_idx" ON "weights"("deleted_at");

-- CreateIndex
CREATE INDEX "breedings_female_id_idx" ON "breedings"("female_id");

-- CreateIndex
CREATE INDEX "breedings_breeding_date_idx" ON "breedings"("breeding_date");

-- CreateIndex
CREATE INDEX "breedings_deleted_at_idx" ON "breedings"("deleted_at");

-- CreateIndex
CREATE INDEX "campaigns_farm_id_idx" ON "campaigns"("farm_id");

-- CreateIndex
CREATE INDEX "campaigns_start_date_idx" ON "campaigns"("start_date");

-- CreateIndex
CREATE INDEX "campaigns_deleted_at_idx" ON "campaigns"("deleted_at");

-- CreateIndex
CREATE INDEX "documents_farm_id_idx" ON "documents"("farm_id");

-- CreateIndex
CREATE INDEX "documents_type_idx" ON "documents"("type");

-- CreateIndex
CREATE INDEX "documents_deleted_at_idx" ON "documents"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "farm_preferences_farm_id_key" ON "farm_preferences"("farm_id");

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
ALTER TABLE "vaccines" ADD CONSTRAINT "vaccines_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_configurations" ADD CONSTRAINT "alert_configurations_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_animals" ADD CONSTRAINT "lot_animals_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_animals" ADD CONSTRAINT "lot_animals_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "medical_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "veterinarians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "administration_routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_vaccine_id_fkey" FOREIGN KEY ("vaccine_id") REFERENCES "vaccines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "veterinarians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "administration_routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movement_animals" ADD CONSTRAINT "movement_animals_movement_id_fkey" FOREIGN KEY ("movement_id") REFERENCES "movements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movement_animals" ADD CONSTRAINT "movement_animals_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weights" ADD CONSTRAINT "weights_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breedings" ADD CONSTRAINT "breedings_female_id_fkey" FOREIGN KEY ("female_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breedings" ADD CONSTRAINT "breedings_male_id_fkey" FOREIGN KEY ("male_id") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breedings" ADD CONSTRAINT "breedings_offspring_id_fkey" FOREIGN KEY ("offspring_id") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_preferences" ADD CONSTRAINT "farm_preferences_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
