import { Module, forwardRef } from '@nestjs/common';
import { TreatmentsController } from './treatments.controller';
import { TreatmentsService } from './treatments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AlertEngineModule } from '../farm-alerts/alert-engine/alert-engine.module';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => AlertEngineModule)],
  controllers: [TreatmentsController],
  providers: [TreatmentsService],
  exports: [TreatmentsService],
})
export class TreatmentsModule {}
