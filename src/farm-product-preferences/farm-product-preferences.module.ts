import { Module } from '@nestjs/common';
import { FarmProductPreferencesController } from './farm-product-preferences.controller';
import { FarmProductPreferencesService } from './farm-product-preferences.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FarmProductPreferencesController],
  providers: [FarmProductPreferencesService],
  exports: [FarmProductPreferencesService],
})
export class FarmProductPreferencesModule {}
