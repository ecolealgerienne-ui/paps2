/**
 * Script de chargement des données de référence depuis les fichiers CSV
 * Utilise Prisma upsert : insert si n'existe pas, update sinon
 *
 * Usage: npx ts-node scripts/seed-reference-data.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Chemin vers les fichiers CSV
const CSV_DIR = path.join(__dirname, 'output_test', 'csv');

// Helper pour parser un fichier CSV
function parseCSV(filePath: string): Record<string, string>[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

// Mapping code_espece CSV -> species.id Prisma
function mapSpeciesCode(codeEspece: string): string {
  const mapping: Record<string, string> = {
    '5': 'bovine',
    '11': 'caprine',
    '51': 'ovine',
  };
  return mapping[codeEspece] || codeEspece.toLowerCase();
}

// ============================================================================
// 1. SPECIES (Espèces)
// ============================================================================
async function seedSpecies() {
  console.log('\n📦 Chargement des espèces...');
  const rows = parseCSV(path.join(CSV_DIR, '01_especes.csv'));

  let created = 0, updated = 0;

  for (const row of rows) {
    const id = mapSpeciesCode(row.code_espece);
    const data = {
      nameFr: row.nom,
      nameEn: row.nom, // Utiliser le nom français par défaut
      nameAr: row.nom,
      icon: id, // Utiliser l'ID comme icône
      scientificName: row.nom_scientifique || null,
    };

    const existing = await prisma.species.findUnique({ where: { id } });

    await prisma.species.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });

    existing ? updated++ : created++;
  }

  console.log(`   ✅ Espèces: ${created} créées, ${updated} mises à jour`);
}

// ============================================================================
// 2. AGE CATEGORIES (Catégories d'âge)
// ============================================================================
async function seedAgeCategories() {
  console.log('\n📦 Chargement des catégories d\'âge...');
  const rows = parseCSV(path.join(CSV_DIR, '02_categories_age.csv'));

  let created = 0, updated = 0;

  for (const row of rows) {
    const speciesId = mapSpeciesCode(row.code_espece);
    const code = row.code_categorie.toLowerCase();

    // Vérifier que l'espèce existe
    const species = await prisma.species.findUnique({ where: { id: speciesId } });
    if (!species) {
      console.log(`   ⚠️ Espèce ${speciesId} non trouvée, skip catégorie ${code}`);
      continue;
    }

    const data = {
      speciesId,
      nameFr: row.libelle,
      nameEn: row.libelle,
      nameAr: row.libelle,
      description: row.description || null,
      ageMinDays: parseInt(row.age_min_jours) || 0,
      ageMaxDays: row.age_max_jours ? parseInt(row.age_max_jours) : null,
      displayOrder: parseInt(row.ordre) || 0,
      isDefault: row.is_default === '1',
    };

    const existing = await prisma.ageCategory.findFirst({
      where: { speciesId, code },
    });

    if (existing) {
      await prisma.ageCategory.update({
        where: { id: existing.id },
        data,
      });
      updated++;
    } else {
      await prisma.ageCategory.create({
        data: { code, ...data },
      });
      created++;
    }
  }

  console.log(`   ✅ Catégories d'âge: ${created} créées, ${updated} mises à jour`);
}

// ============================================================================
// 3. PRODUCT CATEGORIES (Catégories de produits)
// ============================================================================
async function seedProductCategories() {
  console.log('\n📦 Chargement des catégories de produits...');
  const rows = parseCSV(path.join(CSV_DIR, '03_categories_produit.csv'));

  let created = 0, updated = 0;

  for (const row of rows) {
    const code = `cat_${row.code_categorie}`;
    const data = {
      nameFr: row.libelle,
      nameEn: row.libelle,
      nameAr: row.libelle,
      displayOrder: parseInt(row.code_categorie) || 0,
    };

    const existing = await prisma.productCategory.findUnique({ where: { code } });

    await prisma.productCategory.upsert({
      where: { code },
      update: data,
      create: { code, ...data },
    });

    existing ? updated++ : created++;
  }

  console.log(`   ✅ Catégories produits: ${created} créées, ${updated} mises à jour`);
}

// ============================================================================
// 4. ACTIVE SUBSTANCES (Substances actives)
// ============================================================================
async function seedActiveSubstances() {
  console.log('\n📦 Chargement des substances actives...');
  const rows = parseCSV(path.join(CSV_DIR, '04_substances_actives.csv'));

  let created = 0, updated = 0;

  for (const row of rows) {
    const code = `sub_${row.code_substance}`;
    const data = {
      name: row.libelle,
      nameFr: row.libelle,
      nameEn: row.libelle,
      nameAr: row.libelle,
    };

    const existing = await prisma.activeSubstance.findUnique({ where: { code } });

    await prisma.activeSubstance.upsert({
      where: { code },
      update: data,
      create: { code, ...data },
    });

    existing ? updated++ : created++;
  }

  console.log(`   ✅ Substances actives: ${created} créées, ${updated} mises à jour`);
}

// ============================================================================
// 5. ADMINISTRATION ROUTES (Voies d'administration)
// ============================================================================
async function seedAdministrationRoutes() {
  console.log('\n📦 Chargement des voies d\'administration...');
  const rows = parseCSV(path.join(CSV_DIR, '05_voies_administration.csv'));

  let created = 0, updated = 0;

  for (const row of rows) {
    // Normaliser le code (lowercase, underscores)
    const code = row.libelle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Retirer accents
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

    const data = {
      nameFr: row.libelle,
      nameEn: row.libelle,
      nameAr: row.libelle,
      displayOrder: parseInt(row.code_voie) || 0,
    };

    const existing = await prisma.administrationRoute.findUnique({ where: { code } });

    await prisma.administrationRoute.upsert({
      where: { code },
      update: data,
      create: { code, ...data },
    });

    existing ? updated++ : created++;
  }

  console.log(`   ✅ Voies d'administration: ${created} créées, ${updated} mises à jour`);
}

// ============================================================================
// 6. UNITS (Unités)
// ============================================================================
async function seedUnits() {
  console.log('\n📦 Chargement des unités...');
  const rows = parseCSV(path.join(CSV_DIR, '07_unites.csv'));

  let created = 0, updated = 0;

  for (const row of rows) {
    // Normaliser le code
    const code = row.libelle
      .toLowerCase()
      .replace(/[^a-z0-9%µ]+/g, '_')
      .replace(/^_|_$/g, '') || `unit_${row.code_unite}`;

    const data = {
      symbol: row.libelle,
      nameFr: row.libelle,
      nameEn: row.libelle,
      nameAr: row.libelle,
      unitType: 'other' as const,
    };

    try {
      const existing = await prisma.unit.findUnique({ where: { code } });

      await prisma.unit.upsert({
        where: { code },
        update: data,
        create: { code, ...data },
      });

      existing ? updated++ : created++;
    } catch (error) {
      // Skip duplicates
    }
  }

  console.log(`   ✅ Unités: ${created} créées, ${updated} mises à jour`);
}

// ============================================================================
// 7. BREEDS (Races)
// ============================================================================
async function seedBreeds() {
  console.log('\n📦 Chargement des races...');
  const rows = parseCSV(path.join(CSV_DIR, '08_races.csv'));

  let created = 0, updated = 0, skipped = 0;

  for (const row of rows) {
    const speciesId = mapSpeciesCode(row.code_espece);

    // Vérifier que l'espèce existe
    const species = await prisma.species.findUnique({ where: { id: speciesId } });
    if (!species) {
      skipped++;
      continue;
    }

    // Normaliser le code
    const code = row.nom_local
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

    if (!code) {
      skipped++;
      continue;
    }

    const data = {
      speciesId,
      nameFr: row.nom_local,
      nameEn: row.nom_anglais || row.nom_local,
      nameAr: row.nom_local,
      description: row.description || null,
    };

    try {
      const existing = await prisma.breed.findUnique({ where: { code } });

      await prisma.breed.upsert({
        where: { code },
        update: data,
        create: { code, ...data },
      });

      existing ? updated++ : created++;
    } catch (error) {
      skipped++;
    }
  }

  console.log(`   ✅ Races: ${created} créées, ${updated} mises à jour, ${skipped} ignorées`);
}

// ============================================================================
// 8. PRODUCTS (Médicaments)
// ============================================================================
// Cache pour stocker les mappings id_medicament -> productId
const productIdMap = new Map<string, string>();

async function seedProducts() {
  console.log('\n📦 Chargement des médicaments...');
  const rows = parseCSV(path.join(CSV_DIR, '09_medicaments_clinique.csv'));

  let created = 0, updated = 0, skipped = 0;

  for (const row of rows) {
    const idMedicament = row.id_medicament;
    if (!idMedicament || !row.nom_commercial) {
      skipped++;
      continue;
    }

    // Générer un code unique
    const code = `med_${idMedicament}`;

    // Mapper la catégorie
    const categoryCode = row.code_categorie === 'CHIMIQUE' ? 'cat_1' :
                         row.code_categorie === 'IMMUNOLOGIQUE' ? 'cat_2' : null;

    let categoryId: string | null = null;
    if (categoryCode) {
      const category = await prisma.productCategory.findUnique({ where: { code: categoryCode } });
      categoryId = category?.id || null;
    }

    const data = {
      scope: 'global' as const,
      farmId: null,
      nameFr: row.nom_commercial,
      nameEn: row.nom_commercial,
      commercialName: row.nom_commercial,
      atcVetCode: row.code_atcvet || null,
      form: row.forme_pharmaceutique || null,
      categoryId,
    };

    try {
      const existing = await prisma.product.findUnique({ where: { code } });

      const product = await prisma.product.upsert({
        where: { code },
        update: data,
        create: { code, ...data },
      });

      // Sauvegarder le mapping pour les tables liées
      productIdMap.set(idMedicament, product.id);

      existing ? updated++ : created++;
    } catch (error) {
      skipped++;
    }
  }

  console.log(`   ✅ Médicaments: ${created} créés, ${updated} mis à jour, ${skipped} ignorés`);
}

// ============================================================================
// 9. THERAPEUTIC INDICATIONS (Posologies)
// ============================================================================
// Cache pour les routes d'administration
const routeIdMap = new Map<string, string>();

async function seedTherapeuticIndications() {
  console.log('\n📦 Chargement des indications thérapeutiques...');

  // Pré-charger les routes d'administration
  const routes = await prisma.administrationRoute.findMany();
  routes.forEach(r => routeIdMap.set(r.displayOrder.toString(), r.id));

  const rows = parseCSV(path.join(CSV_DIR, '10_medicaments_especes_age_posologie.csv'));

  let created = 0, updated = 0, skipped = 0;

  for (const row of rows) {
    const productId = productIdMap.get(row.id_medicament);
    if (!productId) {
      skipped++;
      continue;
    }

    const speciesId = mapSpeciesCode(row.code_espece);
    const species = await prisma.species.findUnique({ where: { id: speciesId } });
    if (!species) {
      skipped++;
      continue;
    }

    // Trouver la route d'administration
    const routeId = routeIdMap.get(row.voie_administration);
    if (!routeId) {
      skipped++;
      continue;
    }

    // Trouver la catégorie d'âge
    let ageCategoryId: string | null = null;
    if (row.code_categorie_age) {
      const ageCategory = await prisma.ageCategory.findFirst({
        where: { speciesId, code: row.code_categorie_age.toLowerCase() },
      });
      ageCategoryId = ageCategory?.id || null;
    }

    const data = {
      productId,
      countryCode: 'FR',
      speciesId,
      ageCategoryId,
      routeId,
      doseMin: row.dose_min_mg_par_kg ? parseFloat(row.dose_min_mg_par_kg) : null,
      doseMax: row.dose_max_mg_par_kg ? parseFloat(row.dose_max_mg_par_kg) : null,
      doseOriginalText: row.dose_texte_original || null,
      protocolDurationDays: row.protocole_duree_jours ? parseInt(row.protocole_duree_jours) : null,
      withdrawalMeatDays: parseInt(row.temps_attente_viande_jours) || 0,
      withdrawalMilkDays: row.temps_attente_lait_jours ? parseInt(row.temps_attente_lait_jours) : null,
      isVerified: row.parsing_verified === '1',
      validationNotes: row.notes_validation || null,
    };

    try {
      // Chercher si existe déjà
      const existing = await prisma.therapeuticIndication.findFirst({
        where: {
          productId,
          countryCode: 'FR',
          speciesId,
          ageCategoryId,
          routeId,
        },
      });

      if (existing) {
        await prisma.therapeuticIndication.update({
          where: { id: existing.id },
          data,
        });
        updated++;
      } else {
        await prisma.therapeuticIndication.create({ data });
        created++;
      }
    } catch (error) {
      skipped++;
    }
  }

  console.log(`   ✅ Indications thérapeutiques: ${created} créées, ${updated} mises à jour, ${skipped} ignorées`);
}

// ============================================================================
// 10. PRODUCT PACKAGINGS (Conditionnements)
// ============================================================================
async function seedProductPackagings() {
  console.log('\n📦 Chargement des conditionnements...');

  // S'assurer qu'on a une unité par défaut
  let defaultUnitId: string;
  const defaultUnit = await prisma.unit.findFirst({ where: { code: 'ml' } });
  if (defaultUnit) {
    defaultUnitId = defaultUnit.id;
  } else {
    const newUnit = await prisma.unit.create({
      data: {
        code: 'ml',
        symbol: 'ml',
        nameFr: 'millilitre',
        nameEn: 'milliliter',
        nameAr: 'milliliter',
        unitType: 'volume',
      },
    });
    defaultUnitId = newUnit.id;
  }

  // S'assurer que le pays FR existe
  await prisma.country.upsert({
    where: { code: 'FR' },
    update: {},
    create: {
      code: 'FR',
      nameFr: 'France',
      nameEn: 'France',
      nameAr: 'فرنسا',
      region: 'Europe',
    },
  });

  const rows = parseCSV(path.join(CSV_DIR, '11_conditionnements_nationaux.csv'));

  let created = 0, updated = 0, skipped = 0;

  for (const row of rows) {
    const productId = productIdMap.get(row.id_medicament);
    if (!productId) {
      skipped++;
      continue;
    }

    const gtinEan = row.gtin_ean || null;
    const packagingLabel = row.description || row.nom_commercial_local || 'Conditionnement standard';

    // Extraire le volume du label si possible (ex: "Flacon de 100 mL")
    const volumeMatch = packagingLabel.match(/(\d+)\s*(ml|mL|ML)/i);
    const volume = volumeMatch ? parseFloat(volumeMatch[1]) : 100;

    const data = {
      productId,
      countryCode: 'FR',
      concentration: 1, // Valeur par défaut
      concentrationUnitId: defaultUnitId,
      volume,
      volumeUnitId: defaultUnitId,
      packagingLabel,
      gtinEan,
    };

    try {
      // Chercher si existe déjà (par productId + countryCode + gtinEan)
      const existing = await prisma.productPackaging.findFirst({
        where: {
          productId,
          countryCode: 'FR',
          gtinEan: gtinEan || undefined,
        },
      });

      if (existing) {
        await prisma.productPackaging.update({
          where: { id: existing.id },
          data,
        });
        updated++;
      } else {
        await prisma.productPackaging.create({ data });
        created++;
      }
    } catch (error) {
      skipped++;
    }
  }

  console.log(`   ✅ Conditionnements: ${created} créés, ${updated} mis à jour, ${skipped} ignorés`);
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     SEED REFERENCE DATA - Chargement des tables de référence   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  try {
    // Phase 1: Tables de base (pas de dépendances)
    console.log('\n🔷 Phase 1: Tables de base');
    await seedSpecies();
    await seedProductCategories();
    await seedActiveSubstances();
    await seedAdministrationRoutes();
    await seedUnits();

    // Phase 2: Tables avec dépendances vers Phase 1
    console.log('\n🔷 Phase 2: Tables dépendantes');
    await seedAgeCategories();   // Dépend de Species
    await seedBreeds();          // Dépend de Species

    // Phase 3: Produits (dépend de categories, substances)
    console.log('\n🔷 Phase 3: Médicaments');
    await seedProducts();

    // Phase 4: Tables liées aux produits
    console.log('\n🔷 Phase 4: Données liées aux médicaments');
    await seedTherapeuticIndications();  // Dépend de Products, Species, AgeCategories, Routes
    await seedProductPackagings();       // Dépend de Products

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     ✅ Chargement terminé avec succès!                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
