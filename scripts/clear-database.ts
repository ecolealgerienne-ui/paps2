#!/usr/bin/env ts-node

/**
 * Script pour vider complètement la base de données
 *
 * ATTENTION: Ce script supprime TOUTES les données de TOUTES les tables !
 * Utilisez-le uniquement en développement.
 *
 * Usage:
 *   npm run clear-db
 *   ou
 *   ts-node scripts/clear-database.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  SUPPRESSION DE TOUTES LES DONNÉES DE LA BASE DE DONNÉES');
  console.log('================================================\n');

  try {
    // Confirmer l'environnement (sécurité)
    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl.includes('production') || dbUrl.includes('prod')) {
      console.error('❌ ERREUR: Ce script ne peut pas être exécuté en production!');
      process.exit(1);
    }

    console.log('⚠️  ATTENTION: Cette opération est IRRÉVERSIBLE!\n');

    // Liste de toutes les tables dans l'ordre de suppression (respects foreign keys)
    // On commence par les tables de liaison et les dépendances, puis les tables principales
    const tablesToClear = [
      // Tables de liaison et préférences (PHASES 16-24)
      { name: 'farm_national_campaign_preferences', label: 'Farm National Campaign Preferences' },
      { name: 'farm_veterinarian_preferences', label: 'Farm Veterinarian Preferences' },
      { name: 'farm_vaccine_preferences', label: 'Farm Vaccine Preferences' },
      { name: 'farm_product_preferences', label: 'Farm Product Preferences' },
      { name: 'farm_breed_preferences', label: 'Farm Breed Preferences' },
      { name: 'campaign_countries', label: 'Campaign Countries' },
      { name: 'vaccine_countries', label: 'Vaccine Countries' },
      { name: 'product_countries', label: 'Product Countries' },
      { name: 'breed_countries', label: 'Breed Countries' },

      // Tables dépendantes des fermes
      { name: 'sync_queues', label: 'Sync Queues' },
      { name: 'weights', label: 'Weights' },
      { name: 'documents', label: 'Documents' },
      { name: 'personal_campaigns', label: 'Personal Campaigns' },
      { name: 'breedings', label: 'Breedings' },
      { name: 'vaccinations', label: 'Vaccinations' },
      { name: 'treatments', label: 'Treatments' },
      { name: 'movement_animals', label: 'Movement Animals' },
      { name: 'movements', label: 'Movements' },
      { name: 'lot_animals', label: 'Lot Animals' },
      { name: 'lots', label: 'Lots' },
      { name: 'animals', label: 'Animals' },
      { name: 'alert_configurations', label: 'Alert Configurations' },
      { name: 'farm_preferences', label: 'Farm Preferences' },
      { name: 'custom_vaccines', label: 'Custom Vaccines' },
      { name: 'custom_medical_products', label: 'Custom Medical Products' },

      // Tables de fermes et utilisateurs
      { name: 'farms', label: 'Farms' },
      { name: 'veterinarians', label: 'Veterinarians' },

      // Tables de référence globales
      { name: 'alert_templates', label: 'Alert Templates' },
      { name: 'national_campaigns', label: 'National Campaigns' },
      { name: 'vaccines_global', label: 'Global Vaccines' },
      { name: 'global_medical_products', label: 'Global Medical Products' },
      { name: 'breeds', label: 'Breeds' },
      { name: 'species', label: 'Species' },
      { name: 'countries', label: 'Countries' },
      { name: 'administration_routes', label: 'Administration Routes' },
    ];

    let totalDeleted = 0;

    // Désactiver temporairement les triggers pour accélérer
    console.log('⏳ Désactivation des triggers...');
    await prisma.$executeRaw`SET session_replication_role = 'replica';`;

    // Supprimer les données de chaque table
    for (const table of tablesToClear) {
      try {
        const result = await prisma.$executeRawUnsafe(
          `DELETE FROM "${table.name}";`
        );
        const count = typeof result === 'number' ? result : 0;
        totalDeleted += count;
        console.log(`✅ ${table.label.padEnd(40)} - ${count} ligne(s) supprimée(s)`);
      } catch (error: any) {
        // Si la table n'existe pas, on continue
        if (error.code === '42P01') {
          console.log(`⚠️  ${table.label.padEnd(40)} - Table n'existe pas (ignorée)`);
        } else {
          console.error(`❌ ${table.label.padEnd(40)} - Erreur: ${error.message}`);
        }
      }
    }

    // Réactiver les triggers
    console.log('\n⏳ Réactivation des triggers...');
    await prisma.$executeRaw`SET session_replication_role = 'origin';`;

    // Reset les séquences des IDs auto-incrémentés (si nécessaire)
    console.log('🔄 Reset des séquences...');
    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE
        seq_name text;
      BEGIN
        FOR seq_name IN
          SELECT sequence_name FROM information_schema.sequences
          WHERE sequence_schema = 'public'
        LOOP
          EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RESTART WITH 1';
        END LOOP;
      END $$;
    `);

    console.log('\n================================================');
    console.log(`✅ TERMINÉ: ${totalDeleted} lignes supprimées au total`);
    console.log('🎉 La base de données est maintenant vide!\n');

  } catch (error) {
    console.error('\n❌ ERREUR lors de la suppression:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
