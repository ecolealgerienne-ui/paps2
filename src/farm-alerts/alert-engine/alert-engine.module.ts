// src/farm-alerts/alert-engine/alert-engine.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AlertEngineService } from './alert-engine.service';
import {
  VaccinationAlertGenerator,
  TreatmentAlertGenerator,
  NutritionAlertGenerator,
  ReproductionAlertGenerator,
  HealthAlertGenerator,
  AdministrativeAlertGenerator,
} from './generators';

@Module({
  imports: [PrismaModule],
  providers: [
    AlertEngineService,
    VaccinationAlertGenerator,
    TreatmentAlertGenerator,
    NutritionAlertGenerator,
    ReproductionAlertGenerator,
    HealthAlertGenerator,
    AdministrativeAlertGenerator,
  ],
  exports: [AlertEngineService],
})
export class AlertEngineModule {}
