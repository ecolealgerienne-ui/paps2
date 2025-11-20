/*
  Warnings:

  - You are about to drop the column `actual_due_date` on the `breedings` table. All the data in the column will be lost.
  - You are about to drop the column `expected_due_date` on the `breedings` table. All the data in the column will be lost.
  - You are about to drop the column `female_id` on the `breedings` table. All the data in the column will be lost.
  - You are about to drop the column `male_id` on the `breedings` table. All the data in the column will be lost.
  - You are about to drop the column `offspring_count` on the `breedings` table. All the data in the column will be lost.
  - You are about to drop the column `offspring_id` on the `breedings` table. All the data in the column will be lost.
  - You are about to drop the column `active_substance` on the `medical_products` table. All the data in the column will be lost.
  - You are about to drop the column `dosage_unit` on the `medical_products` table. All the data in the column will be lost.
  - You are about to drop the column `campaign_id` on the `vaccinations` table. All the data in the column will be lost.
  - You are about to drop the column `dosage_unit` on the `vaccinations` table. All the data in the column will be lost.
  - You are about to drop the column `route_id` on the `vaccinations` table. All the data in the column will be lost.
  - You are about to drop the column `vaccination_type` on the `vaccinations` table. All the data in the column will be lost.
  - You are about to drop the column `vaccine_id` on the `vaccinations` table. All the data in the column will be lost.
  - You are about to drop the column `booster_interval_days` on the `vaccines` table. All the data in the column will be lost.
  - You are about to drop the column `booster_required` on the `vaccines` table. All the data in the column will be lost.
  - You are about to drop the column `disease` on the `vaccines` table. All the data in the column will be lost.
  - You are about to drop the column `dosage_per_animal` on the `vaccines` table. All the data in the column will be lost.
  - You are about to drop the column `dosage_unit` on the `vaccines` table. All the data in the column will be lost.
  - You are about to drop the column `species_id` on the `vaccines` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `veterinarians` table. All the data in the column will be lost.
  - You are about to drop the column `specialization` on the `veterinarians` table. All the data in the column will be lost.
  - Added the required column `mother_id` to the `breedings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `veterinarians` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `veterinarians` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "breedings" DROP CONSTRAINT "breedings_female_id_fkey";

-- DropForeignKey
ALTER TABLE "breedings" DROP CONSTRAINT "breedings_male_id_fkey";

-- DropForeignKey
ALTER TABLE "breedings" DROP CONSTRAINT "breedings_offspring_id_fkey";

-- DropForeignKey
ALTER TABLE "vaccinations" DROP CONSTRAINT "vaccinations_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "vaccinations" DROP CONSTRAINT "vaccinations_route_id_fkey";

-- DropForeignKey
ALTER TABLE "vaccinations" DROP CONSTRAINT "vaccinations_vaccine_id_fkey";

-- DropForeignKey
ALTER TABLE "vaccines" DROP CONSTRAINT "vaccines_species_id_fkey";

-- DropIndex
DROP INDEX "breedings_female_id_idx";

-- AlterTable
ALTER TABLE "breedings" DROP COLUMN "actual_due_date",
DROP COLUMN "expected_due_date",
DROP COLUMN "female_id",
DROP COLUMN "male_id",
DROP COLUMN "offspring_count",
DROP COLUMN "offspring_id",
ADD COLUMN     "actual_birth_date" TIMESTAMP(3),
ADD COLUMN     "expected_birth_date" TIMESTAMP(3),
ADD COLUMN     "expected_offspring_count" INTEGER,
ADD COLUMN     "father_id" TEXT,
ADD COLUMN     "father_name" TEXT,
ADD COLUMN     "mother_id" TEXT NOT NULL,
ADD COLUMN     "offspring_ids" JSONB,
ADD COLUMN     "veterinarian_id" TEXT;

-- AlterTable
ALTER TABLE "medical_products" DROP COLUMN "active_substance",
DROP COLUMN "dosage_unit",
ADD COLUMN     "active_ingredient" TEXT,
ADD COLUMN     "batch_number" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "commercial_name" TEXT,
ADD COLUMN     "current_stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dosage" TEXT,
ADD COLUMN     "expiry_date" TIMESTAMP(3),
ADD COLUMN     "min_stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prescription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "target_species" TEXT,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "unit_price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "vaccinations" DROP COLUMN "campaign_id",
DROP COLUMN "dosage_unit",
DROP COLUMN "route_id",
DROP COLUMN "vaccination_type",
DROP COLUMN "vaccine_id",
ADD COLUMN     "administration_route" TEXT,
ADD COLUMN     "animal_ids" JSONB,
ADD COLUMN     "disease" TEXT,
ADD COLUMN     "expiry_date" TIMESTAMP(3),
ADD COLUMN     "protocol_id" TEXT,
ADD COLUMN     "vaccine_name" TEXT,
ADD COLUMN     "withdrawal_period_days" INTEGER,
ALTER COLUMN "animal_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "vaccines" DROP COLUMN "booster_interval_days",
DROP COLUMN "booster_required",
DROP COLUMN "disease",
DROP COLUMN "dosage_per_animal",
DROP COLUMN "dosage_unit",
DROP COLUMN "species_id",
ADD COLUMN     "administration_route" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "injection_interval_days" INTEGER,
ADD COLUMN     "injections_required" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "meat_withdrawal_days" INTEGER,
ADD COLUMN     "milk_withdrawal_days" INTEGER,
ADD COLUMN     "standard_dose" DOUBLE PRECISION,
ADD COLUMN     "target_diseases" JSONB,
ADD COLUMN     "target_species" JSONB;

-- AlterTable
ALTER TABLE "veterinarians" DROP COLUMN "name",
DROP COLUMN "specialization",
ADD COLUMN     "clinic" TEXT,
ADD COLUMN     "consultation_fee" DOUBLE PRECISION,
ADD COLUMN     "emergency_service" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "is_available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_intervention_date" TIMESTAMP(3),
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "specialties" JSONB,
ADD COLUMN     "total_interventions" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "breedings_mother_id_idx" ON "breedings"("mother_id");

-- AddForeignKey
ALTER TABLE "breedings" ADD CONSTRAINT "breedings_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breedings" ADD CONSTRAINT "breedings_father_id_fkey" FOREIGN KEY ("father_id") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
