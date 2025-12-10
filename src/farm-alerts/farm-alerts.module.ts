// src/farm-alerts/farm-alerts.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FarmAlertsController } from './farm-alerts.controller';
import { FarmAlertsService } from './farm-alerts.service';
import { AlertEngineModule } from './alert-engine/alert-engine.module';

@Module({
  imports: [PrismaModule, AlertEngineModule],
  controllers: [FarmAlertsController],
  providers: [FarmAlertsService],
  exports: [FarmAlertsService, AlertEngineModule],
})
export class FarmAlertsModule {}
