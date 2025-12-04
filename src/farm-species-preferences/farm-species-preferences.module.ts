import { Module } from '@nestjs/common';
import { FarmSpeciesPreferencesController } from './farm-species-preferences.controller';
import { FarmSpeciesPreferencesService } from './farm-species-preferences.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FarmSpeciesPreferencesController],
  providers: [FarmSpeciesPreferencesService, PrismaService],
  exports: [FarmSpeciesPreferencesService],
})
export class FarmSpeciesPreferencesModule {}
