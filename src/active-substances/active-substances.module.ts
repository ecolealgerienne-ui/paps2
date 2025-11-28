import { Module } from '@nestjs/common';
import { ActiveSubstancesService } from './active-substances.service';
import { ActiveSubstancesController } from './active-substances.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActiveSubstancesController],
  providers: [ActiveSubstancesService],
  exports: [ActiveSubstancesService],
})
export class ActiveSubstancesModule {}
