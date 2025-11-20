import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { PayloadNormalizerService } from './payload-normalizer.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SyncController],
  providers: [SyncService, PayloadNormalizerService],
  exports: [SyncService],
})
export class SyncModule {}
