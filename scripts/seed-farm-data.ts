/**
 * Seed Farm Data - Database Loader
 *
 * Loads CSV files from scripts/output_test/farm_data/ into the database
 * using Prisma.
 *
 * IMPORTANT: This script DELETES existing farm data and replaces it with
 * new data on each execution (truncate + insert approach).
 *
 * Prerequisites:
 * 1. Run seed-reference-data.ts first for reference tables
 * 2. Run generate-farm-data.ts to create CSV files
 *
 * Usage: npx ts-node scripts/seed-farm-data.ts
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const INPUT_DIR = path.join(__dirname, 'output_test', 'farm_data');

// ============================================================================
// CSV Parser
// ============================================================================
// Fields that should remain as strings even if they look like numbers
const STRING_FIELDS = new Set([
  'commune', 'postalCode', 'department', 'countryCode', 'country',
  'phone', 'mobile', 'licenseNumber', 'documentNumber', 'gtinEan',
  'currentEid', 'officialNumber', 'visualId', 'eidHistory',
]);

function parseCSV(content: string): Record<string, any>[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const data: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, any> = {};

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      let value = values[j] || '';

      // Type conversion
      if (value === '' || value === 'null' || value === 'undefined') {
        row[header] = null;
      } else if (STRING_FIELDS.has(header)) {
        // Keep as string for specific fields
        row[header] = value;
      } else if (value === 'true') {
        row[header] = true;
      } else if (value === 'false') {
        row[header] = false;
      } else if (/^\d+$/.test(value)) {
        row[header] = parseInt(value, 10);
      } else if (/^\d+\.\d+$/.test(value)) {
        row[header] = parseFloat(value);
      } else if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
        row[header] = new Date(value);
      } else {
        row[header] = value;
      }
    }

    data.push(row);
  }

  return data;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function loadCSVFile(fileName: string): Record<string, any>[] {
  const filePath = path.join(INPUT_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`  [SKIP] File not found: ${fileName}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseCSV(content);
}

// ============================================================================
// Delete Functions (in correct order for FK constraints)
// ============================================================================
async function deleteAllFarmData() {
  console.log('');
  console.log('Deleting existing farm data...');

  // Delete in reverse order of dependencies
  const deletions = [
    // Transactional data first
    { name: 'Document', fn: () => prisma.document.deleteMany() },
    { name: 'Breeding', fn: () => prisma.breeding.deleteMany() },
    { name: 'Weight', fn: () => prisma.weight.deleteMany() },
    { name: 'MovementAnimal', fn: () => prisma.movementAnimal.deleteMany() },
    { name: 'Movement', fn: () => prisma.movement.deleteMany() },
    { name: 'Treatment', fn: () => prisma.treatment.deleteMany() },
    { name: 'LotAnimal', fn: () => prisma.lotAnimal.deleteMany() },
    { name: 'Animal', fn: () => prisma.animal.deleteMany() },
    { name: 'Lot', fn: () => prisma.lot.deleteMany() },

    // Personal campaigns
    { name: 'PersonalCampaign', fn: () => prisma.personalCampaign.deleteMany() },

    // Farm preferences
    { name: 'FarmNationalCampaignPreference', fn: () => prisma.farmNationalCampaignPreference.deleteMany() },
    { name: 'FarmBreedPreference', fn: () => prisma.farmBreedPreference.deleteMany() },
    { name: 'FarmVeterinarianPreference', fn: () => prisma.farmVeterinarianPreference.deleteMany() },
    { name: 'FarmProductPreference', fn: () => prisma.farmProductPreference.deleteMany() },
    { name: 'FarmPreferences', fn: () => prisma.farmPreferences.deleteMany() },
    { name: 'AlertConfiguration', fn: () => prisma.alertConfiguration.deleteMany() },

    // Veterinarians
    { name: 'Veterinarian', fn: () => prisma.veterinarian.deleteMany() },

    // Campaigns
    { name: 'CampaignCountry', fn: () => prisma.campaignCountry.deleteMany() },
    { name: 'NationalCampaign', fn: () => prisma.nationalCampaign.deleteMany() },

    // Alert templates
    { name: 'AlertTemplate', fn: () => prisma.alertTemplate.deleteMany() },

    // Farm itself (last)
    { name: 'Farm', fn: () => prisma.farm.deleteMany() },
  ];

  for (const deletion of deletions) {
    try {
      const result = await deletion.fn();
      console.log(`  [DELETE] ${deletion.name}: ${result.count} records`);
    } catch (error: any) {
      console.log(`  [SKIP] ${deletion.name}: ${error.message || 'Table may not exist'}`);
    }
  }
}

// ============================================================================
// Seed Functions
// ============================================================================
async function seedFarms() {
  const data = loadCSVFile('farms.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Farms: ${data.length} records`);
  for (const row of data) {
    await prisma.farm.create({
      data: {
        id: row.id,
        name: row.name,
        ownerId: row.ownerId,
        location: row.location,
        address: row.address,
        commune: row.commune,
        city: row.city,
        postalCode: row.postalCode,
        country: row.country,
        department: row.department,
      },
    });
  }
}

async function seedNationalCampaigns() {
  const data = loadCSVFile('national_campaigns.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] National Campaigns: ${data.length} records`);
  for (const row of data) {
    await prisma.nationalCampaign.create({
      data: {
        id: row.id,
        code: row.code,
        nameFr: row.nameFr,
        nameEn: row.nameEn,
        nameAr: row.nameAr,
        type: row.type,
        description: row.description,
        startDate: row.startDate,
        endDate: row.endDate,
        isActive: row.isActive,
      },
    });
  }
}

async function seedAlertTemplates() {
  const data = loadCSVFile('alert_templates.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Alert Templates: ${data.length} records`);
  for (const row of data) {
    await prisma.alertTemplate.create({
      data: {
        id: row.id,
        code: row.code,
        nameFr: row.nameFr,
        nameEn: row.nameEn,
        nameAr: row.nameAr,
        descriptionFr: row.descriptionFr,
        descriptionEn: row.descriptionEn,
        category: row.category,
        isActive: row.isActive,
      },
    });
  }
}

async function seedVeterinarians() {
  const data = loadCSVFile('veterinarians.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Veterinarians: ${data.length} records`);
  for (const row of data) {
    await prisma.veterinarian.create({
      data: {
        id: row.id,
        scope: row.scope || 'local',
        farmId: row.farmId,
        firstName: row.firstName,
        lastName: row.lastName,
        title: row.title,
        phone: row.phone,
        email: row.email,
        licenseNumber: row.licenseNumber,
        specialties: row.specialties,
        isActive: row.isActive ?? true,
        isDefault: row.isDefault ?? false,
      },
    });
  }
}

async function seedCampaignCountries() {
  const data = loadCSVFile('campaign_countries.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Campaign Countries: ${data.length} records`);
  for (const row of data) {
    await prisma.campaignCountry.create({
      data: {
        id: row.id,
        campaignId: row.campaignId,
        countryCode: row.countryCode,
        isActive: row.isActive ?? true,
      },
    });
  }
}

async function seedAlertConfigurations() {
  const data = loadCSVFile('alert_configurations.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Alert Configurations: ${data.length} records`);
  for (const row of data) {
    await prisma.alertConfiguration.create({
      data: {
        id: row.id,
        farmId: row.farmId,
        enableEmailAlerts: row.enableEmailAlerts,
        enableSmsAlerts: row.enableSmsAlerts,
        enablePushAlerts: row.enablePushAlerts,
        vaccinationReminderDays: row.vaccinationReminderDays,
        treatmentReminderDays: row.treatmentReminderDays,
        healthCheckReminderDays: row.healthCheckReminderDays,
      },
    });
  }
}

async function seedLots() {
  const data = loadCSVFile('lots.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Lots: ${data.length} records`);
  for (const row of data) {
    await prisma.lot.create({
      data: {
        id: row.id,
        farmId: row.farmId,
        name: row.name,
        type: row.type,
        status: row.status,
      },
    });
  }
}

async function seedAnimals() {
  const data = loadCSVFile('animals.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Animals: ${data.length} records`);
  for (const row of data) {
    await prisma.animal.create({
      data: {
        id: row.id,
        farmId: row.farmId,
        birthDate: row.birthDate,
        sex: row.sex,
        currentEid: row.currentEid,
        officialNumber: row.officialNumber,
        visualId: row.visualId,
        speciesId: row.speciesId,
        breedId: row.breedId,
        status: row.status,
        notes: row.notes,
      },
    });
  }
}

async function seedLotAnimals() {
  const data = loadCSVFile('lot_animals.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Lot Animals: ${data.length} records`);
  for (const row of data) {
    await prisma.lotAnimal.create({
      data: {
        id: row.id,
        farmId: row.farmId,
        lotId: row.lotId,
        animalId: row.animalId,
        joinedAt: row.joinedAt,
      },
    });
  }
}

async function seedTreatments() {
  const data = loadCSVFile('treatments.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Treatments: ${data.length} records`);
  for (const row of data) {
    await prisma.treatment.create({
      data: {
        id: row.id,
        farmId: row.farmId,
        animalId: row.animalId,
        productId: row.productId,
        type: row.type,
        treatmentDate: row.treatmentDate,
        dose: row.dose,
        dosageUnit: row.dosageUnit,
        status: row.status,
        withdrawalEndDate: row.withdrawalEndDate,
        diagnosis: row.diagnosis,
        notes: row.notes,
        veterinarianId: row.veterinarianId,
      },
    });
  }
}

async function seedMovements() {
  const data = loadCSVFile('movements.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Movements: ${data.length} records`);
  for (const row of data) {
    await prisma.movement.create({
      data: {
        id: row.id,
        farmId: row.farmId,
        movementType: row.movementType,
        movementDate: row.movementDate,
        reason: row.reason,
        status: row.status || 'ongoing',
        notes: row.notes,
      },
    });
  }
}

async function seedMovementAnimals() {
  const data = loadCSVFile('movement_animals.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Movement Animals: ${data.length} records`);
  for (const row of data) {
    await prisma.movementAnimal.create({
      data: {
        id: row.id,
        movementId: row.movementId,
        animalId: row.animalId,
      },
    });
  }
}

async function seedWeights() {
  const data = loadCSVFile('weights.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Weights: ${data.length} records`);
  for (const row of data) {
    await prisma.weight.create({
      data: {
        id: row.id,
        farmId: row.farmId,
        animalId: row.animalId,
        weight: row.weight,
        weightDate: row.weightDate,
        source: row.source,
        notes: row.notes,
      },
    });
  }
}

async function seedBreedings() {
  const data = loadCSVFile('breedings.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Breedings: ${data.length} records`);
  for (const row of data) {
    await prisma.breeding.create({
      data: {
        id: row.id,
        farmId: row.farmId,
        motherId: row.motherId,
        fatherName: row.fatherName,
        method: row.method,
        breedingDate: row.breedingDate,
        expectedBirthDate: row.expectedBirthDate,
        expectedOffspringCount: row.expectedOffspringCount,
        status: row.status,
        notes: row.notes,
        veterinarianId: row.veterinarianId,
      },
    });
  }
}

async function seedDocuments() {
  const data = loadCSVFile('documents.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Documents: ${data.length} records`);
  for (const row of data) {
    await prisma.document.create({
      data: {
        id: row.id,
        farmId: row.farmId,
        animalId: row.animalId,
        type: row.type,
        title: row.title,
        fileName: row.fileName,
        fileUrl: row.fileUrl,
        fileSizeBytes: row.fileSizeBytes,
        mimeType: row.mimeType,
        uploadDate: row.uploadDate,
        documentNumber: row.documentNumber,
        issueDate: row.issueDate,
        expiryDate: row.expiryDate,
        notes: row.notes,
      },
    });
  }
}

async function seedFarmPreferences() {
  const data = loadCSVFile('farm_preferences.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Farm Preferences: ${data.length} records`);
  for (const row of data) {
    await prisma.farmPreferences.create({
      data: {
        id: row.id,
        farmId: row.farmId,
        weightUnit: row.weightUnit,
        currency: row.currency,
        language: row.language,
        dateFormat: row.dateFormat,
        enableNotifications: row.enableNotifications,
        defaultVeterinarianId: row.defaultVeterinarianId,
        defaultBreedId: row.defaultBreedId,
        defaultSpeciesId: row.defaultSpeciesId,
      },
    });
  }
}

async function seedFarmProductPreferences() {
  const data = loadCSVFile('farm_product_preferences.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Farm Product Preferences: ${data.length} records`);
  for (const row of data) {
    await prisma.farmProductPreference.create({
      data: {
        id: row.id,
        farmId: row.farmId,
        productId: row.productId,
        displayOrder: row.displayOrder,
        isActive: row.isActive,
      },
    });
  }
}

async function seedFarmVeterinarianPreferences() {
  const data = loadCSVFile('farm_veterinarian_preferences.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Farm Veterinarian Preferences: ${data.length} records`);
  for (const row of data) {
    await prisma.farmVeterinarianPreference.create({
      data: {
        id: row.id,
        farmId: row.farmId,
        veterinarianId: row.veterinarianId,
        displayOrder: row.displayOrder,
        isActive: row.isActive,
        isDefault: row.isDefault,
      },
    });
  }
}

async function seedFarmBreedPreferences() {
  const data = loadCSVFile('farm_breed_preferences.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Farm Breed Preferences: ${data.length} records`);
  for (const row of data) {
    await prisma.farmBreedPreference.create({
      data: {
        id: row.id,
        farmId: row.farmId,
        breedId: row.breedId,
        displayOrder: row.displayOrder,
        isActive: row.isActive ?? true,
      },
    });
  }
}

async function seedFarmNationalCampaignPreferences() {
  const data = loadCSVFile('farm_national_campaign_preferences.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Farm National Campaign Preferences: ${data.length} records`);
  for (const row of data) {
    await prisma.farmNationalCampaignPreference.create({
      data: {
        id: row.id,
        farmId: row.farmId,
        campaignId: row.campaignId,
        isEnrolled: row.isEnrolled,
        enrolledAt: row.enrolledAt,
      },
    });
  }
}

async function seedPersonalCampaigns() {
  const data = loadCSVFile('personal_campaigns.csv');
  if (data.length === 0) return;

  console.log(`  [SEED] Personal Campaigns: ${data.length} records`);
  for (const row of data) {
    // productId is required - skip if missing
    if (!row.productId) {
      console.log(`  [WARN] Skipping personal campaign ${row.id} - missing required productId`);
      continue;
    }

    await prisma.personalCampaign.create({
      data: {
        id: row.id,
        farm: { connect: { id: row.farmId } },
        name: row.name,
        description: row.description,
        product: { connect: { id: row.productId } },
        productName: row.productName,
        type: row.type,
        campaignDate: row.campaignDate,
        withdrawalEndDate: row.withdrawalEndDate,
        animalIdsJson: row.animalIdsJson,
        targetCount: row.targetCount,
        status: row.status,
        notes: row.notes,
        ...(row.veterinarianId && { veterinarian: { connect: { id: row.veterinarianId } } }),
      },
    });
  }
}

// ============================================================================
// Main Execution
// ============================================================================
async function main() {
  console.log('');
  console.log('============================================');
  console.log('  SEED FARM DATA - DATABASE LOADER');
  console.log('============================================');
  console.log('');

  // Check if input directory exists
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Error: Input directory not found: ${INPUT_DIR}`);
    console.error('Please run generate-farm-data.ts first.');
    process.exit(1);
  }

  // Load metadata
  const metadataPath = path.join(INPUT_DIR, 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    console.log(`Farm ID: ${metadata.farmId}`);
    console.log(`Generated: ${metadata.generatedAt}`);
  }

  // Delete existing data
  await deleteAllFarmData();

  // Seed data in correct order (respecting FK dependencies)
  console.log('');
  console.log('Seeding new data...');

  // Phase 1: Independent tables
  await seedNationalCampaigns();
  await seedAlertTemplates();
  await seedFarms();

  // Phase 2: Tables depending on phase 1
  await seedCampaignCountries();
  await seedVeterinarians();
  await seedAlertConfigurations();
  await seedLots();

  // Phase 3: Animals (depends on farm, breeds)
  await seedAnimals();

  // Phase 4: Animal-related data
  await seedLotAnimals();
  await seedTreatments();
  await seedMovements();
  await seedMovementAnimals();
  await seedWeights();
  await seedBreedings();
  await seedDocuments();

  // Phase 5: Farm preferences
  await seedFarmPreferences();
  await seedFarmProductPreferences();
  await seedFarmVeterinarianPreferences();
  await seedFarmBreedPreferences();
  await seedFarmNationalCampaignPreferences();

  // Phase 6: Personal campaigns
  await seedPersonalCampaigns();

  console.log('');
  console.log('============================================');
  console.log('  SEED COMPLETE!');
  console.log('============================================');
  console.log('');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
