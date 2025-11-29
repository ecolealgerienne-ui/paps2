import { Module } from '@nestjs/common';
import { TreatmentAlertsController } from './treatment-alerts.controller';
import { TreatmentAlertsService } from './treatment-alerts.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TreatmentAlertsController],
  providers: [TreatmentAlertsService],
  exports: [TreatmentAlertsService],
})
export class TreatmentAlertsModule {}
