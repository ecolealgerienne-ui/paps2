/**
 * Parse AMM Veterinary XML to CSV
 *
 * Converts French ANMV veterinary medication XML data to enriched CSV format
 * Source: Base de données des médicaments vétérinaires autorisés en France
 *
 * Usage: npx ts-node scripts/parse-amm-xml.ts <input.xml> [output.csv]
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================
interface Product {
  srcId: string;
  code: string;
  name: string;
  numAmm: string;
  dateAmm: string;
  atcVetCode: string;
  therapeuticForm: string;
  targetSpecies: string;
  manufacturer: string;
  composition: string;
  indications: string;
  administrationRoute: string;
  withdrawalMeatDays: number | null;
  withdrawalMilkHours: number | null;
  prescriptionRequired: boolean;
  rcpLink: string;
}

// ============================================================================
// XML Parsing Helpers
// ============================================================================
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function extractAllTags(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'gi');
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

function extractCDATA(content: string): string {
  const cdataMatch = content.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return cdataMatch ? cdataMatch[1].trim() : content.trim();
}

function extractRcpParagraph(xml: string, termTitres: number[]): string {
  const paragraphs = extractAllTags(xml, 'para-rcp');

  for (const para of paragraphs) {
    const titre = extractTag(para, 'term-titre');
    if (termTitres.includes(parseInt(titre))) {
      const contenu = extractTag(para, 'contenu');
      return extractCDATA(contenu)
        .replace(/\\n/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }
  return '';
}

// Reference tables for term codes
const TERM_SPECIES: Record<string, string> = {
  '5': 'bovins',
  '16': 'chats',
  '22': 'chiens',
  '23': 'chevaux',
  '25': 'caprins',
  '52': 'ovins',
  '59': 'porcins',
  '72': 'volailles',
  '76': 'lapins',
};

const TERM_DENREE: Record<string, string> = {
  '9': 'lait',
  '10': 'non applicable',
  '14': 'viande',
  '16': 'oeufs',
};

const TERM_FORME_PHARMA: Record<string, string> = {
  '92': 'lyophilisat et solvant pour suspension injectable',
  '239': 'suspension injectable',
  '245': 'solution injectable',
  '256': 'suspension intramammaire',
  '267': 'poudre orale',
  '274': 'solution buvable',
  '279': 'comprimé',
  '282': 'émulsion cutanée',
};

const TERM_VOIE_ADMIN: Record<string, string> = {
  '9': 'intramusculaire',
  '13': 'intraveineuse',
  '16': 'intramammaire',
  '24': 'sous-cutanée',
  '28': 'orale',
  '35': 'cutanée',
  '49': 'pour-on',
};

// Extract structured data from voie-administration
interface WithdrawalData {
  meatDays: number | null;
  milkHours: number | null;
  species: string[];
  routes: string[];
}

function extractWithdrawalFromVoies(xml: string): WithdrawalData {
  const result: WithdrawalData = {
    meatDays: null,
    milkHours: null,
    species: [],
    routes: [],
  };

  const voieAdmins = extractAllTags(xml, 'voie-admin');

  for (const voie of voieAdmins) {
    const termEsp = extractTag(voie, 'term-esp');
    const termDenr = extractTag(voie, 'term-denr');
    const termVa = extractTag(voie, 'term-va');
    const qteTa = extractTag(voie, 'qte-ta');
    const termUnite = extractTag(voie, 'term-unite');

    // Collect species
    if (termEsp && TERM_SPECIES[termEsp] && !result.species.includes(TERM_SPECIES[termEsp])) {
      result.species.push(TERM_SPECIES[termEsp]);
    }

    // Collect routes
    if (termVa && TERM_VOIE_ADMIN[termVa] && !result.routes.includes(TERM_VOIE_ADMIN[termVa])) {
      result.routes.push(TERM_VOIE_ADMIN[termVa]);
    }

    // Extract withdrawal periods
    if (qteTa && termDenr) {
      const days = parseInt(qteTa);
      if (!isNaN(days)) {
        // 14 = viande (meat)
        if (termDenr === '14') {
          if (result.meatDays === null || days > result.meatDays) {
            result.meatDays = days;
          }
        }
        // 9 = lait (milk)
        if (termDenr === '9') {
          // Convert to hours (term-unite 22 = jours)
          const hours = termUnite === '22' ? days * 24 : days;
          if (result.milkHours === null || hours > result.milkHours) {
            result.milkHours = hours;
          }
        }
      }
    }
  }

  return result;
}

function extractFormePharma(xml: string): string {
  const termFp = extractTag(xml, 'term-fp');
  return TERM_FORME_PHARMA[termFp] || '';
}

// ============================================================================
// Data Extraction Functions
// ============================================================================
function parseWithdrawalPeriods(text: string): { meatDays: number | null; milkHours: number | null } {
  let meatDays: number | null = null;
  let milkHours: number | null = null;

  if (!text || text.toLowerCase().includes('sans objet')) {
    return { meatDays: null, milkHours: null };
  }

  // Parse meat withdrawal (viande et abats)
  const meatMatch = text.match(/[Vv]iande(?:\s+et\s+abats)?\s*:\s*(\d+)\s*jours?/i);
  if (meatMatch) {
    meatDays = parseInt(meatMatch[1]);
  } else if (text.match(/[Vv]iande(?:\s+et\s+abats)?\s*:\s*z[ée]ro\s*jour/i)) {
    meatDays = 0;
  }

  // Parse milk withdrawal (lait)
  const milkDaysMatch = text.match(/[Ll]ait\s*:\s*(\d+)\s*jours?/i);
  const milkHoursMatch = text.match(/[Ll]ait\s*:\s*(\d+)\s*heures?/i);

  if (milkDaysMatch) {
    milkHours = parseInt(milkDaysMatch[1]) * 24;
  } else if (milkHoursMatch) {
    milkHours = parseInt(milkHoursMatch[1]);
  } else if (text.match(/[Ll]ait\s*:\s*z[ée]ro\s*(?:jour|heure)/i)) {
    milkHours = 0;
  }

  return { meatDays, milkHours };
}

function parseManufacturer(text: string): string {
  if (!text) return '';

  // Take first line (company name)
  const lines = text.split(/\\n|\n/).filter(l => l.trim());
  return lines[0]?.trim() || '';
}

function parseTargetSpecies(text: string): string {
  if (!text) return '';

  // Clean and normalize species names
  return text
    .replace(/\\n/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '')
    .trim();
}

function parseComposition(text: string): string {
  if (!text) return '';

  // Extract substance names from composition text
  // Look for patterns like "Substance active:" or just list them
  const cleaned = text
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/\\n/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Try to extract just the substance names
  const substanceMatch = cleaned.match(/[Ss]ubstance[s]?\s*(?:active[s]?)?\s*:\s*([^.]+)/);
  if (substanceMatch) {
    return substanceMatch[1].trim();
  }

  // Return first 500 chars if no pattern match
  return cleaned.substring(0, 500);
}

function parsePrescriptionRequired(text: string): boolean {
  if (!text) return false;

  return text.toLowerCase().includes('soumis à ordonnance') ||
         text.toLowerCase().includes('soumis a ordonnance') ||
         text.toLowerCase().includes('sur ordonnance');
}

function parseAdministrationRoute(xml: string): string {
  // Try to get from RCP paragraph 48/115 (posologie)
  const posologie = extractRcpParagraph(xml, [48, 115]);

  const routes: string[] = [];

  if (posologie.match(/sous-cutan[ée]/i)) routes.push('sous-cutanée');
  if (posologie.match(/intra-?musculaire/i)) routes.push('intramusculaire');
  if (posologie.match(/intra-?veineuse/i)) routes.push('intraveineuse');
  if (posologie.match(/intra-?mammaire/i)) routes.push('intramammaire');
  if (posologie.match(/[Vv]oie\s+orale|[Pp]ar\s+voie\s+orale|[Bb]uvable/i)) routes.push('orale');
  if (posologie.match(/[Cc]utan[ée]/i)) routes.push('cutanée');
  if (posologie.match(/pour-on/i)) routes.push('pour-on');

  return routes.join(', ') || '';
}

// ============================================================================
// Main Parser
// ============================================================================
function parseProduct(productXml: string): Product | null {
  const srcId = extractTag(productXml, 'src-id');
  const name = extractTag(productXml, 'nom');

  if (!srcId || !name) {
    return null;
  }

  const numAmm = extractTag(productXml, 'num-amm');
  const dateAmm = extractTag(productXml, 'date-amm');
  const rcpLink = extractTag(productXml, 'lien-rcp');

  // ATC code
  const atcVetCode = extractTag(productXml, 'code-atcvet');

  // Extract structured data from voie-administration (most reliable source)
  const voieData = extractWithdrawalFromVoies(productXml);

  // Pharmaceutical form from term-fp code or RCP text
  let therapeuticForm = extractFormePharma(productXml);
  if (!therapeuticForm) {
    // Try RCP paragraphs (three formats: 33-62, 63-99, 100-133)
    therapeuticForm = extractRcpParagraph(productXml, [35, 65, 102]) || '';
  }

  // Target species: prefer structured data, fallback to RCP
  let targetSpecies = voieData.species.join(', ');
  if (!targetSpecies) {
    targetSpecies = parseTargetSpecies(extractRcpParagraph(productXml, [37, 66, 103]));
  }

  // Manufacturer from RCP (multiple term-titre formats)
  // Format 1 (33-62): term-titre 59
  // Format 2 (63-99): term-titre 93
  // Format 3 (100-133): term-titre 127
  const manufacturer = parseManufacturer(
    extractRcpParagraph(productXml, [59, 93, 127])
  );

  // Composition from RCP
  const composition = parseComposition(
    extractRcpParagraph(productXml, [34, 64, 101])
  );

  // Indications from RCP
  const indications = extractRcpParagraph(productXml, [38, 67, 104]);

  // Administration routes: prefer structured data
  let administrationRoute = voieData.routes.join(', ');
  if (!administrationRoute) {
    administrationRoute = parseAdministrationRoute(productXml);
  }

  // Withdrawal periods: prefer structured data from voie-administration
  let meatDays = voieData.meatDays;
  let milkHours = voieData.milkHours;

  // Fallback to RCP text if not found in structured data
  if (meatDays === null && milkHours === null) {
    const withdrawalText = extractRcpParagraph(productXml, [50, 83, 117]);
    const parsed = parseWithdrawalPeriods(withdrawalText);
    meatDays = parsed.meatDays;
    milkHours = parsed.milkHours;
  }

  // Prescription required from RCP (multiple term-titre formats)
  const prescriptionText = extractRcpParagraph(productXml, [67, 95, 133]);
  const prescriptionRequired = parsePrescriptionRequired(prescriptionText);

  return {
    srcId,
    code: `amm_${srcId}`,
    name,
    numAmm,
    dateAmm,
    atcVetCode,
    therapeuticForm,
    targetSpecies,
    manufacturer,
    composition,
    indications,
    administrationRoute,
    withdrawalMeatDays: meatDays,
    withdrawalMilkHours: milkHours,
    prescriptionRequired,
    rcpLink,
  };
}

function parseXmlFile(xmlContent: string): Product[] {
  const products: Product[] = [];

  // Split by medicinal-product tags
  const productMatches = xmlContent.match(/<medicinal-product>[\s\S]*?<\/medicinal-product>/gi);

  if (!productMatches) {
    console.error('No medicinal-product elements found');
    return products;
  }

  console.log(`Found ${productMatches.length} products in XML`);

  for (const productXml of productMatches) {
    const product = parseProduct(productXml);
    if (product) {
      products.push(product);
    }
  }

  return products;
}

// ============================================================================
// CSV Output
// ============================================================================
function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function productsToCSV(products: Product[]): string {
  const headers = [
    'srcId',
    'code',
    'name',
    'numAmm',
    'dateAmm',
    'atcVetCode',
    'therapeuticForm',
    'targetSpecies',
    'manufacturer',
    'composition',
    'indications',
    'administrationRoute',
    'withdrawalMeatDays',
    'withdrawalMilkHours',
    'prescriptionRequired',
    'rcpLink',
  ];

  const lines = [headers.join(',')];

  for (const product of products) {
    const values = headers.map(h => escapeCSV((product as any)[h]));
    lines.push(values.join(','));
  }

  return lines.join('\n');
}

// ============================================================================
// Main
// ============================================================================
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('Usage: npx ts-node scripts/parse-amm-xml.ts <input.xml> [output.csv]');
    console.log('');
    console.log('Example:');
    console.log('  npx ts-node scripts/parse-amm-xml.ts amm-vet-fr.xml products-amm.csv');
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1] || path.join(
    path.dirname(inputFile),
    path.basename(inputFile, '.xml') + '.csv'
  );

  console.log('');
  console.log('============================================');
  console.log('  AMM VETERINARY XML TO CSV CONVERTER');
  console.log('============================================');
  console.log('');
  console.log(`Input:  ${inputFile}`);
  console.log(`Output: ${outputFile}`);
  console.log('');

  // Read XML file
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
  }

  const xmlContent = fs.readFileSync(inputFile, 'utf-8');
  console.log(`Read ${(xmlContent.length / 1024).toFixed(1)} KB from XML file`);

  // Parse products
  const products = parseXmlFile(xmlContent);
  console.log(`Parsed ${products.length} products`);

  // Show sample
  if (products.length > 0) {
    console.log('');
    console.log('Sample product:');
    const sample = products[0];
    console.log(`  Name: ${sample.name}`);
    console.log(`  Manufacturer: ${sample.manufacturer}`);
    console.log(`  Form: ${sample.therapeuticForm}`);
    console.log(`  Species: ${sample.targetSpecies}`);
    console.log(`  Withdrawal Meat: ${sample.withdrawalMeatDays ?? 'N/A'} days`);
    console.log(`  Withdrawal Milk: ${sample.withdrawalMilkHours ?? 'N/A'} hours`);
    console.log(`  Prescription: ${sample.prescriptionRequired}`);
  }

  // Write CSV
  const csvContent = productsToCSV(products);
  fs.writeFileSync(outputFile, csvContent, 'utf-8');
  console.log('');
  console.log(`Written ${products.length} products to ${outputFile}`);

  // Summary stats
  const withMeat = products.filter(p => p.withdrawalMeatDays !== null).length;
  const withMilk = products.filter(p => p.withdrawalMilkHours !== null).length;
  const withPrescription = products.filter(p => p.prescriptionRequired).length;

  console.log('');
  console.log('Statistics:');
  console.log(`  - With meat withdrawal: ${withMeat} (${(withMeat/products.length*100).toFixed(0)}%)`);
  console.log(`  - With milk withdrawal: ${withMilk} (${(withMilk/products.length*100).toFixed(0)}%)`);
  console.log(`  - Prescription required: ${withPrescription} (${(withPrescription/products.length*100).toFixed(0)}%)`);

  console.log('');
  console.log('Done!');
}

main().catch(console.error);
