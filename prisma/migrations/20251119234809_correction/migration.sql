/*
  Warnings:

  - The `dosage` column on the `medical_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `evaluation_type` to the `alert_configurations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_name` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `upload_date` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Made the column `file_url` on table `documents` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "alert_configurations_farm_id_alert_type_key";

-- AlterTable
ALTER TABLE "alert_configurations" ADD COLUMN     "category" TEXT,
ADD COLUMN     "color_hex" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "evaluation_type" TEXT NOT NULL,
ADD COLUMN     "icon_name" TEXT,
ADD COLUMN     "message_key" TEXT,
ADD COLUMN     "severity" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "title_key" TEXT,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "alert_type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "animal_ids_json" JSONB,
ADD COLUMN     "campaign_date" TIMESTAMP(3),
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "product_id" TEXT,
ADD COLUMN     "product_name" TEXT,
ADD COLUMN     "veterinarian_id" TEXT,
ADD COLUMN     "veterinarian_name" TEXT,
ADD COLUMN     "withdrawal_end_date" TIMESTAMP(3),
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "start_date" DROP NOT NULL;

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "animal_id" TEXT,
ADD COLUMN     "file_name" TEXT NOT NULL,
ADD COLUMN     "file_size_bytes" INTEGER,
ADD COLUMN     "mime_type" TEXT,
ADD COLUMN     "upload_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "uploaded_by" TEXT,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "file_url" SET NOT NULL;

-- AlterTable
ALTER TABLE "farm_preferences" ADD COLUMN     "default_breed_id" TEXT,
ADD COLUMN     "default_veterinarian_id" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "lots" ADD COLUMN     "buyer_name" TEXT,
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "price_total" DOUBLE PRECISION,
ADD COLUMN     "product_id" TEXT,
ADD COLUMN     "product_name" TEXT,
ADD COLUMN     "seller_name" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'open',
ADD COLUMN     "treatment_date" TIMESTAMP(3),
ADD COLUMN     "veterinarian_id" TEXT,
ADD COLUMN     "veterinarian_name" TEXT,
ADD COLUMN     "withdrawal_end_date" TIMESTAMP(3),
ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "medical_products" ADD COLUMN     "administration_frequency" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "default_administration_route" TEXT,
ADD COLUMN     "default_injection_site" TEXT,
ADD COLUMN     "dosage_formula" TEXT,
ADD COLUMN     "dosage_unit" TEXT,
ADD COLUMN     "form" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reminder_days" TEXT,
ADD COLUMN     "standard_cure_days" INTEGER,
ADD COLUMN     "stock_unit" TEXT,
ADD COLUMN     "storage_conditions" TEXT,
ADD COLUMN     "vaccination_protocol" TEXT,
ALTER COLUMN "current_stock" SET DEFAULT 0,
ALTER COLUMN "current_stock" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "dosage",
ADD COLUMN     "dosage" DOUBLE PRECISION,
ALTER COLUMN "min_stock" SET DEFAULT 0,
ALTER COLUMN "min_stock" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "prescription" DROP NOT NULL,
ALTER COLUMN "prescription" DROP DEFAULT,
ALTER COLUMN "prescription" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "movements" ADD COLUMN     "buyer_farm_id" TEXT,
ADD COLUMN     "is_temporary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "related_movement_id" TEXT,
ADD COLUMN     "return_date" TIMESTAMP(3),
ADD COLUMN     "return_notes" TEXT,
ADD COLUMN     "slaughterhouse_id" TEXT,
ADD COLUMN     "slaughterhouse_name" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ongoing';

-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "campaign_id" TEXT,
ADD COLUMN     "dose" DOUBLE PRECISION,
ADD COLUMN     "product_name" TEXT,
ADD COLUMN     "veterinarian_name" TEXT;

-- AlterTable
ALTER TABLE "vaccinations" ADD COLUMN     "dose" TEXT,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "veterinarian_name" TEXT;

-- AlterTable
ALTER TABLE "veterinarians" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "emergency_fee" DOUBLE PRECISION,
ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_preferred" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "working_hours" TEXT;

-- CreateIndex
CREATE INDEX "alert_configurations_farm_id_idx" ON "alert_configurations"("farm_id");

-- CreateIndex
CREATE INDEX "alert_configurations_deleted_at_idx" ON "alert_configurations"("deleted_at");

-- CreateIndex
CREATE INDEX "documents_animal_id_idx" ON "documents"("animal_id");

-- CreateIndex
CREATE INDEX "farm_preferences_deleted_at_idx" ON "farm_preferences"("deleted_at");

-- CreateIndex
CREATE INDEX "movements_status_idx" ON "movements"("status");
