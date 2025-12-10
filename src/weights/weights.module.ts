import { Module, forwardRef } from '@nestjs/common';
import { WeightsController } from './weights.controller';
import { WeightsService } from './weights.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AlertEngineModule } from '../farm-alerts/alert-engine/alert-engine.module';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => AlertEngineModule)],
  controllers: [WeightsController],
  providers: [WeightsService],
  exports: [WeightsService],
})
export class WeightsModule {}
