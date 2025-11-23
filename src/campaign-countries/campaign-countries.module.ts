import { Module } from '@nestjs/common';
import { CampaignCountriesController } from './campaign-countries.controller';
import { CampaignCountriesService } from './campaign-countries.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Module for managing NationalCampaign-Country associations
 * PHASE_19: CampaignCountries
 */
@Module({
  controllers: [CampaignCountriesController],
  providers: [CampaignCountriesService, PrismaService],
  exports: [CampaignCountriesService],
})
export class CampaignCountriesModule {}
