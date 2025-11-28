/**
 * Complete seed script for medical products data
 * Loads: Units, ProductCategories, ActiveSubstances, AgeCategories, Products, ProductPackagings, TherapeuticIndications
 *
 * Usage: npx ts-node prisma/seed-all-medical-data.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const DATA_DIR = path.join(__dirname, '../scripts/output_test/json');

// Helper to load JSON file
function loadJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filename}`);
    return [] as unknown as T;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Helper for upsert operations
async function upsertMany<T extends Record<string, any>>(
  tableName: string,
  data: T[],
  uniqueKey: keyof T,
  transform?: (item: T) => any,
) {
  let created = 0;
  let updated = 0;

  for (const item of data) {
    const transformed = transform ? transform(item) : item;
    const where = { [uniqueKey]: item[uniqueKey] };

    try {
      const existing = await (prisma as any)[tableName].findFirst({ where });

      if (existing) {
        await (prisma as any)[tableName].update({
          where: { id: existing.id },
          data: transformed,
        });
        updated++;
      } else {
        await (prisma as any)[tableName].create({ data: transformed });
        created++;
      }
    } catch (error: any) {
      console.error(`  ❌ Error for ${tableName} ${item[uniqueKey]}: ${error.message}`);
    }
  }

  console.log(`  ✅ ${tableName}: ${created} created, ${updated} updated`);
}

async function seedUnits() {
  console.log('\n📦 Seeding Units...');

  interface UnitData {
    code: string;
    symbol: string;
    nameFr: string;
    nameEn: string;
    nameAr: string;
    type: string;
    factor: number;
  }

  const units: UnitData[] = loadJson('units.json');

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { code: unit.code },
      update: {
        symbol: unit.symbol,
        nameFr: unit.nameFr,
        nameEn: unit.nameEn,
        nameAr: unit.nameAr,
        unitType: unit.type as any,
        conversionFactor: unit.factor,
      },
      create: {
        code: unit.code,
        symbol: unit.symbol,
        nameFr: unit.nameFr,
        nameEn: unit.nameEn,
        nameAr: unit.nameAr,
        unitType: unit.type as any,
        conversionFactor: unit.factor,
      },
    });
  }

  console.log(`  ✅ Units: ${units.length} processed`);
}

async function seedProductCategories() {
  console.log('\n📦 Seeding Product Categories...');

  interface CategoryData {
    code: string;
    nameFr: string;
    nameEn: string;
    nameAr: string;
  }

  const categories: CategoryData[] = loadJson('product_categories.json');

  for (const cat of categories) {
    await prisma.productCategory.upsert({
      where: { code: cat.code },
      update: {
        nameFr: cat.nameFr,
        nameEn: cat.nameEn,
        nameAr: cat.nameAr,
      },
      create: {
        code: cat.code,
        nameFr: cat.nameFr,
        nameEn: cat.nameEn,
        nameAr: cat.nameAr,
      },
    });
  }

  console.log(`  ✅ Product Categories: ${categories.length} processed`);
}

async function seedActiveSubstances() {
  console.log('\n📦 Seeding Active Substances...');

  interface SubstanceData {
    code: string;
    name: string;
    nameFr: string;
    nameEn: string;
    nameAr: string;
    atcCode?: string;
  }

  const substances: SubstanceData[] = loadJson('active_substances.json');

  for (const sub of substances) {
    await prisma.activeSubstance.upsert({
      where: { code: sub.code },
      update: {
        name: sub.name,
        nameFr: sub.nameFr,
        nameEn: sub.nameEn,
        nameAr: sub.nameAr,
        atcCode: sub.atcCode,
      },
      create: {
        code: sub.code,
        name: sub.name,
        nameFr: sub.nameFr,
        nameEn: sub.nameEn,
        nameAr: sub.nameAr,
        atcCode: sub.atcCode,
      },
    });
  }

  console.log(`  ✅ Active Substances: ${substances.length} processed`);
}

async function seedAdministrationRoutes() {
  console.log('\n📦 Seeding Administration Routes...');

  interface RouteData {
    code: string;
    numericCode: number;
    nameFr: string;
    nameEn: string;
    nameAr: string;
    displayOrder: number;
  }

  const routes: RouteData[] = loadJson('administration_routes.json');

  // Filter out invalid codes (> 100 are probably errors)
  const validRoutes = routes.filter(r => r.numericCode <= 100);

  for (const route of validRoutes) {
    await prisma.administrationRoute.upsert({
      where: { code: route.code },
      update: {
        nameFr: route.nameFr,
        nameEn: route.nameEn,
        nameAr: route.nameAr,
        displayOrder: route.displayOrder,
      },
      create: {
        code: route.code,
        nameFr: route.nameFr,
        nameEn: route.nameEn,
        nameAr: route.nameAr,
        displayOrder: route.displayOrder,
      },
    });
  }

  console.log(`  ✅ Administration Routes: ${validRoutes.length} processed (${routes.length - validRoutes.length} invalid codes skipped)`);
}

async function seedAgeCategories() {
  console.log('\n📦 Seeding Age Categories...');

  interface AgeCategoryData {
    code: string;
    code_espece: number;
    designation_categorie_age: string;
    age_min_jours: number;
    age_max_jours: number | null;
    ordre_affichage: number;
    est_defaut: boolean;
  }

  const categories: AgeCategoryData[] = loadJson('categories_age.json');

  // Map species codes to IDs
  const speciesMap: Record<number, string> = {
    5: 'bovine',
    11: 'caprine',
    51: 'ovine',
  };

  for (const cat of categories) {
    const speciesId = speciesMap[cat.code_espece];
    if (!speciesId) {
      console.warn(`  ⚠️  Unknown species code: ${cat.code_espece}`);
      continue;
    }

    // Check if species exists
    const species = await prisma.species.findUnique({ where: { id: speciesId } });
    if (!species) {
      console.warn(`  ⚠️  Species not found: ${speciesId}`);
      continue;
    }

    const existing = await prisma.ageCategory.findFirst({
      where: { speciesId, code: cat.code },
    });

    const data = {
      code: cat.code,
      speciesId,
      nameFr: cat.designation_categorie_age,
      nameEn: cat.designation_categorie_age,
      nameAr: cat.designation_categorie_age,
      ageMinDays: cat.age_min_jours,
      ageMaxDays: cat.age_max_jours,
      displayOrder: cat.ordre_affichage,
      isDefault: cat.est_defaut,
    };

    if (existing) {
      await prisma.ageCategory.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.ageCategory.create({ data });
    }
  }

  console.log(`  ✅ Age Categories: ${categories.length} processed`);
}

async function seedProducts() {
  console.log('\n📦 Seeding Products...');

  interface MedicamentData {
    id_medicament: number;
    nom_commercial: string;
    code_atc_vet?: string;
    type_produit?: string;
    forme_pharmaceutique?: string;
    laboratoire?: string;
    composition?: string;
  }

  const medicaments: MedicamentData[] = loadJson('medicaments_clinique.json');

  // Get default category
  const defaultCategory = await prisma.productCategory.findFirst({
    where: { code: 'antibiotics' },
  });

  let created = 0;
  let updated = 0;

  for (const med of medicaments) {
    const code = `MED_${med.id_medicament}`;

    // Determine product type from ATCvet code
    // Valid ProductType: antibiotic, anti_inflammatory, antiparasitic, vitamin, mineral, vaccine, anesthetic, hormone, antiseptic, analgesic, other
    let productType = 'other';
    if (med.code_atc_vet?.startsWith('QI')) {
      productType = 'vaccine';
    } else if (med.code_atc_vet?.startsWith('QJ')) {
      productType = 'antibiotic';
    } else if (med.code_atc_vet?.startsWith('QM')) {
      productType = 'anti_inflammatory';
    } else if (med.code_atc_vet?.startsWith('QP')) {
      productType = 'antiparasitic';
    } else if (med.code_atc_vet?.startsWith('QA')) {
      productType = 'vitamin'; // Often vitamins/supplements
    } else if (med.code_atc_vet?.startsWith('QN')) {
      productType = 'anesthetic';
    } else if (med.code_atc_vet?.startsWith('QG') || med.code_atc_vet?.startsWith('QH')) {
      productType = 'hormone';
    }

    const existing = await prisma.product.findUnique({ where: { code } });

    const data = {
      code,
      scope: 'global' as const,
      nameFr: med.nom_commercial,
      nameEn: med.nom_commercial,
      atcVetCode: med.code_atc_vet,
      type: productType as any,
      form: med.forme_pharmaceutique,
      manufacturer: med.laboratoire,
      description: med.composition,
      categoryId: defaultCategory?.id,
    };

    try {
      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data,
        });
        updated++;
      } else {
        await prisma.product.create({ data });
        created++;
      }
    } catch (error: any) {
      console.error(`  ❌ Error for product ${med.id_medicament}: ${error.message}`);
    }
  }

  console.log(`  ✅ Products: ${created} created, ${updated} updated`);
}

async function seedProductPackagings() {
  console.log('\n📦 Seeding Product Packagings...');

  interface PackagingData {
    package_id: string;
    id_medicament: number;
    code_pays: string;
    gtin_ean?: string;
    nom_commercial_local: string;
    description?: string;
  }

  const packagings: PackagingData[] = loadJson('conditionnements_nationaux.json');

  // Get concentration unit
  const mgMlUnit = await prisma.unit.findUnique({ where: { code: 'mg_ml' } });
  const mlUnit = await prisma.unit.findUnique({ where: { code: 'ml' } });

  if (!mgMlUnit || !mlUnit) {
    console.error('  ❌ Required units not found. Run seedUnits first.');
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const pkg of packagings) {
    // Find corresponding product
    const productCode = `MED_${pkg.id_medicament}`;
    const product = await prisma.product.findUnique({ where: { code: productCode } });

    if (!product) {
      skipped++;
      continue;
    }

    // Check if country exists
    const country = await prisma.country.findUnique({ where: { code: pkg.code_pays } });
    if (!country) {
      skipped++;
      continue;
    }

    // Extract volume from description (e.g., "Flacon 100ml" -> 100)
    let volume: number | null = null;
    const volumeMatch = pkg.nom_commercial_local?.match(/(\d+)\s*ml/i);
    if (volumeMatch) {
      volume = parseInt(volumeMatch[1]);
    }

    try {
      await prisma.productPackaging.create({
        data: {
          productId: product.id,
          countryCode: pkg.code_pays,
          concentration: 100, // Default - should be parsed from composition
          concentrationUnitId: mgMlUnit.id,
          volume,
          volumeUnitId: volume ? mlUnit.id : null,
          packagingLabel: pkg.nom_commercial_local || pkg.description || 'Standard',
          gtinEan: pkg.gtin_ean,
        },
      });
      created++;
    } catch (error: any) {
      // Skip duplicates
      if (!error.message.includes('Unique constraint')) {
        console.error(`  ❌ Error for packaging: ${error.message}`);
      }
    }
  }

  console.log(`  ✅ Product Packagings: ${created} created, ${skipped} skipped (missing product/country)`);
}

async function seedTherapeuticIndications() {
  console.log('\n📦 Seeding Therapeutic Indications...');

  interface PosologyData {
    id_medicament: number;
    code_espece: number;
    code_categorie_age: string;
    voie_administration: number;
    dose_min_mg_par_kg?: number;
    dose_max_mg_par_kg?: number;
    temps_attente_lait_jours?: number;
    temps_attente_viande_jours?: number;
  }

  const posologies: PosologyData[] = loadJson('medicaments_especes_age_posologie.json');

  // Map species numeric codes to species codes
  const speciesCodeMap: Record<number, string> = {
    5: 'bovine',
    11: 'caprine',
    51: 'ovine',
  };

  // Build species ID map (Species.id IS the code: "bovine", "ovine", "caprine")
  const speciesMap: Record<number, string> = {};
  for (const [numCode, code] of Object.entries(speciesCodeMap)) {
    const species = await prisma.species.findUnique({ where: { id: code } });
    if (species) {
      speciesMap[parseInt(numCode)] = species.id;
    }
  }

  // Map route codes to route IDs (will be populated from DB)
  const routeCodeMap: Record<number, string> = {};
  const routes = await prisma.administrationRoute.findMany();

  // Build route code mapping from numericCode stored in code or by position
  const numericCodeToRoute: Record<number, string> = {
    2: 'im',
    4: 'sc',
    6: 'intramammary',
    8: 'pour_on',
    9: 'im_sc',
    11: 'intranasal',
    15: 'intraperitoneal',
    16: 'epidural',
    17: 'intraarticular',
    19: 'feed',
  };

  for (const route of routes) {
    // Find by code
    for (const [numCode, code] of Object.entries(numericCodeToRoute)) {
      if (route.code === code) {
        routeCodeMap[parseInt(numCode)] = route.id;
      }
    }
  }

  // Get dose unit
  const doseUnit = await prisma.unit.findUnique({ where: { code: 'mg_kg' } });

  let created = 0;
  let skipped = 0;

  for (const pos of posologies) {
    const speciesId = speciesMap[pos.code_espece];
    if (!speciesId) {
      skipped++;
      continue;
    }

    // Find product
    const productCode = `MED_${pos.id_medicament}`;
    const product = await prisma.product.findUnique({ where: { code: productCode } });
    if (!product) {
      skipped++;
      continue;
    }

    // Find route
    const routeId = routeCodeMap[pos.voie_administration];
    if (!routeId) {
      skipped++;
      continue;
    }

    // Find age category
    let ageCategoryId: string | null = null;
    if (pos.code_categorie_age && pos.code_categorie_age !== 'TOUS') {
      const ageCategory = await prisma.ageCategory.findFirst({
        where: { speciesId, code: pos.code_categorie_age },
      });
      ageCategoryId = ageCategory?.id || null;
    }

    try {
      await prisma.therapeuticIndication.create({
        data: {
          productId: product.id,
          speciesId,
          routeId,
          ageCategoryId,
          countryCode: null, // Universal
          doseMin: pos.dose_min_mg_par_kg,
          doseMax: pos.dose_max_mg_par_kg,
          doseUnitId: doseUnit?.id,
          withdrawalMeatDays: pos.temps_attente_viande_jours ?? 0,
          withdrawalMilkDays: pos.temps_attente_lait_jours ?? 0,
        },
      });
      created++;
    } catch (error: any) {
      // Skip duplicates
      if (!error.message.includes('Unique constraint')) {
        console.error(`  ❌ Error: ${error.message}`);
      }
      skipped++;
    }
  }

  console.log(`  ✅ Therapeutic Indications: ${created} created, ${skipped} skipped`);
}

async function main() {
  console.log('🚀 Starting medical products data seed...\n');
  console.log(`📂 Data directory: ${DATA_DIR}`);

  try {
    // Seed in dependency order
    await seedUnits();
    await seedProductCategories();
    await seedActiveSubstances();
    await seedAdministrationRoutes();
    await seedAgeCategories();
    await seedProducts();
    await seedProductPackagings();
    await seedTherapeuticIndications();

    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
