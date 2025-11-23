import { Module } from '@nestjs/common';
import { FarmVaccinePreferencesService } from './farm-vaccine-preferences.service';
import { FarmVaccinePreferencesController } from './farm-vaccine-preferences.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FarmVaccinePreferencesController],
  providers: [FarmVaccinePreferencesService, PrismaService],
})
export class FarmVaccinePreferencesModule {}
