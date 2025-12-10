// src/farm-alerts/farm-alerts.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FarmAlertsController } from './farm-alerts.controller';
import { FarmAlertsService } from './farm-alerts.service';

@Module({
  imports: [PrismaModule],
  controllers: [FarmAlertsController],
  providers: [FarmAlertsService],
  exports: [FarmAlertsService],
})
export class FarmAlertsModule {}
