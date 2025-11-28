import { Module } from '@nestjs/common';
import { AgeCategoriesService } from './age-categories.service';
import { AgeCategoriesController } from './age-categories.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AgeCategoriesController],
  providers: [AgeCategoriesService],
  exports: [AgeCategoriesService],
})
export class AgeCategoriesModule {}
