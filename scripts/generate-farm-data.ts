/**
 * Generate Farm Test Data - CSV Generator
 *
 * Generates CSV files for farm test data based on seed-database-100-animals-fr-v2.ps1
 *
 * Creates:
 * - 1 farm with veterinarians
 * - 4 national campaigns + 6 alert templates
 * - 100 animals (70% bovine, 30% ovine)
 * - Treatments, vaccinations, weights, breedings, documents, movements
 *
 * Output directory: scripts/output_test/farm_data/
 *
 * Usage: npx ts-node scripts/generate-farm-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Configuration
// ============================================================================
const OUTPUT_DIR = path.join(__dirname, 'output_test', 'farm_data');
const FARM_ID = uuidv4(); // Generate new farm ID each time

// Date range: 2023-2025
const START_DATE = new Date('2023-01-01');
const END_DATE = new Date('2025-11-24');
const BIRTH_START_DATE = new Date('2020-01-01');
const BIRTH_END_DATE = new Date('2025-06-01');

// ============================================================================
// Helper Functions
// ============================================================================
function getRandomDate(start: Date, end: Date): string {
  const range = end.getTime() - start.getTime();
  const randomTime = start.getTime() + Math.random() * range;
  return new Date(randomTime).toISOString();
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCSV(data: Record<string, any>[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const lines = [headers.join(',')];
  for (const row of data) {
    const values = headers.map(h => escapeCSV(row[h]));
    lines.push(values.join(','));
  }
  return lines.join('\n');
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ============================================================================
// Data Generators
// ============================================================================

// 1. Farm
function generateFarm(): Record<string, any>[] {
  return [{
    id: FARM_ID,
    name: 'GAEC de la Vallee Verte',
    ownerId: 'owner-gaec-001',
    location: 'Lyon, Rhone-Alpes, France',
    address: '125 Chemin des Pres, 69100 Villeurbanne',
    commune: '69266',
    city: 'Villeurbanne',
    postalCode: '69100',
    country: 'FR',
    department: '69',
  }];
}

// 2. National Campaigns
function generateNationalCampaigns(): Record<string, any>[] {
  return [
    { id: uuidv4(), code: 'vacc-fr-2024', nameFr: 'Campagne Vaccination 2024', nameEn: 'Vaccination Campaign 2024', nameAr: 'Vaccination Campaign 2024', type: 'vaccination', description: 'Campagne nationale de vaccination', startDate: '2024-01-01T00:00:00.000Z', endDate: '2024-12-31T23:59:59.999Z', isActive: true },
    { id: uuidv4(), code: 'depara-fr-2024', nameFr: 'Campagne Deparasitage 2024', nameEn: 'Deworming Campaign 2024', nameAr: 'Deworming Campaign 2024', type: 'deworming', description: 'Campagne de deparasitage', startDate: '2024-03-01T00:00:00.000Z', endDate: '2024-11-30T23:59:59.999Z', isActive: true },
    { id: uuidv4(), code: 'brucello-fr-2024', nameFr: 'Depistage Brucellose 2024', nameEn: 'Brucellosis Screening 2024', nameAr: 'Brucellosis Screening 2024', type: 'screening', description: 'Depistage brucellose', startDate: '2024-01-01T00:00:00.000Z', endDate: '2024-12-31T23:59:59.999Z', isActive: true },
    { id: uuidv4(), code: 'recens-fr-2024', nameFr: 'Recensement 2024', nameEn: 'Census 2024', nameAr: 'Census 2024', type: 'census', description: 'Recensement annuel', startDate: '2024-09-01T00:00:00.000Z', endDate: '2024-10-31T23:59:59.999Z', isActive: false },
  ];
}

// 3. Alert Templates
function generateAlertTemplates(): Record<string, any>[] {
  return [
    { id: uuidv4(), code: 'vacc_reminder', nameFr: 'Rappel vaccination', nameEn: 'Vaccination reminder', nameAr: 'Vaccination reminder', descriptionFr: 'Rappel pour vaccinations', descriptionEn: 'Vaccination reminder', category: 'vaccination', isActive: true },
    { id: uuidv4(), code: 'treat_reminder', nameFr: 'Rappel traitement', nameEn: 'Treatment reminder', nameAr: 'Treatment reminder', descriptionFr: 'Rappel pour traitements', descriptionEn: 'Treatment reminder', category: 'treatment', isActive: true },
    { id: uuidv4(), code: 'birth_reminder', nameFr: 'Rappel mise bas', nameEn: 'Birth reminder', nameAr: 'Birth reminder', descriptionFr: 'Rappel mise bas prevue', descriptionEn: 'Expected birth', category: 'reproduction', isActive: true },
    { id: uuidv4(), code: 'weight_reminder', nameFr: 'Rappel pesee', nameEn: 'Weight reminder', nameAr: 'Weight reminder', descriptionFr: 'Rappel pesee periodique', descriptionEn: 'Periodic weighing', category: 'health', isActive: true },
    { id: uuidv4(), code: 'health_check', nameFr: 'Controle sanitaire', nameEn: 'Health check', nameAr: 'Health check', descriptionFr: 'Controle sanitaire periodique', descriptionEn: 'Periodic health check', category: 'health', isActive: true },
    { id: uuidv4(), code: 'campaign_reminder', nameFr: 'Rappel campagne', nameEn: 'Campaign reminder', nameAr: 'Campaign reminder', descriptionFr: 'Rappel campagne nationale', descriptionEn: 'National campaign reminder', category: 'administrative', isActive: true },
  ];
}

// 4. Veterinarians
function generateVeterinarians(): Record<string, any>[] {
  const vets = [
    { firstName: 'Marie', lastName: 'Martin', title: 'Dr.', phone: '0612345678', email: 'm.martin@vetfrance.fr', licenseNumber: 'VET-FR-001', specialties: 'Bovins laitiers' },
    { firstName: 'Pierre', lastName: 'Dubois', title: 'Dr.', phone: '0623456789', email: 'p.dubois@vetfrance.fr', licenseNumber: 'VET-FR-002', specialties: 'Bovins viande' },
    { firstName: 'Sophie', lastName: 'Bernard', title: 'Dr.', phone: '0634567890', email: 's.bernard@vetfrance.fr', licenseNumber: 'VET-FR-003', specialties: 'Ovins' },
    { firstName: 'Luc', lastName: 'Petit', title: 'Dr.', phone: '0645678901', email: 'l.petit@vetfrance.fr', licenseNumber: 'VET-FR-004', specialties: 'Chirurgie' },
    { firstName: 'Claire', lastName: 'Moreau', title: 'Dr.', phone: '0656789012', email: 'c.moreau@vetfrance.fr', licenseNumber: 'VET-FR-005', specialties: 'Reproduction' },
  ];
  return vets.map((v, i) => ({
    id: uuidv4(),
    farmId: FARM_ID,
    isDefault: i === 0,
    ...v,
  }));
}

// 5. Campaign Countries
function generateCampaignCountries(campaigns: Record<string, any>[]): Record<string, any>[] {
  return campaigns.map(c => ({
    id: uuidv4(),
    campaignId: c.id,
    countryCode: 'FR',
  }));
}

// 6. Farm Alert Configuration
function generateFarmAlertConfiguration(): Record<string, any>[] {
  return [{
    id: uuidv4(),
    farmId: FARM_ID,
    enableEmailAlerts: true,
    enableSmsAlerts: false,
    enablePushAlerts: true,
    vaccinationReminderDays: 7,
    treatmentReminderDays: 3,
    healthCheckReminderDays: 30,
  }];
}

// 7. Lots
function generateLots(): Record<string, any>[] {
  const lots = [
    { name: 'Lot Vaches Laitieres', type: 'production', status: 'open' },
    { name: 'Lot Genisses 2024', type: 'reproduction', status: 'open' },
    { name: 'Lot Vente Automne 2024', type: 'sale', status: 'closed' },
    { name: 'Lot Traitement Parasites Mars', type: 'treatment', status: 'completed' },
    { name: 'Lot Vaccination Printemps', type: 'vaccination', status: 'completed' },
    { name: 'Lot Brebis Laitieres', type: 'production', status: 'open' },
    { name: 'Lot Agneaux Printemps 2024', type: 'birth', status: 'open' },
    { name: 'Lot Reforme 2024', type: 'sale', status: 'open' },
    { name: 'Lot Quarantaine', type: 'quarantine', status: 'open' },
    { name: 'Lot Engraissement', type: 'fattening', status: 'open' },
  ];
  return lots.map(l => ({
    id: uuidv4(),
    farmId: FARM_ID,
    ...l,
  }));
}

// 8. Animals (100 animals: 70% bovine, 30% ovine)
function generateAnimals(bovineBreedIds: string[], ovineBreedIds: string[]): Record<string, any>[] {
  const animals: Record<string, any>[] = [];
  const statuses = [
    { status: 'alive', count: 72 },
    { status: 'sold', count: 11 },
    { status: 'dead', count: 7 },
    { status: 'slaughtered', count: 10 },
  ];

  const bovineNames = ['Belle', 'Marguerite', 'Duchesse', 'Fauvette', 'Iris', 'Lilas', 'Noisette', 'Pivoine', 'Rose', 'Tulipe', 'Cesar', 'Django', 'Elliot', 'Faust', 'Gaspard', 'Hugo', 'Igor', 'Jules', 'Lancelot', 'Nestor'];
  const ovineNames = ['Blanchette', 'Cannelle', 'Doucette', 'Etoile', 'Flocon', 'Grisette', 'Lulu', 'Noisette', 'Perle', 'Violette', 'Alphonse', 'Basile', 'Caramel', 'Dominique', 'Edmond', 'Felix', 'Gaston', 'Leon', 'Marius', 'Oscar'];

  let counter = 0;
  for (const statusGroup of statuses) {
    for (let i = 0; i < statusGroup.count; i++) {
      counter++;
      const isBovine = (counter % 10) <= 6;
      const speciesId = isBovine ? 'bovine' : 'ovine';
      const breedIds = isBovine ? bovineBreedIds : ovineBreedIds;
      const breedId = breedIds.length > 0 ? getRandomElement(breedIds) : null;
      const sex = Math.random() < 0.5 ? 'male' : 'female';
      const birthDate = getRandomDate(BIRTH_START_DATE, BIRTH_END_DATE);

      const eidNumber = '2502690' + String(getRandomInt(1, 99999999)).padStart(8, '0');
      const officialNumber = `FR-${new Date(birthDate).getFullYear()}-${String(getRandomInt(1, 99999)).padStart(5, '0')}`;
      const visualId = getRandomElement(isBovine ? bovineNames : ovineNames) + '-' + String(counter).padStart(3, '0');

      const animal: Record<string, any> = {
        id: uuidv4(),
        farmId: FARM_ID,
        birthDate,
        sex,
        currentEid: eidNumber,
        officialNumber,
        visualId,
        speciesId,
        breedId,
        status: statusGroup.status,
        notes: `Animal de test - Statut: ${statusGroup.status}`,
      };

      // Add dates for specific statuses
      const birthDateObj = new Date(birthDate);
      if (statusGroup.status === 'dead') {
        const deathDate = new Date(birthDateObj);
        deathDate.setMonth(deathDate.getMonth() + 6);
        animal.deathDate = getRandomDate(deathDate, END_DATE);
        animal.deathReason = getRandomElement(['maladie', 'accident', 'vieillesse']);
      } else if (statusGroup.status === 'slaughtered') {
        const slaughterDate = new Date(birthDateObj);
        slaughterDate.setFullYear(slaughterDate.getFullYear() + 1);
        animal.slaughterDate = getRandomDate(slaughterDate, END_DATE);
      } else if (statusGroup.status === 'sold') {
        const saleDate = new Date(birthDateObj);
        saleDate.setMonth(saleDate.getMonth() + 8);
        animal.saleDate = getRandomDate(saleDate, END_DATE);
      }

      animals.push(animal);
    }
  }

  return animals;
}

// 9. Lot Animals
function generateLotAnimals(lots: Record<string, any>[], animals: Record<string, any>[]): Record<string, any>[] {
  const lotAnimals: Record<string, any>[] = [];

  for (const animal of animals) {
    const numLots = getRandomInt(1, 2);
    const selectedLots = [...lots].sort(() => Math.random() - 0.5).slice(0, numLots);

    for (const lot of selectedLots) {
      lotAnimals.push({
        id: uuidv4(),
        lotId: lot.id,
        animalId: animal.id,
        addedAt: getRandomDate(START_DATE, END_DATE),
      });
    }
  }

  return lotAnimals;
}

// 10. Treatments (treatments + vaccinations)
function generateTreatments(animals: Record<string, any>[], vets: Record<string, any>[], productIds: string[]): Record<string, any>[] {
  const treatments: Record<string, any>[] = [];
  const diagnoses = ['Infection respiratoire', 'Parasitose', 'Boiterie', 'Mammite', 'Diarrhee', 'Fievre', 'Plaie', 'Reproduction'];
  const vaccinationDiagnoses = ['Vaccination preventive', 'Rappel vaccinal', 'Primo-vaccination'];
  const dosageUnits = ['ml', 'mg', 'g'];

  for (const animal of animals) {
    // 2-3 treatments per animal
    const numTreatments = getRandomInt(2, 3);
    for (let i = 0; i < numTreatments; i++) {
      const treatmentDate = getRandomDate(START_DATE, END_DATE);
      const withdrawalDays = getRandomInt(0, 60);
      const withdrawalEndDate = new Date(treatmentDate);
      withdrawalEndDate.setDate(withdrawalEndDate.getDate() + withdrawalDays);

      treatments.push({
        id: uuidv4(),
        farmId: FARM_ID,
        animalId: animal.id,
        productId: productIds.length > 0 ? getRandomElement(productIds) : null,
        type: 'treatment',
        treatmentDate,
        dose: Math.round((getRandomInt(10, 100) / 10) * 10) / 10,
        dosageUnit: getRandomElement(dosageUnits),
        status: getRandomElement(['completed', 'in_progress', 'scheduled']),
        withdrawalEndDate: withdrawalEndDate.toISOString(),
        diagnosis: getRandomElement(diagnoses),
        notes: 'Traitement therapeutique',
        veterinarianId: vets.length > 0 ? getRandomElement(vets).id : null,
      });
    }

    // 2-3 vaccinations per animal
    const numVaccinations = getRandomInt(2, 3);
    for (let i = 0; i < numVaccinations; i++) {
      const vaccineDate = getRandomDate(START_DATE, END_DATE);
      const nextDueDate = new Date(vaccineDate);
      nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);

      treatments.push({
        id: uuidv4(),
        farmId: FARM_ID,
        animalId: animal.id,
        productId: productIds.length > 0 ? getRandomElement(productIds) : null,
        type: 'vaccination',
        treatmentDate: vaccineDate,
        dose: getRandomElement([1.0, 2.0, 2.5, 3.0, 5.0]),
        dosageUnit: 'ml',
        status: 'completed',
        withdrawalEndDate: nextDueDate.toISOString(),
        diagnosis: getRandomElement(vaccinationDiagnoses),
        notes: 'Vaccination de routine',
        veterinarianId: vets.length > 0 ? getRandomElement(vets).id : null,
      });
    }
  }

  return treatments;
}

// 11. Movements
function generateMovements(animals: Record<string, any>[]): Record<string, any>[] {
  const movements: Record<string, any>[] = [];
  const reasons: Record<string, string[]> = {
    entry: ['Achat', 'Naissance', 'Retour'],
    exit: ['Vente', 'Reforme', 'Abattage'],
    transfer: ['Changement de batiment'],
    birth: ['Naissance a la ferme'],
    purchase: ['Achat en elevage'],
  };

  for (const animal of animals) {
    const numMovements = getRandomInt(1, 2);
    for (let i = 0; i < numMovements; i++) {
      const movementType = getRandomElement(['entry', 'exit', 'transfer', 'birth', 'purchase']);
      movements.push({
        id: uuidv4(),
        farmId: FARM_ID,
        animalId: animal.id,
        movementType,
        movementDate: getRandomDate(START_DATE, END_DATE),
        reason: getRandomElement(reasons[movementType]),
        notes: `Mouvement type ${movementType}`,
      });
    }
  }

  return movements;
}

// 12. Weights
function generateWeights(animals: Record<string, any>[]): Record<string, any>[] {
  const weights: Record<string, any>[] = [];
  const sources = ['manual', 'automatic', 'weighbridge'];

  for (const animal of animals) {
    const numWeights = getRandomInt(4, 5);
    const baseWeight = getRandomInt(250, 500);

    for (let i = 0; i < numWeights; i++) {
      weights.push({
        id: uuidv4(),
        farmId: FARM_ID,
        animalId: animal.id,
        weight: Math.round((baseWeight + i * getRandomInt(20, 60)) * 10) / 10,
        weightDate: getRandomDate(START_DATE, END_DATE),
        source: getRandomElement(sources),
        notes: `Pesee periodique #${i + 1}`,
      });
    }
  }

  return weights;
}

// 13. Breedings
function generateBreedings(animals: Record<string, any>[], vets: Record<string, any>[]): Record<string, any>[] {
  const breedings: Record<string, any>[] = [];
  const fatherNames = ['Taureau Elite', 'Taureau Limousin', 'Belier Ile-de-France', 'Reproducteur IA'];
  const methods = ['artificial_insemination', 'natural_mating'];
  const statuses = ['planned', 'confirmed', 'delivered', 'failed'];

  const numBreedings = Math.min(50, Math.floor(animals.length * 0.45));
  const selectedAnimals = [...animals].sort(() => Math.random() - 0.5).slice(0, numBreedings);

  for (const animal of selectedAnimals) {
    const breedingDate = getRandomDate(START_DATE, new Date('2024-12-31'));
    const expectedBirthDate = new Date(breedingDate);
    expectedBirthDate.setMonth(expectedBirthDate.getMonth() + 9);

    breedings.push({
      id: uuidv4(),
      farmId: FARM_ID,
      motherId: animal.id,
      fatherName: getRandomElement(fatherNames),
      method: getRandomElement(methods),
      breedingDate,
      expectedBirthDate: expectedBirthDate.toISOString(),
      expectedOffspringCount: getRandomInt(1, 2),
      status: getRandomElement(statuses),
      notes: 'Saillie IA ou monte naturelle',
      veterinarianId: vets.length > 0 ? getRandomElement(vets).id : null,
    });
  }

  return breedings;
}

// 14. Documents
function generateDocuments(animals: Record<string, any>[]): Record<string, any>[] {
  const documents: Record<string, any>[] = [];
  const docTypes = ['health_certificate', 'movement_permit', 'test_results', 'pedigree', 'insurance', 'other'];
  const docTitles: Record<string, string> = {
    health_certificate: 'Certificat sanitaire',
    movement_permit: 'Autorisation de mouvement',
    test_results: 'Resultats d\'analyses',
    pedigree: 'Certificat de genealogie',
    insurance: 'Attestation d\'assurance',
    other: 'Document divers',
  };

  for (const animal of animals) {
    const uploadDate = getRandomDate(START_DATE, END_DATE);
    const issueDate = uploadDate;
    const expiryDate = new Date(issueDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const docType = getRandomElement(docTypes);
    const docTitle = docTitles[docType];

    documents.push({
      id: uuidv4(),
      farmId: FARM_ID,
      animalId: animal.id,
      type: docType,
      title: docTitle,
      fileName: docTitle.replace(/ /g, '-').toLowerCase() + '-' + getRandomInt(1000, 9999) + '.pdf',
      fileUrl: `https://example.com/documents/animal-${animal.id}/${docTitle.replace(/ /g, '-').toLowerCase()}.pdf`,
      fileSizeBytes: getRandomInt(50000, 500000),
      mimeType: 'application/pdf',
      uploadDate,
      documentNumber: `DOC-FR-${new Date(issueDate).getFullYear()}-${getRandomInt(10000, 99999)}`,
      issueDate,
      expiryDate: expiryDate.toISOString(),
      notes: 'Document officiel',
    });
  }

  return documents;
}

// 15. Farm Preferences
function generateFarmPreferences(vets: Record<string, any>[], bovineBreedIds: string[]): Record<string, any>[] {
  return [{
    id: uuidv4(),
    farmId: FARM_ID,
    weightUnit: 'kg',
    currency: 'EUR',
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    enableNotifications: true,
    defaultVeterinarianId: vets.length > 0 ? vets[0].id : null,
    defaultBreedId: bovineBreedIds.length > 0 ? bovineBreedIds[0] : null,
    defaultSpeciesId: 'bovine',
  }];
}

// 16. Farm Product Preferences
function generateFarmProductPreferences(productIds: string[]): Record<string, any>[] {
  const prefs: Record<string, any>[] = [];
  const count = Math.min(5, productIds.length);
  for (let i = 0; i < count; i++) {
    prefs.push({
      id: uuidv4(),
      farmId: FARM_ID,
      productId: productIds[i],
      displayOrder: i + 1,
      isActive: true,
    });
  }
  return prefs;
}

// 17. Farm Veterinarian Preferences
function generateFarmVeterinarianPreferences(vets: Record<string, any>[]): Record<string, any>[] {
  const prefs: Record<string, any>[] = [];
  const count = Math.min(3, vets.length);
  for (let i = 0; i < count; i++) {
    prefs.push({
      id: uuidv4(),
      farmId: FARM_ID,
      veterinarianId: vets[i].id,
      displayOrder: i + 1,
      isActive: true,
      isDefault: i === 0,
    });
  }
  return prefs;
}

// 18. Farm Breed Preferences
function generateFarmBreedPreferences(bovineBreedIds: string[]): Record<string, any>[] {
  const prefs: Record<string, any>[] = [];
  const count = Math.min(3, bovineBreedIds.length);
  for (let i = 0; i < count; i++) {
    prefs.push({
      id: uuidv4(),
      farmId: FARM_ID,
      breedId: bovineBreedIds[i],
      displayOrder: i + 1,
    });
  }
  return prefs;
}

// 19. Farm Campaign Preferences
function generateFarmCampaignPreferences(campaigns: Record<string, any>[]): Record<string, any>[] {
  const prefs: Record<string, any>[] = [];
  const count = Math.min(2, campaigns.length);
  for (let i = 0; i < count; i++) {
    prefs.push({
      id: uuidv4(),
      farmId: FARM_ID,
      campaignId: campaigns[i].id,
      isEnrolled: true,
      enrolledAt: new Date().toISOString(),
    });
  }
  return prefs;
}

// 20. Personal Campaigns
function generatePersonalCampaigns(animals: Record<string, any>[], vets: Record<string, any>[], productIds: string[]): Record<string, any>[] {
  const campaignsData = [
    { name: 'Campagne Deparasitage Printemps 2024', type: 'deworming', campaignDate: '2024-03-15T00:00:00.000Z', withdrawalEndDate: '2024-04-15T00:00:00.000Z', targetCount: 80 },
    { name: 'Campagne Vaccination Automne 2024', type: 'vaccination', campaignDate: '2024-09-01T00:00:00.000Z', withdrawalEndDate: '2024-10-01T00:00:00.000Z', targetCount: 95 },
    { name: 'Traitement Antiparasitaire Ete', type: 'treatment', campaignDate: '2024-06-15T00:00:00.000Z', withdrawalEndDate: '2024-07-15T00:00:00.000Z', targetCount: 70 },
    { name: 'Campagne Depistage Brucellose', type: 'screening', campaignDate: '2024-05-01T00:00:00.000Z', withdrawalEndDate: '2024-05-31T00:00:00.000Z', targetCount: 100 },
  ];

  return campaignsData.map(cd => {
    const targetAnimals = [...animals].sort(() => Math.random() - 0.5).slice(0, Math.min(cd.targetCount, animals.length));
    return {
      id: uuidv4(),
      farmId: FARM_ID,
      name: cd.name,
      description: 'Campagne personnalisee de la ferme',
      productId: productIds.length > 0 ? getRandomElement(productIds) : null,
      type: cd.type,
      campaignDate: cd.campaignDate,
      withdrawalEndDate: cd.withdrawalEndDate,
      animalIdsJson: JSON.stringify(targetAnimals.map(a => a.id)),
      targetCount: cd.targetCount,
      status: getRandomElement(['scheduled', 'in_progress', 'completed']),
      notes: 'Campagne de gestion sanitaire',
      veterinarianId: vets.length > 0 ? getRandomElement(vets).id : null,
    };
  });
}

// ============================================================================
// Main Execution
// ============================================================================
async function main() {
  console.log('');
  console.log('============================================');
  console.log('  GENERATE FARM TEST DATA - CSV FILES');
  console.log('============================================');
  console.log('');

  // Ensure output directory exists
  ensureDir(OUTPUT_DIR);

  // Load existing reference data to get breed IDs and product IDs
  const referenceDir = path.join(__dirname, 'output_test', 'csv');

  // Load breeds
  let bovineBreedIds: string[] = [];
  let ovineBreedIds: string[] = [];
  const breedsFile = path.join(referenceDir, 'breeds.csv');
  if (fs.existsSync(breedsFile)) {
    const breedsContent = fs.readFileSync(breedsFile, 'utf-8');
    const lines = breedsContent.split('\n').slice(1); // Skip header
    for (const line of lines) {
      if (line.trim()) {
        const parts = line.split(',');
        const id = parts[0];
        const speciesId = parts[2]; // Assuming speciesId is at index 2
        if (speciesId === 'bovine') {
          bovineBreedIds.push(id);
        } else if (speciesId === 'ovine') {
          ovineBreedIds.push(id);
        }
      }
    }
  }
  console.log(`Loaded ${bovineBreedIds.length} bovine breeds, ${ovineBreedIds.length} ovine breeds`);

  // Load products
  let productIds: string[] = [];
  const productsFile = path.join(referenceDir, 'products.csv');
  if (fs.existsSync(productsFile)) {
    const productsContent = fs.readFileSync(productsFile, 'utf-8');
    const lines = productsContent.split('\n').slice(1); // Skip header
    for (const line of lines) {
      if (line.trim()) {
        const id = line.split(',')[0];
        productIds.push(id);
      }
    }
  }
  console.log(`Loaded ${productIds.length} products`);

  // Generate data
  console.log('');
  console.log('Generating data...');

  const farm = generateFarm();
  console.log(`  - Farm: ${farm.length}`);

  const nationalCampaigns = generateNationalCampaigns();
  console.log(`  - National Campaigns: ${nationalCampaigns.length}`);

  const alertTemplates = generateAlertTemplates();
  console.log(`  - Alert Templates: ${alertTemplates.length}`);

  const veterinarians = generateVeterinarians();
  console.log(`  - Veterinarians: ${veterinarians.length}`);

  const campaignCountries = generateCampaignCountries(nationalCampaigns);
  console.log(`  - Campaign Countries: ${campaignCountries.length}`);

  const farmAlertConfiguration = generateFarmAlertConfiguration();
  console.log(`  - Farm Alert Configuration: ${farmAlertConfiguration.length}`);

  const lots = generateLots();
  console.log(`  - Lots: ${lots.length}`);

  const animals = generateAnimals(bovineBreedIds, ovineBreedIds);
  console.log(`  - Animals: ${animals.length}`);

  const lotAnimals = generateLotAnimals(lots, animals);
  console.log(`  - Lot Animals: ${lotAnimals.length}`);

  const treatments = generateTreatments(animals, veterinarians, productIds);
  console.log(`  - Treatments: ${treatments.length}`);

  const movements = generateMovements(animals);
  console.log(`  - Movements: ${movements.length}`);

  const weights = generateWeights(animals);
  console.log(`  - Weights: ${weights.length}`);

  const breedings = generateBreedings(animals, veterinarians);
  console.log(`  - Breedings: ${breedings.length}`);

  const documents = generateDocuments(animals);
  console.log(`  - Documents: ${documents.length}`);

  const farmPreferences = generateFarmPreferences(veterinarians, bovineBreedIds);
  console.log(`  - Farm Preferences: ${farmPreferences.length}`);

  const farmProductPreferences = generateFarmProductPreferences(productIds);
  console.log(`  - Farm Product Preferences: ${farmProductPreferences.length}`);

  const farmVeterinarianPreferences = generateFarmVeterinarianPreferences(veterinarians);
  console.log(`  - Farm Veterinarian Preferences: ${farmVeterinarianPreferences.length}`);

  const farmBreedPreferences = generateFarmBreedPreferences(bovineBreedIds);
  console.log(`  - Farm Breed Preferences: ${farmBreedPreferences.length}`);

  const farmCampaignPreferences = generateFarmCampaignPreferences(nationalCampaigns);
  console.log(`  - Farm Campaign Preferences: ${farmCampaignPreferences.length}`);

  const personalCampaigns = generatePersonalCampaigns(animals, veterinarians, productIds);
  console.log(`  - Personal Campaigns: ${personalCampaigns.length}`);

  // Write CSV files
  console.log('');
  console.log('Writing CSV files...');

  const files = [
    { name: 'farms.csv', data: farm },
    { name: 'national_campaigns.csv', data: nationalCampaigns },
    { name: 'alert_templates.csv', data: alertTemplates },
    { name: 'veterinarians.csv', data: veterinarians },
    { name: 'campaign_countries.csv', data: campaignCountries },
    { name: 'farm_alert_configurations.csv', data: farmAlertConfiguration },
    { name: 'lots.csv', data: lots },
    { name: 'animals.csv', data: animals },
    { name: 'lot_animals.csv', data: lotAnimals },
    { name: 'treatments.csv', data: treatments },
    { name: 'movements.csv', data: movements },
    { name: 'weights.csv', data: weights },
    { name: 'breedings.csv', data: breedings },
    { name: 'documents.csv', data: documents },
    { name: 'farm_preferences.csv', data: farmPreferences },
    { name: 'farm_product_preferences.csv', data: farmProductPreferences },
    { name: 'farm_veterinarian_preferences.csv', data: farmVeterinarianPreferences },
    { name: 'farm_breed_preferences.csv', data: farmBreedPreferences },
    { name: 'farm_campaign_preferences.csv', data: farmCampaignPreferences },
    { name: 'personal_campaigns.csv', data: personalCampaigns },
  ];

  for (const file of files) {
    const filePath = path.join(OUTPUT_DIR, file.name);
    fs.writeFileSync(filePath, arrayToCSV(file.data));
    console.log(`  - ${file.name}`);
  }

  // Write metadata file
  const metadata = {
    farmId: FARM_ID,
    generatedAt: new Date().toISOString(),
    counts: {
      farms: farm.length,
      nationalCampaigns: nationalCampaigns.length,
      alertTemplates: alertTemplates.length,
      veterinarians: veterinarians.length,
      campaignCountries: campaignCountries.length,
      lots: lots.length,
      animals: animals.length,
      lotAnimals: lotAnimals.length,
      treatments: treatments.length,
      movements: movements.length,
      weights: weights.length,
      breedings: breedings.length,
      documents: documents.length,
      personalCampaigns: personalCampaigns.length,
    },
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2));
  console.log('  - metadata.json');

  console.log('');
  console.log('============================================');
  console.log('  GENERATION COMPLETE!');
  console.log('============================================');
  console.log('');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Farm ID: ${FARM_ID}`);
  console.log('');
}

main().catch(console.error);
