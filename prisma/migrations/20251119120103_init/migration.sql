-- CreateTable
CREATE TABLE "species" (
    "id" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breeds" (
    "id" TEXT NOT NULL,
    "species_id" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "breeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "cheptel_number" TEXT,
    "group_id" TEXT,
    "group_name" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
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
    "species_id" TEXT,
    "breed_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'alive',
    "validated_at" TIMESTAMP(3),
    "photo_url" TEXT,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

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

-- AddForeignKey
ALTER TABLE "breeds" ADD CONSTRAINT "breeds_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_breed_id_fkey" FOREIGN KEY ("breed_id") REFERENCES "breeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
