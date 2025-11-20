import { Module } from '@nestjs/common';
import { VaccinesController } from './vaccines.controller';
import { VaccinesService } from './vaccines.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [VaccinesController],
  providers: [VaccinesService],
  exports: [VaccinesService],
})
export class VaccinesModule {}
