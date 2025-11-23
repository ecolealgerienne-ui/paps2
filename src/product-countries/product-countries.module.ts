import { Module } from '@nestjs/common';
import { ProductCountriesController } from './product-countries.controller';
import { ProductCountriesService } from './product-countries.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductCountriesController],
  providers: [ProductCountriesService],
  exports: [ProductCountriesService],
})
export class ProductCountriesModule {}
