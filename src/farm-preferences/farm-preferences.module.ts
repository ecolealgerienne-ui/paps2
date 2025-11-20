import { Module } from '@nestjs/common';
import { FarmPreferencesController } from './farm-preferences.controller';
import { FarmPreferencesService } from './farm-preferences.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FarmPreferencesController],
  providers: [FarmPreferencesService],
  exports: [FarmPreferencesService],
})
export class FarmPreferencesModule {}
