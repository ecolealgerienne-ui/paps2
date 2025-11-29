import { Module } from '@nestjs/common';
import { AnimalStatusController } from './animal-status.controller';
import { AnimalStatusService } from './animal-status.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnimalStatusController],
  providers: [AnimalStatusService],
  exports: [AnimalStatusService],
})
export class AnimalStatusModule {}
