import { Module, forwardRef } from '@nestjs/common';
import { AnimalsController } from './animals.controller';
import { AnimalsService } from './animals.service';
import { TreatmentsModule } from '../treatments/treatments.module';
import { AlertEngineModule } from '../farm-alerts/alert-engine/alert-engine.module';

@Module({
  imports: [TreatmentsModule, forwardRef(() => AlertEngineModule)],
  controllers: [AnimalsController],
  providers: [AnimalsService],
  exports: [AnimalsService],
})
export class AnimalsModule {}
