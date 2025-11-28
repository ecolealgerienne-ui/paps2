/**
 * Script to extract missing reference data from existing JSON files
 * Extracts: Units, ActiveSubstances, ProductCategories, AdministrationRoutes
 */

import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, 'output_test/json');

interface Medicament {
  id_medicament: number;
  nom_commercial: string;
  type_produit?: string;
  code_atc_vet?: string;
  composition?: string;
  substance_active?: string;
  substances_actives?: string[];
  categorie?: string;
}

interface Posologie {
  id_medicament: number;
  voie_administration: string;
  dose_min_mg_par_kg?: number;
  dose_max_mg_par_kg?: number;
  unite_dose?: string;
}

// Load JSON files
const medicaments: Medicament[] = JSON.parse(
  fs.readFileSync(path.join(OUTPUT_DIR, 'medicaments_clinique.json'), 'utf-8')
);

const posologies: Posologie[] = JSON.parse(
  fs.readFileSync(path.join(OUTPUT_DIR, 'medicaments_especes_age_posologie.json'), 'utf-8')
);

console.log(`Loaded ${medicaments.length} medicaments`);
console.log(`Loaded ${posologies.length} posologies`);

// ============================================
// 1. EXTRACT ADMINISTRATION ROUTES
// ============================================
// voie_administration is a numeric code - extract unique codes
const routeCodesSet = new Set<number>();
posologies.forEach(p => {
  if (p.voie_administration !== null && p.voie_administration !== undefined) {
    routeCodesSet.add(Number(p.voie_administration));
  }
});

console.log(`Found route codes: ${Array.from(routeCodesSet).sort((a,b) => a-b).join(', ')}`);

// Map numeric codes to administration routes (based on common veterinary standards)
const routeCodeMap: Record<number, { code: string; fr: string; en: string; ar: string }> = {
  1: { code: 'oral', fr: 'Voie orale', en: 'Oral', ar: 'فموي' },
  2: { code: 'im', fr: 'Intramusculaire', en: 'Intramuscular', ar: 'عضلي' },
  3: { code: 'iv', fr: 'Intraveineuse', en: 'Intravenous', ar: 'وريدي' },
  4: { code: 'sc', fr: 'Sous-cutanée', en: 'Subcutaneous', ar: 'تحت الجلد' },
  5: { code: 'topical', fr: 'Topique/Cutanée', en: 'Topical', ar: 'موضعي' },
  6: { code: 'intramammary', fr: 'Intramammaire', en: 'Intramammary', ar: 'داخل الضرع' },
  7: { code: 'intrauterine', fr: 'Intra-utérine', en: 'Intrauterine', ar: 'داخل الرحم' },
  8: { code: 'pour_on', fr: 'Pour-on', en: 'Pour-on', ar: 'صب على الجلد' },
  9: { code: 'im_sc', fr: 'IM ou SC', en: 'IM or SC', ar: 'عضلي أو تحت الجلد' },
  10: { code: 'intravaginal', fr: 'Intravaginale', en: 'Intravaginal', ar: 'مهبلي' },
  11: { code: 'intranasal', fr: 'Intranasale', en: 'Intranasal', ar: 'أنفي' },
  12: { code: 'ocular', fr: 'Oculaire', en: 'Ocular', ar: 'عيني' },
  13: { code: 'auricular', fr: 'Auriculaire', en: 'Auricular', ar: 'أذني' },
  14: { code: 'rectal', fr: 'Rectale', en: 'Rectal', ar: 'شرجي' },
  15: { code: 'intraperitoneal', fr: 'Intrapéritonéale', en: 'Intraperitoneal', ar: 'داخل الصفاق' },
  16: { code: 'epidural', fr: 'Épidurale', en: 'Epidural', ar: 'فوق الجافية' },
  17: { code: 'intraarticular', fr: 'Intra-articulaire', en: 'Intraarticular', ar: 'داخل المفصل' },
  18: { code: 'drinking_water', fr: 'Eau de boisson', en: 'Drinking water', ar: 'ماء الشرب' },
  19: { code: 'feed', fr: 'Aliment', en: 'Feed', ar: 'العلف' },
  20: { code: 'spot_on', fr: 'Spot-on', en: 'Spot-on', ar: 'نقطة على الجلد' },
};

const administrationRoutes = Array.from(routeCodesSet)
  .sort((a, b) => a - b)
  .map((numCode, index) => {
    const mapped = routeCodeMap[numCode];
    if (mapped) {
      return {
        code: mapped.code,
        numericCode: numCode,
        nameFr: mapped.fr,
        nameEn: mapped.en,
        nameAr: mapped.ar,
        displayOrder: index + 1,
      };
    }
    return {
      code: `route_${numCode}`,
      numericCode: numCode,
      nameFr: `Voie ${numCode}`,
      nameEn: `Route ${numCode}`,
      nameAr: `طريق ${numCode}`,
      displayOrder: index + 1,
    };
  });

console.log(`\n=== Administration Routes: ${administrationRoutes.length} ===`);
console.log(administrationRoutes.map(r => `${r.numericCode}:${r.code}`).join(', '));

// ============================================
// 2. EXTRACT UNITS
// ============================================
const unitsData = [
  // Mass
  { code: 'mg', symbol: 'mg', nameFr: 'Milligramme', nameEn: 'Milligram', nameAr: 'ملليغرام', type: 'mass', factor: 0.001 },
  { code: 'g', symbol: 'g', nameFr: 'Gramme', nameEn: 'Gram', nameAr: 'غرام', type: 'mass', factor: 1 },
  { code: 'kg', symbol: 'kg', nameFr: 'Kilogramme', nameEn: 'Kilogram', nameAr: 'كيلوغرام', type: 'mass', factor: 1000 },
  // Volume
  { code: 'ml', symbol: 'ml', nameFr: 'Millilitre', nameEn: 'Milliliter', nameAr: 'ملليلتر', type: 'volume', factor: 0.001 },
  { code: 'l', symbol: 'L', nameFr: 'Litre', nameEn: 'Liter', nameAr: 'لتر', type: 'volume', factor: 1 },
  { code: 'cl', symbol: 'cl', nameFr: 'Centilitre', nameEn: 'Centiliter', nameAr: 'سنتيلتر', type: 'volume', factor: 0.01 },
  // Concentration
  { code: 'mg_ml', symbol: 'mg/ml', nameFr: 'mg/ml', nameEn: 'mg/ml', nameAr: 'ملغ/مل', type: 'concentration', factor: 1 },
  { code: 'mg_kg', symbol: 'mg/kg', nameFr: 'mg/kg', nameEn: 'mg/kg', nameAr: 'ملغ/كغ', type: 'concentration', factor: 1 },
  { code: 'g_l', symbol: 'g/L', nameFr: 'g/L', nameEn: 'g/L', nameAr: 'غ/ل', type: 'concentration', factor: 1 },
  { code: 'ui_ml', symbol: 'UI/ml', nameFr: 'UI/ml', nameEn: 'IU/ml', nameAr: 'وحدة دولية/مل', type: 'concentration', factor: 1 },
  { code: 'percent', symbol: '%', nameFr: 'Pourcentage', nameEn: 'Percentage', nameAr: 'نسبة مئوية', type: 'percentage', factor: 1 },
  // Count
  { code: 'unit', symbol: 'u', nameFr: 'Unité', nameEn: 'Unit', nameAr: 'وحدة', type: 'count', factor: 1 },
  { code: 'dose', symbol: 'dose', nameFr: 'Dose', nameEn: 'Dose', nameAr: 'جرعة', type: 'count', factor: 1 },
  { code: 'tablet', symbol: 'cp', nameFr: 'Comprimé', nameEn: 'Tablet', nameAr: 'قرص', type: 'count', factor: 1 },
  { code: 'capsule', symbol: 'gél', nameFr: 'Gélule', nameEn: 'Capsule', nameAr: 'كبسولة', type: 'count', factor: 1 },
  { code: 'bolus', symbol: 'bol', nameFr: 'Bolus', nameEn: 'Bolus', nameAr: 'بلعة', type: 'count', factor: 1 },
  { code: 'sachet', symbol: 'sach', nameFr: 'Sachet', nameEn: 'Sachet', nameAr: 'كيس', type: 'count', factor: 1 },
  { code: 'syringe', symbol: 'ser', nameFr: 'Seringue', nameEn: 'Syringe', nameAr: 'حقنة', type: 'count', factor: 1 },
  // Time (for withdrawal)
  { code: 'day', symbol: 'j', nameFr: 'Jour', nameEn: 'Day', nameAr: 'يوم', type: 'time', factor: 1 },
  { code: 'hour', symbol: 'h', nameFr: 'Heure', nameEn: 'Hour', nameAr: 'ساعة', type: 'time', factor: 1/24 },
];

console.log(`\n=== Units: ${unitsData.length} ===`);

// ============================================
// 3. EXTRACT PRODUCT CATEGORIES
// ============================================
const categoriesSet = new Set<string>();
medicaments.forEach(m => {
  if (m.type_produit && typeof m.type_produit === 'string') categoriesSet.add(m.type_produit.trim());
  if (m.categorie && typeof m.categorie === 'string') categoriesSet.add(m.categorie.trim());
});

// Also derive from ATC codes
medicaments.forEach(m => {
  if (m.code_atc_vet) {
    const prefix = m.code_atc_vet.substring(0, 3);
    if (prefix.startsWith('QJ01')) categoriesSet.add('antibiotics');
    else if (prefix.startsWith('QJ05')) categoriesSet.add('antivirals');
    else if (prefix.startsWith('QP5')) categoriesSet.add('antiparasitics');
    else if (prefix.startsWith('QI')) categoriesSet.add('vaccines');
    else if (prefix.startsWith('QA')) categoriesSet.add('digestive');
    else if (prefix.startsWith('QM')) categoriesSet.add('musculoskeletal');
    else if (prefix.startsWith('QN')) categoriesSet.add('nervous_system');
  }
});

const productCategories = [
  { code: 'antibiotics', nameFr: 'Antibiotiques', nameEn: 'Antibiotics', nameAr: 'مضادات حيوية' },
  { code: 'antiparasitics', nameFr: 'Antiparasitaires', nameEn: 'Antiparasitics', nameAr: 'مضادات الطفيليات' },
  { code: 'vaccines', nameFr: 'Vaccins', nameEn: 'Vaccines', nameAr: 'لقاحات' },
  { code: 'anti_inflammatories', nameFr: 'Anti-inflammatoires', nameEn: 'Anti-inflammatories', nameAr: 'مضادات الالتهاب' },
  { code: 'vitamins_minerals', nameFr: 'Vitamines et minéraux', nameEn: 'Vitamins & Minerals', nameAr: 'فيتامينات ومعادن' },
  { code: 'hormones', nameFr: 'Hormones', nameEn: 'Hormones', nameAr: 'هرمونات' },
  { code: 'anesthetics', nameFr: 'Anesthésiques', nameEn: 'Anesthetics', nameAr: 'مخدرات' },
  { code: 'antiseptics', nameFr: 'Antiseptiques', nameEn: 'Antiseptics', nameAr: 'مطهرات' },
  { code: 'antifungals', nameFr: 'Antifongiques', nameEn: 'Antifungals', nameAr: 'مضادات الفطريات' },
  { code: 'digestive', nameFr: 'Appareil digestif', nameEn: 'Digestive system', nameAr: 'الجهاز الهضمي' },
  { code: 'cardiovascular', nameFr: 'Cardiovasculaire', nameEn: 'Cardiovascular', nameAr: 'القلب والأوعية الدموية' },
  { code: 'reproductive', nameFr: 'Reproduction', nameEn: 'Reproductive', nameAr: 'التناسل' },
];

console.log(`\n=== Product Categories: ${productCategories.length} ===`);

// ============================================
// 4. EXTRACT ACTIVE SUBSTANCES
// ============================================
const substancesMap = new Map<string, { name: string; atcCode?: string }>();

medicaments.forEach(m => {
  // Extract from composition field
  if (m.composition && typeof m.composition === 'string') {
    const matches = m.composition.match(/([A-Za-zÀ-ÿ\-]+(?:\s+[A-Za-zÀ-ÿ\-]+)*)\s*\d+\s*(?:mg|g|ml|UI)/gi);
    if (matches) {
      matches.forEach(match => {
        const name = match.replace(/\s*\d+\s*(?:mg|g|ml|UI)/i, '').trim();
        if (name.length > 2 && !name.match(/^(par|pour|chaque|excipient)/i)) {
          substancesMap.set(name.toLowerCase(), { name, atcCode: m.code_atc_vet });
        }
      });
    }
  }

  // Extract from substance_active field
  if (m.substance_active && typeof m.substance_active === 'string') {
    substancesMap.set(m.substance_active.toLowerCase(), {
      name: m.substance_active,
      atcCode: m.code_atc_vet
    });
  }

  // Extract from substances_actives array
  if (m.substances_actives && Array.isArray(m.substances_actives)) {
    m.substances_actives.forEach(s => {
      if (typeof s === 'string') {
        substancesMap.set(s.toLowerCase(), { name: s, atcCode: m.code_atc_vet });
      }
    });
  }
});

// Add common veterinary substances
const commonSubstances = [
  { name: 'Amoxicilline', atcCode: 'QJ01CA04' },
  { name: 'Oxytétracycline', atcCode: 'QJ01AA06' },
  { name: 'Pénicilline G', atcCode: 'QJ01CE01' },
  { name: 'Streptomycine', atcCode: 'QJ01GA01' },
  { name: 'Enrofloxacine', atcCode: 'QJ01MA90' },
  { name: 'Ivermectine', atcCode: 'QP54AA01' },
  { name: 'Lévamisole', atcCode: 'QP52AE01' },
  { name: 'Albendazole', atcCode: 'QP52AC11' },
  { name: 'Flunixine', atcCode: 'QM01AG90' },
  { name: 'Méloxicam', atcCode: 'QM01AC06' },
  { name: 'Dexaméthasone', atcCode: 'QH02AB02' },
  { name: 'Vitamine E', atcCode: 'QA11HA03' },
  { name: 'Sélénium', atcCode: 'QA12CE02' },
  { name: 'Calcium', atcCode: 'QA12AA' },
];

commonSubstances.forEach(s => {
  if (!substancesMap.has(s.name.toLowerCase())) {
    substancesMap.set(s.name.toLowerCase(), s);
  }
});

const activeSubstances = Array.from(substancesMap.values())
  .filter(s => s.name.length > 2)
  .slice(0, 100) // Limit to top 100
  .map((s, index) => ({
    code: s.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50),
    name: s.name,
    nameFr: s.name,
    nameEn: s.name,
    nameAr: s.name,
    atcCode: s.atcCode,
  }));

console.log(`\n=== Active Substances: ${activeSubstances.length} ===`);
console.log(activeSubstances.slice(0, 10).map(s => s.name).join(', ') + '...');

// ============================================
// WRITE OUTPUT FILES
// ============================================
const outputData = {
  units: unitsData,
  productCategories,
  activeSubstances,
  administrationRoutes,
};

// Write individual files
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'units.json'),
  JSON.stringify(unitsData, null, 2)
);

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'product_categories.json'),
  JSON.stringify(productCategories, null, 2)
);

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'active_substances.json'),
  JSON.stringify(activeSubstances, null, 2)
);

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'administration_routes.json'),
  JSON.stringify(administrationRoutes, null, 2)
);

console.log('\n=== Files written ===');
console.log('- units.json');
console.log('- product_categories.json');
console.log('- active_substances.json');
console.log('- administration_routes.json');

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Units: ${unitsData.length}`);
console.log(`Product Categories: ${productCategories.length}`);
console.log(`Active Substances: ${activeSubstances.length}`);
console.log(`Administration Routes: ${administrationRoutes.length}`);
