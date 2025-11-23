import { Module } from '@nestjs/common';
import { BreedCountriesController } from './breed-countries.controller';
import { BreedCountriesService } from './breed-countries.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Module for managing Breed-Country associations
 * PHASE_16: BreedCountries
 */
@Module({
  controllers: [BreedCountriesController],
  providers: [BreedCountriesService, PrismaService],
  exports: [BreedCountriesService],
})
export class BreedCountriesModule {}
