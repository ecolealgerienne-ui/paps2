import { Module } from '@nestjs/common';
import { VeterinariansController } from './veterinarians.controller';
import { VeterinariansService } from './veterinarians.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [VeterinariansController],
  providers: [VeterinariansService],
  exports: [VeterinariansService],
})
export class VeterinariansModule {}
