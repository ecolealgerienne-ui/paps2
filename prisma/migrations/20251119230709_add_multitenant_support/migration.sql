/*
  Warnings:

  - Added the required column `farm_id` to the `medical_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `vaccines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `veterinarians` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "medical_products" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "farm_id" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "vaccines" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "farm_id" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "veterinarians" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "farm_id" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "medical_products_farm_id_idx" ON "medical_products"("farm_id");

-- CreateIndex
CREATE INDEX "medical_products_deleted_at_idx" ON "medical_products"("deleted_at");

-- CreateIndex
CREATE INDEX "vaccines_farm_id_idx" ON "vaccines"("farm_id");

-- CreateIndex
CREATE INDEX "vaccines_deleted_at_idx" ON "vaccines"("deleted_at");

-- CreateIndex
CREATE INDEX "veterinarians_farm_id_idx" ON "veterinarians"("farm_id");

-- CreateIndex
CREATE INDEX "veterinarians_deleted_at_idx" ON "veterinarians"("deleted_at");

-- AddForeignKey
ALTER TABLE "veterinarians" ADD CONSTRAINT "veterinarians_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_products" ADD CONSTRAINT "medical_products_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccines" ADD CONSTRAINT "vaccines_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
