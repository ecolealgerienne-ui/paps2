import { Module } from '@nestjs/common';
import { FarmVeterinarianPreferencesService } from './farm-veterinarian-preferences.service';
import { FarmVeterinarianPreferencesController } from './farm-veterinarian-preferences.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FarmVeterinarianPreferencesController],
  providers: [FarmVeterinarianPreferencesService],
  exports: [FarmVeterinarianPreferencesService],
})
export class FarmVeterinarianPreferencesModule {}
