import { Module } from '@nestjs/common';
import { MedicalProductsController } from './medical-products.controller';
import { MedicalProductsService } from './medical-products.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MedicalProductsController],
  providers: [MedicalProductsService],
  exports: [MedicalProductsService],
})
export class MedicalProductsModule {}
