import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PersonalCampaignsController } from './personal-campaigns.controller';
import { PersonalCampaignsService } from './personal-campaigns.service';

@Module({
  imports: [PrismaModule],
  controllers: [PersonalCampaignsController],
  providers: [PersonalCampaignsService],
  exports: [PersonalCampaignsService],
})
export class PersonalCampaignsModule {}
