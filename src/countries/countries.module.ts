import { Module } from '@nestjs/common';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Countries module
 * PHASE_04: ISO 3166-1 countries reference data management
 */
@Module({
  imports: [PrismaModule],
  controllers: [CountriesController],
  providers: [CountriesService],
  exports: [CountriesService],
})
export class CountriesModule {}
