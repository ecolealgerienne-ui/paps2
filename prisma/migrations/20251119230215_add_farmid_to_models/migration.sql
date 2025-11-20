/*
  Warnings:

  - Added the required column `farm_id` to the `breedings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `lot_animals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `lot_animals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `treatments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `vaccinations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `weights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `weights` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "breedings" ADD COLUMN     "farm_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "lot_animals" ADD COLUMN     "farm_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "farm_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vaccinations" ADD COLUMN     "farm_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "weights" ADD COLUMN     "farm_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "breedings_farm_id_idx" ON "breedings"("farm_id");

-- CreateIndex
CREATE INDEX "lot_animals_farm_id_idx" ON "lot_animals"("farm_id");

-- CreateIndex
CREATE INDEX "treatments_farm_id_idx" ON "treatments"("farm_id");

-- CreateIndex
CREATE INDEX "vaccinations_farm_id_idx" ON "vaccinations"("farm_id");

-- CreateIndex
CREATE INDEX "weights_farm_id_idx" ON "weights"("farm_id");

-- AddForeignKey
ALTER TABLE "lot_animals" ADD CONSTRAINT "lot_animals_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weights" ADD CONSTRAINT "weights_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breedings" ADD CONSTRAINT "breedings_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
