/**
 * Script de génération de données de test pour le système d'alertes
 * Usage: npx ts-node scripts/seed-farm-alerts-test-data.ts <farmId>
 */

import { PrismaClient, AlertCategory, AlertPriority } from '@prisma/client';

const prisma = new PrismaClient();

// Codes d'alertes supportés
const ALERT_TEMPLATES: Array<{
  code: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  category: AlertCategory;
  priority: AlertPriority;
}> = [
  {
    code: 'vaccination_due',
    nameFr: 'Vaccination à planifier',
    nameEn: 'Vaccination Due',
    nameAr: 'التطعيم المستحق',
    category: AlertCategory.vaccination,
    priority: AlertPriority.high,
  },
  {
    code: 'campaign_vaccination_due',
    nameFr: 'Campagne de vaccination',
    nameEn: 'Campaign Vaccination Due',
    nameAr: 'حملة التطعيم',
    category: AlertCategory.vaccination,
    priority: AlertPriority.high,
  },
  {
    code: 'treatment_due',
    nameFr: 'Traitement à administrer',
    nameEn: 'Treatment Due',
    nameAr: 'العلاج المستحق',
    category: AlertCategory.treatment,
    priority: AlertPriority.high,
  },
  {
    code: 'withdrawal_ending',
    nameFr: 'Fin de délai d\'attente',
    nameEn: 'Withdrawal Period Ending',
    nameAr: 'انتهاء فترة الانتظار',
    category: AlertCategory.treatment,
    priority: AlertPriority.medium,
  },
  {
    code: 'weight_stagnation',
    nameFr: 'Stagnation de poids',
    nameEn: 'Weight Stagnation',
    nameAr: 'ركود الوزن',
    category: AlertCategory.nutrition,
    priority: AlertPriority.medium,
  },
  {
    code: 'birth_imminent',
    nameFr: 'Mise-bas imminente',
    nameEn: 'Birth Imminent',
    nameAr: 'الولادة وشيكة',
    category: AlertCategory.reproduction,
    priority: AlertPriority.high,
  },
  {
    code: 'heat_expected',
    nameFr: 'Chaleurs attendues',
    nameEn: 'Heat Expected',
    nameAr: 'الحرارة المتوقعة',
    category: AlertCategory.reproduction,
    priority: AlertPriority.medium,
  },
  {
    code: 'health_check_due',
    nameFr: 'Contrôle sanitaire à faire',
    nameEn: 'Health Check Due',
    nameAr: 'الفحص الصحي المستحق',
    category: AlertCategory.health,
    priority: AlertPriority.medium,
  },
  {
    code: 'identification_missing',
    nameFr: 'Identification manquante',
    nameEn: 'Identification Missing',
    nameAr: 'التعريف مفقود',
    category: AlertCategory.administrative,
    priority: AlertPriority.high,
  },
  {
    code: 'document_expired',
    nameFr: 'Document expiré',
    nameEn: 'Document Expired',
    nameAr: 'وثيقة منتهية الصلاحية',
    category: AlertCategory.administrative,
    priority: AlertPriority.medium,
  },
];

async function seedAlertTemplates() {
  console.log('📋 Création des templates d\'alertes...');

  for (const template of ALERT_TEMPLATES) {
    await prisma.alertTemplate.upsert({
      where: { code: template.code },
      update: { isActive: true, deletedAt: null },
      create: {
        ...template,
        isActive: true,
      },
    });
  }

  console.log(`✅ ${ALERT_TEMPLATES.length} templates créés/mis à jour`);
}

async function seedFarmPreferences(farmId: string) {
  console.log(`🔧 Création des préférences pour la ferme ${farmId}...`);

  const templates = await prisma.alertTemplate.findMany({
    where: { isActive: true, deletedAt: null },
  });

  let created = 0;
  for (const template of templates) {
    const existing = await prisma.farmAlertTemplatePreference.findFirst({
      where: { farmId, alertTemplateId: template.id, deletedAt: null },
    });

    if (!existing) {
      await prisma.farmAlertTemplatePreference.create({
        data: {
          farmId,
          alertTemplateId: template.id,
          reminderDays: template.priority === AlertPriority.high ? 7 : 3,
          isActive: true,
        },
      });
      created++;
    }
  }

  console.log(`✅ ${created} préférences créées`);
}

async function seedTestAlerts(farmId: string) {
  console.log(`🚨 Création d'alertes de test pour la ferme ${farmId}...`);

  const preferences = await prisma.farmAlertTemplatePreference.findMany({
    where: { farmId, isActive: true, deletedAt: null },
    include: { alertTemplate: true },
  });

  // Récupérer quelques animaux de la ferme
  const animals = await prisma.animal.findMany({
    where: { farmId, deletedAt: null },
    take: 10,
  });

  if (animals.length === 0) {
    console.log('⚠️ Aucun animal trouvé. Création d\'alertes sans animalId...');
  }

  const now = new Date();
  let created = 0;

  for (const pref of preferences) {
    // Créer 1-3 alertes par préférence
    const count = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < count; i++) {
      const animal = animals.length > 0
        ? animals[Math.floor(Math.random() * animals.length)]
        : null;

      const daysOffset = Math.floor(Math.random() * 14) - 7; // -7 à +7 jours
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + daysOffset);

      const uniqueKey = `${pref.alertTemplate.code}:test:${Date.now()}:${i}`;

      await prisma.farmAlert.create({
        data: {
          farmId,
          alertTemplateId: pref.alertTemplateId,
          alertPreferenceId: pref.id,
          animalId: animal?.id || null,
          dueDate,
          status: 'pending',
          metadata: {
            uniqueKey,
            testData: true,
            createdBy: 'seed-script',
          },
        },
      });
      created++;
    }
  }

  console.log(`✅ ${created} alertes de test créées`);
}

async function showSummary(farmId: string) {
  const summary = await prisma.farmAlert.groupBy({
    by: ['status'],
    where: { farmId, deletedAt: null },
    _count: true,
  });

  console.log('\n📊 Résumé des alertes:');
  for (const item of summary) {
    console.log(`   ${item.status}: ${item._count}`);
  }

  const byCategory = await prisma.farmAlert.findMany({
    where: { farmId, deletedAt: null },
    include: { alertTemplate: { select: { category: true } } },
  });

  const categories: Record<string, number> = {};
  for (const alert of byCategory) {
    const cat = alert.alertTemplate?.category || 'unknown';
    categories[cat] = (categories[cat] || 0) + 1;
  }

  console.log('\n📁 Par catégorie:');
  for (const [cat, count] of Object.entries(categories)) {
    console.log(`   ${cat}: ${count}`);
  }
}

async function main() {
  const farmId = process.argv[2];

  if (!farmId) {
    console.error('❌ Usage: npx ts-node scripts/seed-farm-alerts-test-data.ts <farmId>');
    console.error('   Exemple: npx ts-node scripts/seed-farm-alerts-test-data.ts farm-123');
    process.exit(1);
  }

  // Vérifier que la ferme existe
  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  if (!farm) {
    console.error(`❌ Ferme ${farmId} non trouvée`);
    process.exit(1);
  }

  console.log(`\n🌾 Ferme: ${farm.name || farmId}\n`);

  try {
    await seedAlertTemplates();
    await seedFarmPreferences(farmId);
    await seedTestAlerts(farmId);
    await showSummary(farmId);

    console.log('\n✨ Données de test créées avec succès!');
    console.log('\nVous pouvez maintenant:');
    console.log(`  GET /api/v1/farms/${farmId}/alerts`);
    console.log(`  GET /api/v1/farms/${farmId}/alerts/summary`);
    console.log(`  GET /api/v1/farms/${farmId}/alerts/unread-count`);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
