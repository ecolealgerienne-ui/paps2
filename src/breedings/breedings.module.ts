import { Module } from '@nestjs/common';
import { BreedingsController } from './breedings.controller';
import { BreedingsService } from './breedings.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BreedingsController],
  providers: [BreedingsService],
  exports: [BreedingsService],
})
export class BreedingsModule {}
