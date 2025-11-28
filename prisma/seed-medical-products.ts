import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed data for medical products reference tables
 * Run with: npx ts-node prisma/seed-medical-products.ts
 */
async function main() {
  console.log('🌱 Seeding medical products reference data...');

  // ==========================================================================
  // UNITS
  // ==========================================================================
  console.log('  📐 Creating units...');

  const units = [
    // Mass units
    { code: 'mg', symbol: 'mg', nameFr: 'Milligramme', nameEn: 'Milligram', nameAr: 'ملليغرام', unitType: 'mass', baseUnitCode: 'g', conversionFactor: 0.001, displayOrder: 1 },
    { code: 'g', symbol: 'g', nameFr: 'Gramme', nameEn: 'Gram', nameAr: 'غرام', unitType: 'mass', baseUnitCode: null, conversionFactor: 1, displayOrder: 2 },
    { code: 'kg', symbol: 'kg', nameFr: 'Kilogramme', nameEn: 'Kilogram', nameAr: 'كيلوغرام', unitType: 'mass', baseUnitCode: 'g', conversionFactor: 1000, displayOrder: 3 },

    // Volume units
    { code: 'ml', symbol: 'ml', nameFr: 'Millilitre', nameEn: 'Milliliter', nameAr: 'ملليلتر', unitType: 'volume', baseUnitCode: 'L', conversionFactor: 0.001, displayOrder: 1 },
    { code: 'L', symbol: 'L', nameFr: 'Litre', nameEn: 'Liter', nameAr: 'لتر', unitType: 'volume', baseUnitCode: null, conversionFactor: 1, displayOrder: 2 },

    // Concentration units
    { code: 'mg_per_ml', symbol: 'mg/ml', nameFr: 'Milligramme par millilitre', nameEn: 'Milligram per milliliter', nameAr: 'ملغ/مل', unitType: 'concentration', displayOrder: 1 },
    { code: 'g_per_L', symbol: 'g/L', nameFr: 'Gramme par litre', nameEn: 'Gram per liter', nameAr: 'غ/ل', unitType: 'concentration', displayOrder: 2 },
    { code: 'UI_per_ml', symbol: 'UI/ml', nameFr: 'Unité internationale par millilitre', nameEn: 'International unit per milliliter', nameAr: 'و.د/مل', unitType: 'concentration', displayOrder: 3 },
    { code: 'mg_per_kg', symbol: 'mg/kg', nameFr: 'Milligramme par kilogramme', nameEn: 'Milligram per kilogram', nameAr: 'ملغ/كغ', unitType: 'concentration', displayOrder: 4 },

    // Count units
    { code: 'dose', symbol: 'dose', nameFr: 'Dose', nameEn: 'Dose', nameAr: 'جرعة', unitType: 'count', displayOrder: 1 },
    { code: 'tablet', symbol: 'cp', nameFr: 'Comprimé', nameEn: 'Tablet', nameAr: 'قرص', unitType: 'count', displayOrder: 2 },
    { code: 'capsule', symbol: 'gél', nameFr: 'Gélule', nameEn: 'Capsule', nameAr: 'كبسولة', unitType: 'count', displayOrder: 3 },
    { code: 'UI', symbol: 'UI', nameFr: 'Unité internationale', nameEn: 'International unit', nameAr: 'وحدة دولية', unitType: 'count', displayOrder: 4 },

    // Percentage
    { code: 'percent', symbol: '%', nameFr: 'Pourcentage', nameEn: 'Percentage', nameAr: 'نسبة مئوية', unitType: 'percentage', displayOrder: 1 },
  ];

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { code: unit.code },
      update: { ...unit, unitType: unit.unitType as any },
      create: unit as any,
    });
  }
  console.log(`    ✅ ${units.length} units created/updated`);

  // ==========================================================================
  // PRODUCT CATEGORIES
  // ==========================================================================
  console.log('  📦 Creating product categories...');

  const categories = [
    { code: 'antibiotics', nameFr: 'Antibiotiques', nameEn: 'Antibiotics', nameAr: 'المضادات الحيوية', displayOrder: 1 },
    { code: 'antiparasitics', nameFr: 'Antiparasitaires', nameEn: 'Antiparasitics', nameAr: 'مضادات الطفيليات', displayOrder: 2 },
    { code: 'anti_inflammatories', nameFr: 'Anti-inflammatoires', nameEn: 'Anti-inflammatories', nameAr: 'مضادات الالتهاب', displayOrder: 3 },
    { code: 'vaccines', nameFr: 'Vaccins', nameEn: 'Vaccines', nameAr: 'اللقاحات', displayOrder: 4 },
    { code: 'vitamins', nameFr: 'Vitamines', nameEn: 'Vitamins', nameAr: 'الفيتامينات', displayOrder: 5 },
    { code: 'minerals', nameFr: 'Minéraux', nameEn: 'Minerals', nameAr: 'المعادن', displayOrder: 6 },
    { code: 'hormones', nameFr: 'Hormones', nameEn: 'Hormones', nameAr: 'الهرمونات', displayOrder: 7 },
    { code: 'anesthetics', nameFr: 'Anesthésiques', nameEn: 'Anesthetics', nameAr: 'التخدير', displayOrder: 8 },
    { code: 'antiseptics', nameFr: 'Antiseptiques', nameEn: 'Antiseptics', nameAr: 'المطهرات', displayOrder: 9 },
    { code: 'analgesics', nameFr: 'Analgésiques', nameEn: 'Analgesics', nameAr: 'المسكنات', displayOrder: 10 },
    { code: 'other', nameFr: 'Autres', nameEn: 'Other', nameAr: 'أخرى', displayOrder: 99 },
  ];

  for (const category of categories) {
    await prisma.productCategory.upsert({
      where: { code: category.code },
      update: category,
      create: category,
    });
  }
  console.log(`    ✅ ${categories.length} categories created/updated`);

  // ==========================================================================
  // ACTIVE SUBSTANCES (common veterinary)
  // ==========================================================================
  console.log('  💊 Creating active substances...');

  const substances = [
    // Antibiotics
    { code: 'amoxicillin', name: 'Amoxicillin', nameFr: 'Amoxicilline', nameEn: 'Amoxicillin', nameAr: 'أموكسيسيلين', atcCode: 'QJ01CA04' },
    { code: 'oxytetracycline', name: 'Oxytetracycline', nameFr: 'Oxytétracycline', nameEn: 'Oxytetracycline', nameAr: 'أوكسي تتراسيكلين', atcCode: 'QJ01AA06' },
    { code: 'penicillin_g', name: 'Penicillin G', nameFr: 'Pénicilline G', nameEn: 'Penicillin G', nameAr: 'بنسلين ج', atcCode: 'QJ01CE01' },
    { code: 'enrofloxacin', name: 'Enrofloxacin', nameFr: 'Enrofloxacine', nameEn: 'Enrofloxacin', nameAr: 'إنروفلوكساسين', atcCode: 'QJ01MA90' },
    { code: 'tylosin', name: 'Tylosin', nameFr: 'Tylosine', nameEn: 'Tylosin', nameAr: 'تيلوسين', atcCode: 'QJ01FA90' },

    // Anti-inflammatories
    { code: 'meloxicam', name: 'Meloxicam', nameFr: 'Méloxicam', nameEn: 'Meloxicam', nameAr: 'ميلوكسيكام', atcCode: 'QM01AC06' },
    { code: 'flunixin', name: 'Flunixin', nameFr: 'Flunixine', nameEn: 'Flunixin', nameAr: 'فلونيكسين', atcCode: 'QM01AG90' },
    { code: 'ketoprofen', name: 'Ketoprofen', nameFr: 'Kétoprofène', nameEn: 'Ketoprofen', nameAr: 'كيتوبروفين', atcCode: 'QM01AE03' },

    // Antiparasitics
    { code: 'ivermectin', name: 'Ivermectin', nameFr: 'Ivermectine', nameEn: 'Ivermectin', nameAr: 'إيفرمكتين', atcCode: 'QP54AA01' },
    { code: 'albendazole', name: 'Albendazole', nameFr: 'Albendazole', nameEn: 'Albendazole', nameAr: 'ألبيندازول', atcCode: 'QP52AC11' },
    { code: 'fenbendazole', name: 'Fenbendazole', nameFr: 'Fenbendazole', nameEn: 'Fenbendazole', nameAr: 'فينبندازول', atcCode: 'QP52AC13' },

    // Vitamins
    { code: 'vitamin_ad3e', name: 'Vitamin AD3E', nameFr: 'Vitamine AD3E', nameEn: 'Vitamin AD3E', nameAr: 'فيتامين AD3E', atcCode: 'QA11' },
    { code: 'vitamin_b12', name: 'Vitamin B12', nameFr: 'Vitamine B12', nameEn: 'Vitamin B12', nameAr: 'فيتامين ب12', atcCode: 'QB03BA01' },
  ];

  for (const substance of substances) {
    await prisma.activeSubstance.upsert({
      where: { code: substance.code },
      update: substance,
      create: substance,
    });
  }
  console.log(`    ✅ ${substances.length} substances created/updated`);

  // ==========================================================================
  // AGE CATEGORIES
  // ==========================================================================
  console.log('  🐄 Creating age categories...');

  // Get species
  const bovine = await prisma.species.findFirst({ where: { id: 'bovine' } });
  const ovine = await prisma.species.findFirst({ where: { id: 'ovine' } });
  const caprine = await prisma.species.findFirst({ where: { id: 'caprine' } });

  const ageCategories: Array<{
    code: string;
    speciesId: string;
    nameFr: string;
    nameEn: string;
    nameAr: string;
    ageMinDays: number;
    ageMaxDays: number | null;
    displayOrder: number;
    isDefault?: boolean;
  }> = [];

  if (bovine) {
    ageCategories.push(
      { code: 'calf', speciesId: 'bovine', nameFr: 'Veau', nameEn: 'Calf', nameAr: 'عجل', ageMinDays: 0, ageMaxDays: 180, displayOrder: 1 },
      { code: 'young_cattle', speciesId: 'bovine', nameFr: 'Bovin jeune', nameEn: 'Young cattle', nameAr: 'ماشية صغيرة', ageMinDays: 181, ageMaxDays: 730, displayOrder: 2 },
      { code: 'adult_cattle', speciesId: 'bovine', nameFr: 'Bovin adulte', nameEn: 'Adult cattle', nameAr: 'ماشية بالغة', ageMinDays: 731, ageMaxDays: null, displayOrder: 3, isDefault: true },
    );
  }

  if (ovine) {
    ageCategories.push(
      { code: 'lamb', speciesId: 'ovine', nameFr: 'Agneau', nameEn: 'Lamb', nameAr: 'حمل', ageMinDays: 0, ageMaxDays: 120, displayOrder: 1 },
      { code: 'young_sheep', speciesId: 'ovine', nameFr: 'Ovin jeune', nameEn: 'Young sheep', nameAr: 'غنم صغير', ageMinDays: 121, ageMaxDays: 365, displayOrder: 2 },
      { code: 'adult_sheep', speciesId: 'ovine', nameFr: 'Ovin adulte', nameEn: 'Adult sheep', nameAr: 'غنم بالغ', ageMinDays: 366, ageMaxDays: null, displayOrder: 3, isDefault: true },
    );
  }

  if (caprine) {
    ageCategories.push(
      { code: 'kid', speciesId: 'caprine', nameFr: 'Chevreau', nameEn: 'Kid', nameAr: 'جدي', ageMinDays: 0, ageMaxDays: 120, displayOrder: 1 },
      { code: 'young_goat', speciesId: 'caprine', nameFr: 'Caprin jeune', nameEn: 'Young goat', nameAr: 'ماعز صغير', ageMinDays: 121, ageMaxDays: 365, displayOrder: 2 },
      { code: 'adult_goat', speciesId: 'caprine', nameFr: 'Caprin adulte', nameEn: 'Adult goat', nameAr: 'ماعز بالغ', ageMinDays: 366, ageMaxDays: null, displayOrder: 3, isDefault: true },
    );
  }

  for (const category of ageCategories) {
    const existing = await prisma.ageCategory.findFirst({
      where: { speciesId: category.speciesId, code: category.code },
    });

    if (existing) {
      await prisma.ageCategory.update({
        where: { id: existing.id },
        data: category,
      });
    } else {
      await prisma.ageCategory.create({
        data: category as any,
      });
    }
  }
  console.log(`    ✅ ${ageCategories.length} age categories created/updated`);

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
