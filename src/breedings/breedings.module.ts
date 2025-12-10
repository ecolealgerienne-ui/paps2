import { Module, forwardRef } from '@nestjs/common';
import { BreedingsController } from './breedings.controller';
import { BreedingsService } from './breedings.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AlertEngineModule } from '../farm-alerts/alert-engine/alert-engine.module';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => AlertEngineModule)],
  controllers: [BreedingsController],
  providers: [BreedingsService],
  exports: [BreedingsService],
})
export class BreedingsModule {}
