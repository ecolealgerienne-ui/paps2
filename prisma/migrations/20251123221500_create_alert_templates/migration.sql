-- CreateEnum
CREATE TYPE "AlertCategory" AS ENUM ('health', 'reproduction', 'feeding', 'vaccination', 'treatment', 'administrative', 'weather', 'other');

-- CreateEnum
CREATE TYPE "AlertPriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateTable
CREATE TABLE "alert_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(100) NOT NULL,
    "name_fr" VARCHAR(200) NOT NULL,
    "name_en" VARCHAR(200) NOT NULL,
    "name_ar" VARCHAR(200) NOT NULL,
    "description_fr" TEXT,
    "description_en" TEXT,
    "description_ar" TEXT,
    "category" "AlertCategory" NOT NULL,
    "priority" "AlertPriority" NOT NULL DEFAULT 'medium',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_templates_pkey" PRIMARY KEY ("id")
);

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

-- CreateTrigger
CREATE TRIGGER update_alert_templates_updated_at
    BEFORE UPDATE ON alert_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data
INSERT INTO alert_templates (code, name_fr, name_en, name_ar, category, priority) VALUES
  ('vaccination_due', 'Vaccination à venir', 'Vaccination Due', 'التطعيم المستحق', 'vaccination', 'high'),
  ('health_check_overdue', 'Visite sanitaire en retard', 'Health Check Overdue', 'الفحص الصحي متأخر', 'health', 'medium'),
  ('low_stock_feed', 'Stock aliment faible', 'Low Feed Stock', 'مخزون العلف منخفض', 'feeding', 'medium'),
  ('birth_expected', 'Naissance prévue', 'Birth Expected', 'الولادة المتوقعة', 'reproduction', 'low'),
  ('treatment_due', 'Traitement à administrer', 'Treatment Due', 'العلاج المستحق', 'treatment', 'high')
ON CONFLICT (code) DO NOTHING;
