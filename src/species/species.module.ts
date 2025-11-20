import { Module } from '@nestjs/common';
import { SpeciesController } from './species.controller';
import { SpeciesService } from './species.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SpeciesController],
  providers: [SpeciesService],
  exports: [SpeciesService],
})
export class SpeciesModule {}
