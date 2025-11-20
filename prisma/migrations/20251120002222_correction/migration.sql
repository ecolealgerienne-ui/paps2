/*
  Warnings:

  - You are about to alter the column `rating` on the `veterinarians` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Made the column `category` on table `alert_configurations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `color_hex` on table `alert_configurations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `icon_name` on table `alert_configurations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `message_key` on table `alert_configurations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title_key` on table `alert_configurations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `alert_configurations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expected_birth_date` on table `breedings` required. This step will fail if there are existing NULL values in that column.
  - Made the column `animal_ids_json` on table `campaigns` required. This step will fail if there are existing NULL values in that column.
  - Made the column `campaign_date` on table `campaigns` required. This step will fail if there are existing NULL values in that column.
  - Made the column `product_id` on table `campaigns` required. This step will fail if there are existing NULL values in that column.
  - Made the column `product_name` on table `campaigns` required. This step will fail if there are existing NULL values in that column.
  - Made the column `withdrawal_end_date` on table `campaigns` required. This step will fail if there are existing NULL values in that column.
  - Made the column `default_species_id` on table `farm_preferences` required. This step will fail if there are existing NULL values in that column.
  - Made the column `withdrawal_period_meat` on table `medical_products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `withdrawal_period_milk` on table `medical_products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category` on table `medical_products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `target_species` on table `medical_products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `medical_products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stock_unit` on table `medical_products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `product_id` on table `treatments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `withdrawal_end_date` on table `treatments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dose` on table `treatments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `product_name` on table `treatments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `administration_route` on table `vaccinations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `animal_ids` on table `vaccinations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `disease` on table `vaccinations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vaccine_name` on table `vaccinations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `withdrawal_period_days` on table `vaccinations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dose` on table `vaccinations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `vaccinations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `veterinarians` required. This step will fail if there are existing NULL values in that column.
  - Made the column `license_number` on table `veterinarians` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rating` on table `veterinarians` required. This step will fail if there are existing NULL values in that column.
  - Made the column `specialties` on table `veterinarians` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "treatments" DROP CONSTRAINT "treatments_product_id_fkey";

-- AlterTable
ALTER TABLE "alert_configurations" ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "color_hex" SET NOT NULL,
ALTER COLUMN "icon_name" SET NOT NULL,
ALTER COLUMN "message_key" SET NOT NULL,
ALTER COLUMN "title_key" SET NOT NULL,
ALTER COLUMN "type" SET NOT NULL;

-- AlterTable
ALTER TABLE "animals" ADD COLUMN     "days" INTEGER;

-- AlterTable
ALTER TABLE "breedings" ADD COLUMN     "veterinarian_name" TEXT,
ALTER COLUMN "expected_birth_date" SET NOT NULL;

-- AlterTable
ALTER TABLE "campaigns" ALTER COLUMN "animal_ids_json" SET NOT NULL,
ALTER COLUMN "animal_ids_json" SET DATA TYPE TEXT,
ALTER COLUMN "campaign_date" SET NOT NULL,
ALTER COLUMN "product_id" SET NOT NULL,
ALTER COLUMN "product_name" SET NOT NULL,
ALTER COLUMN "withdrawal_end_date" SET NOT NULL;

-- AlterTable
ALTER TABLE "farm_preferences" ALTER COLUMN "default_species_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "medical_products" ALTER COLUMN "withdrawal_period_meat" SET NOT NULL,
ALTER COLUMN "withdrawal_period_milk" SET NOT NULL,
ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "target_species" SET NOT NULL,
ALTER COLUMN "target_species" SET DEFAULT '',
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'treatment',
ALTER COLUMN "stock_unit" SET NOT NULL;

-- AlterTable
ALTER TABLE "movements" ADD COLUMN     "buyer_qr_signature" TEXT,
ADD COLUMN     "lot_id" TEXT;

-- AlterTable
ALTER TABLE "treatments" ALTER COLUMN "product_id" SET NOT NULL,
ALTER COLUMN "withdrawal_end_date" SET NOT NULL,
ALTER COLUMN "dose" SET NOT NULL,
ALTER COLUMN "product_name" SET NOT NULL;

-- AlterTable
ALTER TABLE "vaccinations" ALTER COLUMN "administration_route" SET NOT NULL,
ALTER COLUMN "animal_ids" SET NOT NULL,
ALTER COLUMN "animal_ids" SET DATA TYPE TEXT,
ALTER COLUMN "disease" SET NOT NULL,
ALTER COLUMN "vaccine_name" SET NOT NULL,
ALTER COLUMN "withdrawal_period_days" SET NOT NULL,
ALTER COLUMN "dose" SET NOT NULL,
ALTER COLUMN "type" SET NOT NULL;

-- AlterTable
ALTER TABLE "veterinarians" ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "license_number" SET NOT NULL,
ALTER COLUMN "rating" SET NOT NULL,
ALTER COLUMN "rating" SET DEFAULT 5,
ALTER COLUMN "rating" SET DATA TYPE INTEGER,
ALTER COLUMN "specialties" SET NOT NULL,
ALTER COLUMN "specialties" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "medical_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
