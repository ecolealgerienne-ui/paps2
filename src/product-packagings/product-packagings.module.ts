import { Module } from '@nestjs/common';
import { ProductPackagingsController } from './product-packagings.controller';
import { ProductPackagingsService } from './product-packagings.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductPackagingsController],
  providers: [ProductPackagingsService],
  exports: [ProductPackagingsService],
})
export class ProductPackagingsModule {}
