import { Module } from '@nestjs/common';
import { FarmNationalCampaignPreferencesService } from './farm-national-campaign-preferences.service';
import { FarmNationalCampaignPreferencesController } from './farm-national-campaign-preferences.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FarmNationalCampaignPreferencesController],
  providers: [FarmNationalCampaignPreferencesService, PrismaService],
})
export class FarmNationalCampaignPreferencesModule {}
