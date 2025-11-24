import { Module } from '@nestjs/common';
import { VaccineCountriesService } from './vaccine-countries.service';
import { VaccineCountriesController } from './vaccine-countries.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VaccineCountriesController],
  providers: [VaccineCountriesService, PrismaService],
})
export class VaccineCountriesModule {}
