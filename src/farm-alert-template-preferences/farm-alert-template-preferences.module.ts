import { Module } from '@nestjs/common';
import { FarmAlertTemplatePreferencesController } from './farm-alert-template-preferences.controller';
import { FarmAlertTemplatePreferencesService } from './farm-alert-template-preferences.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Module for managing Farm-AlertTemplate preferences
 * Allows farms to select and configure which alert templates they want to use
 */
@Module({
  controllers: [FarmAlertTemplatePreferencesController],
  providers: [FarmAlertTemplatePreferencesService, PrismaService],
  exports: [FarmAlertTemplatePreferencesService],
})
export class FarmAlertTemplatePreferencesModule {}
