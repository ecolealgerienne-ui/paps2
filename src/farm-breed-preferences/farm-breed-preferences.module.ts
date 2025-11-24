import { Module } from '@nestjs/common';
import { FarmBreedPreferencesController } from './farm-breed-preferences.controller';
import { FarmBreedPreferencesService } from './farm-breed-preferences.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Module for managing Farm-Breed preferences
 * PHASE_20: FarmBreedPreferences
 */
@Module({
  controllers: [FarmBreedPreferencesController],
  providers: [FarmBreedPreferencesService, PrismaService],
  exports: [FarmBreedPreferencesService],
})
export class FarmBreedPreferencesModule {}
