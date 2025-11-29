import { Module } from '@nestjs/common';
import { FarmerProductLotsController } from './farmer-product-lots.controller';
import { FarmerProductLotsService } from './farmer-product-lots.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FarmerProductLotsController],
  providers: [FarmerProductLotsService],
  exports: [FarmerProductLotsService],
})
export class FarmerProductLotsModule {}
