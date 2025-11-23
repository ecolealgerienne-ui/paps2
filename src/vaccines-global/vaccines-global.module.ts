import { Module } from '@nestjs/common';
import { VaccinesGlobalController } from './vaccines-global.controller';
import { VaccinesGlobalService } from './vaccines-global.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Module pour la gestion des vaccins globaux
 * PHASE_06: Référentiel international des vaccins
 */
@Module({
  imports: [PrismaModule],
  controllers: [VaccinesGlobalController],
  providers: [VaccinesGlobalService],
  exports: [VaccinesGlobalService],
})
export class VaccinesGlobalModule {}
