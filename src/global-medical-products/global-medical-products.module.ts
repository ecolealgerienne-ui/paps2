import { Module } from '@nestjs/common';
import { GlobalMedicalProductsController } from './global-medical-products.controller';
import { GlobalMedicalProductsService } from './global-medical-products.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GlobalMedicalProductsController],
  providers: [GlobalMedicalProductsService],
  exports: [GlobalMedicalProductsService],
})
export class GlobalMedicalProductsModule {}
