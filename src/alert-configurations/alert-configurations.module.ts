import { Module } from '@nestjs/common';
import { AlertConfigurationsController } from './alert-configurations.controller';
import { AlertConfigurationsService } from './alert-configurations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AlertConfigurationsController],
  providers: [AlertConfigurationsService],
  exports: [AlertConfigurationsService],
})
export class AlertConfigurationsModule {}
