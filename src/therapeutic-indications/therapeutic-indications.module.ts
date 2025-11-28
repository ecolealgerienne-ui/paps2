import { Module } from '@nestjs/common';
import { TherapeuticIndicationsController } from './therapeutic-indications.controller';
import { TherapeuticIndicationsService } from './therapeutic-indications.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TherapeuticIndicationsController],
  providers: [TherapeuticIndicationsService],
  exports: [TherapeuticIndicationsService],
})
export class TherapeuticIndicationsModule {}
