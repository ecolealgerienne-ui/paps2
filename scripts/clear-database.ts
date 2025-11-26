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

import * as path from 'path';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load .env from project root (one level up from scripts folder)
const envPath = path.resolve(__dirname, '..', '.env');
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  console.warn(`⚠️  Warning: Could not load .env from ${envPath}`);
  console.warn(`   Error: ${envResult.error.message}`);
  console.warn(`   Make sure .env exists at project root or set DATABASE_URL environment variable`);
}

// Validate DATABASE_URL before instantiating Prisma
if (!process.env.DATABASE_URL) {
  console.error('❌ ERREUR: DATABASE_URL non définie!');
  console.error(`   .env path tried: ${envPath}`);
  console.error('   Solutions:');
  console.error('   1. Créer un fichier .env à la racine du projet avec DATABASE_URL');
  console.error('   2. Définir DATABASE_URL dans votre environnement');
  console.error('   Example: DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"');
  process.exit(1);
}

// Instantiate Prisma client AFTER dotenv has loaded
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  SUPPRESSION DE TOUTES LES DONNÉES DE LA BASE DE DONNÉES');
  console.log('================================================');
  console.log(`📍 .env loaded from: ${envPath}`);
  console.log(`🔗 DATABASE_URL: ${process.env.DATABASE_URL?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`); // Hide credentials

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
    // Updated for Master Table Pattern (unified Vaccine, MedicalProduct, Veterinarian tables)
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

      // Tables de fermes et utilisateurs
      { name: 'farms', label: 'Farms' },

      // Master Table Pattern: Unified tables with scope (global/local)
      // Must be cleared after farm_*_preferences due to foreign keys
      { name: 'vaccines', label: 'Vaccines (unified global + local)' },
      { name: 'medical_products', label: 'Medical Products (unified global + local)' },
      { name: 'veterinarians', label: 'Veterinarians (unified global + local)' },

      // Tables de référence globales
      { name: 'alert_templates', label: 'Alert Templates' },
      { name: 'national_campaigns', label: 'National Campaigns' },
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
    // SECURITY NOTE: Table names come from hardcoded list above, NOT from user input.
    // This is a dev-only script protected by the production check at the start.
    for (const table of tablesToClear) {
      try {
        // Using $executeRawUnsafe because Prisma doesn't support dynamic table names
        // in tagged template literals. This is safe because:
        // 1. Table names are from our hardcoded whitelist above
        // 2. Script is protected by production environment check
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
    // SECURITY NOTE: This is a static SQL block with no user input.
    // The PL/pgSQL iterates over system catalog data, not external input.
    console.log('🔄 Reset des séquences...');
    await prisma.$executeRaw`
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
    `;

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
