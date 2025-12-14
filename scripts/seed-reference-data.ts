/**
 * Script de chargement des données de référence depuis les fichiers CSV
 * Adapté à la nouvelle structure simplifiée MVP (Phase 0)
 *
 * Tables chargées:
 * - Species (espèces)
 * - AgeCategory (catégories d'âge)
 * - Breed (races)
 * - Unit (unités)
 * - Product (médicaments) avec données AMM enrichies:
 *   - Nom, fabricant, forme thérapeutique
 *   - Espèces cibles, voie d'administration
 *   - Délais d'attente (viande/lait)
 *   - Ordonnance obligatoire
 *   - Lien RCP ANMV
 *
 * Source des données produits: products-amm.csv (généré depuis XML ANMV)
 * Fallback: 09_medicaments_clinique.csv (ancien format)
 *
 * Usage: npx ts-node scripts/seed-reference-data.ts
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Chemin vers les fichiers CSV
const CSV_DIR = path.join(__dirname, 'output_test', 'csv');

// Helper pour parser un fichier CSV (supporte les guillemets)
function parseCSV(filePath: string): Record<string, string>[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter((line: string) => line.trim());

  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header: string, index: number) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

// Parse une ligne CSV en gérant les guillemets
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
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

// Mapping code_categorie -> categoryCode simplifié
function mapCategoryCode(codeCategorie: string): string {
  const mapping: Record<string, string> = {
    'CHIMIQUE': 'chemical',
    'IMMUNOLOGIQUE': 'immunological',
  };
  return mapping[codeCategorie] || codeCategorie.toLowerCase();
}

// ============================================================================
// 1. SPECIES (Espèces) - ESSENTIEL
// ============================================================================
async function seedSpecies() {
  console.log('\n📦 Chargement des espèces...');
  const rows = parseCSV(path.join(CSV_DIR, '01_especes.csv'));

  let created = 0, updated = 0;

  for (const row of rows) {
    const id = mapSpeciesCode(row.code_espece);
    const data = {
      nameFr: row.nom,
      nameEn: row.nom,
      nameAr: row.nom,
      icon: id,
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
// 2. AGE CATEGORIES (Catégories d'âge) - ESSENTIEL
// ============================================================================
async function seedAgeCategories() {
  console.log('\n📦 Chargement des catégories d\'âge...');
  const rows = parseCSV(path.join(CSV_DIR, '02_categories_age.csv'));

  let created = 0, updated = 0;

  for (const row of rows) {
    const speciesId = mapSpeciesCode(row.code_espece);
    const code = row.code_categorie.toLowerCase();

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
// 3. UNITS (Unités) - ESSENTIEL
// ============================================================================
async function seedUnits() {
  console.log('\n📦 Chargement des unités...');
  const rows = parseCSV(path.join(CSV_DIR, '07_unites.csv'));

  let created = 0, updated = 0;

  for (const row of rows) {
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
    } catch {
      // Skip duplicates
    }
  }

  console.log(`   ✅ Unités: ${created} créées, ${updated} mises à jour`);
}

// ============================================================================
// 4. BREEDS (Races) - ESSENTIEL
// ============================================================================
async function seedBreeds() {
  console.log('\n📦 Chargement des races...');
  const rows = parseCSV(path.join(CSV_DIR, '08_races.csv'));

  let created = 0, updated = 0, skipped = 0;

  for (const row of rows) {
    const speciesId = mapSpeciesCode(row.code_espece);

    const species = await prisma.species.findUnique({ where: { id: speciesId } });
    if (!species) {
      skipped++;
      continue;
    }

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
    } catch {
      skipped++;
    }
  }

  console.log(`   ✅ Races: ${created} créées, ${updated} mises à jour, ${skipped} ignorées`);
}

// ============================================================================
// 5. PRODUCTS (Médicaments) - ESSENTIEL avec champs simplifiés AMM
// ============================================================================
async function seedProducts() {
  console.log('\n📦 Chargement des médicaments (données AMM enrichies)...');

  // Utiliser le nouveau fichier AMM enrichi
  const csvPath = path.join(CSV_DIR, 'products-amm.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('   ⚠️ Fichier products-amm.csv non trouvé, utilisation de l\'ancien format');
    return seedProductsLegacy();
  }

  const rows = parseCSV(csvPath);
  let created = 0, updated = 0, skipped = 0;

  for (const row of rows) {
    const code = row.code;
    if (!code || !row.name) {
      skipped++;
      continue;
    }

    // Parser les espèces cibles en tableau
    const targetSpecies = row.targetSpecies
      ? row.targetSpecies.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    // Parser les délais d'attente
    const withdrawalMeatDays = row.withdrawalMeatDays ? parseInt(row.withdrawalMeatDays) : null;
    const withdrawalMilkHours = row.withdrawalMilkHours ? parseInt(row.withdrawalMilkHours) : null;

    // Parser prescription required
    const prescriptionRequired = row.prescriptionRequired === 'true';

    const data = {
      scope: 'global' as const,
      farmId: null,
      nameFr: row.name,
      nameEn: row.name,
      commercialName: row.name,
      atcVetCode: row.atcVetCode || null,
      // Champs simplifiés enrichis (AMM)
      therapeuticForm: row.therapeuticForm || null,
      form: row.therapeuticForm || null, // Legacy field
      composition: row.composition || null,
      manufacturer: row.manufacturer || null,
      administrationRoute: row.administrationRoute || null,
      targetSpecies,
      withdrawalMeatDays: isNaN(withdrawalMeatDays as number) ? null : withdrawalMeatDays,
      withdrawalMilkHours: isNaN(withdrawalMilkHours as number) ? null : withdrawalMilkHours,
      prescriptionRequired,
      // Métadonnées AMM
      description: row.indications || null,
      notes: row.rcpLink ? `RCP: ${row.rcpLink}` : null,
    };

    try {
      const existing = await prisma.product.findUnique({ where: { code } });

      await prisma.product.upsert({
        where: { code },
        update: data,
        create: { code, ...data },
      });

      existing ? updated++ : created++;
    } catch (error) {
      skipped++;
    }
  }

  console.log(`   ✅ Médicaments AMM: ${created} créés, ${updated} mis à jour, ${skipped} ignorés`);
}

// Ancien format de chargement (fallback)
async function seedProductsLegacy() {
  console.log('\n📦 Chargement des médicaments (ancien format)...');
  const rows = parseCSV(path.join(CSV_DIR, '09_medicaments_clinique.csv'));

  let created = 0, updated = 0, skipped = 0;

  for (const row of rows) {
    const idMedicament = row.id_medicament;
    if (!idMedicament || !row.nom_commercial) {
      skipped++;
      continue;
    }

    const code = `med_${idMedicament}`;

    // Champs simplifiés (Phase 0)
    const categoryCode = mapCategoryCode(row.code_categorie);
    const composition = row.substance_active || null;
    const therapeuticForm = row.forme_pharmaceutique || null;

    const data = {
      scope: 'global' as const,
      farmId: null,
      nameFr: row.nom_commercial,
      nameEn: row.nom_commercial,
      commercialName: row.nom_commercial,
      atcVetCode: row.code_atcvet || null,
      // Champs simplifiés (nouvelle structure)
      categoryCode,
      composition,
      therapeuticForm,
      form: therapeuticForm, // Legacy field
    };

    try {
      const existing = await prisma.product.findUnique({ where: { code } });

      await prisma.product.upsert({
        where: { code },
        update: data,
        create: { code, ...data },
      });

      existing ? updated++ : created++;
    } catch {
      skipped++;
    }
  }

  console.log(`   ✅ Médicaments (legacy): ${created} créés, ${updated} mis à jour, ${skipped} ignorés`);
}

// ============================================================================
// 6. COUNTRY (Pays) - Pour référence
// ============================================================================
async function seedCountry() {
  console.log('\n📦 Création du pays France...');

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

  console.log('   ✅ Pays France créé');
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  SEED REFERENCE DATA - MVP (Structure simplifiée)              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  try {
    // Phase 1: Tables essentielles (pas de dépendances)
    console.log('\n🔷 Phase 1: Tables essentielles');
    await seedSpecies();
    await seedUnits();
    await seedCountry();

    // Phase 2: Tables avec dépendances vers Phase 1
    console.log('\n🔷 Phase 2: Tables dépendantes (espèces)');
    await seedAgeCategories();
    await seedBreeds();

    // Phase 3: Médicaments avec champs simplifiés (données dénormalisées)
    console.log('\n🔷 Phase 3: Médicaments (données AMM dénormalisées)');
    await seedProducts();

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     ✅ Chargement terminé avec succès!                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');

    console.log('\n📋 Résumé des tables chargées:');
    console.log('   - Species (espèces) ✓');
    console.log('   - AgeCategory (catégories d\'âge) ✓');
    console.log('   - Unit (unités) ✓');
    console.log('   - Breed (races) ✓');
    console.log('   - Country (pays) ✓');
    console.log('   - Product (médicaments AMM enrichis) ✓');
    console.log('     • Nom, fabricant, forme thérapeutique');
    console.log('     • Espèces cibles, voie d\'administration');
    console.log('     • Délais d\'attente viande/lait');
    console.log('     • Ordonnance obligatoire, lien RCP');
    console.log('\n💡 Source: products-amm.csv (3191 médicaments ANMV France)');

  } catch (error) {
    console.error('\n❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
