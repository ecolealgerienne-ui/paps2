import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AlertTemplatesController } from './alert-templates.controller';
import { AlertTemplatesService } from './alert-templates.service';

@Module({
  imports: [PrismaModule],
  controllers: [AlertTemplatesController],
  providers: [AlertTemplatesService],
  exports: [AlertTemplatesService],
})
export class AlertTemplatesModule {}
