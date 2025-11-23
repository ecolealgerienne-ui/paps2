import { Module } from '@nestjs/common';
import { NationalCampaignsController } from './national-campaigns.controller';
import { NationalCampaignsService } from './national-campaigns.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NationalCampaignsController],
  providers: [NationalCampaignsService],
  exports: [NationalCampaignsService],
})
export class NationalCampaignsModule {}
