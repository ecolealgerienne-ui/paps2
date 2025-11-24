import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ========== SPECIES ==========
  console.log('Creating species...');
  await prisma.species.createMany({
    data: [
      {
        id: 'sheep',
        nameFr: 'Ovin',
        nameEn: 'Sheep',
        nameAr: 'غنم',
        icon: '🐑',
        displayOrder: 1,
      },
      {
        id: 'cattle',
        nameFr: 'Bovin',
        nameEn: 'Cattle',
        nameAr: 'بقر',
        icon: '🐄',
        displayOrder: 2,
      },
      {
        id: 'goat',
        nameFr: 'Caprin',
        nameEn: 'Goat',
        nameAr: 'ماعز',
        icon: '🐐',
        displayOrder: 3,
      },
    ],
    skipDuplicates: true,
  });

  // ========== BREEDS - SHEEP ==========
  console.log('Creating sheep breeds...');
  await prisma.breed.createMany({
    data: [
      {
        id: 'ouled-djellal',
        code: 'ouled-djellal',
        speciesId: 'sheep',
        nameFr: 'Ouled Djellal',
        nameEn: 'Ouled Djellal',
        nameAr: 'أولاد جلال',
        displayOrder: 1,
      },
      {
        id: 'rembi',
        code: 'rembi',
        speciesId: 'sheep',
        nameFr: 'Rembi',
        nameEn: 'Rembi',
        nameAr: 'الرمبي',
        displayOrder: 2,
      },
      {
        id: 'hamra',
        code: 'hamra',
        speciesId: 'sheep',
        nameFr: 'Hamra',
        nameEn: 'Hamra',
        nameAr: 'الحمراء',
        displayOrder: 3,
      },
      {
        id: 'dmen',
        code: 'dmen',
        speciesId: 'sheep',
        nameFr: "D'men",
        nameEn: "D'men",
        nameAr: 'الدمان',
        displayOrder: 4,
      },
      {
        id: 'taadmit',
        code: 'taadmit',
        speciesId: 'sheep',
        nameFr: 'Taadmit',
        nameEn: 'Taadmit',
        nameAr: 'تعظميت',
        displayOrder: 5,
      },
      {
        id: 'barbarine',
        code: 'barbarine',
        speciesId: 'sheep',
        nameFr: 'Barbarine',
        nameEn: 'Barbarine',
        nameAr: 'البربرين',
        displayOrder: 6,
      },
      {
        id: 'sidahou',
        code: 'sidahou',
        speciesId: 'sheep',
        nameFr: 'Sidahou',
        nameEn: 'Sidahou',
        nameAr: 'سيداهو',
        displayOrder: 7,
      },
    ],
    skipDuplicates: true,
  });

  // ========== BREEDS - CATTLE ==========
  console.log('Creating cattle breeds...');
  await prisma.breed.createMany({
    data: [
      {
        id: 'guelma',
        code: 'guelma',
        speciesId: 'cattle',
        nameFr: 'Guelmoise',
        nameEn: 'Guelma',
        nameAr: 'القالمية',
        displayOrder: 1,
      },
      {
        id: 'cheurfa',
        code: 'cheurfa',
        speciesId: 'cattle',
        nameFr: 'Cheurfa',
        nameEn: 'Cheurfa',
        nameAr: 'الشرفة',
        displayOrder: 2,
      },
      {
        id: 'setif',
        code: 'setif',
        speciesId: 'cattle',
        nameFr: 'Sétifienne',
        nameEn: 'Setif',
        nameAr: 'السطايفية',
        displayOrder: 3,
      },
    ],
    skipDuplicates: true,
  });

  // ========== BREEDS - GOAT ==========
  console.log('Creating goat breeds...');
  await prisma.breed.createMany({
    data: [
      {
        id: 'arbia',
        code: 'arbia',
        speciesId: 'goat',
        nameFr: 'Arbia',
        nameEn: 'Arbia',
        nameAr: 'العربية',
        displayOrder: 1,
      },
      {
        id: 'kabyle',
        code: 'kabyle',
        speciesId: 'goat',
        nameFr: 'Kabyle',
        nameEn: 'Kabyle',
        nameAr: 'القبائلية',
        displayOrder: 2,
      },
      {
        id: 'makatia',
        code: 'makatia',
        speciesId: 'goat',
        nameFr: "M'katia",
        nameEn: 'Makatia',
        nameAr: 'المكاطية',
        displayOrder: 3,
      },
    ],
    skipDuplicates: true,
  });

  // ========== TEST FARM ==========
  console.log('Creating test farm...');
  await prisma.farm.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440000' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Ferme Test',
      location: 'Alger',
      ownerId: 'dev-user-001',
      isDefault: true,
    },
  });

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
