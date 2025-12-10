// src/farm-alerts/alert-engine/generators/vaccination.generator.ts

import { Injectable } from '@nestjs/common';
import { AlertCategory } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseAlertGenerator } from './base.generator';
import {
  GeneratedAlert,
  GenerationContext,
  ALERT_CODES,
  DEFAULT_REMINDER_DAYS,
} from '../generator.interface';

/**
 * Générateur d'alertes pour les vaccinations
 * Gère: VACC_DUE, VACC_OVERDUE, VACC_ANNUAL_DUE
 */
@Injectable()
export class VaccinationAlertGenerator extends BaseAlertGenerator {
  readonly category = AlertCategory.vaccination;

  constructor(prisma: PrismaService) {
    super(prisma, VaccinationAlertGenerator.name);
  }

  async generate(context: GenerationContext): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = [];
    const { farmId, today } = context;

    // Récupérer les préférences pour cette catégorie
    const vaccDuePreference = this.findPreferenceByCode(context, ALERT_CODES.VACC_DUE);
    const vaccOverduePreference = this.findPreferenceByCode(context, ALERT_CODES.VACC_OVERDUE);

    // Si aucune préférence n'est active, pas d'alertes
    if (!vaccDuePreference && !vaccOverduePreference) {
      this.logger.debug('No vaccination preferences active, skipping');
      return alerts;
    }

    const reminderDays = this.getReminderDays(
      vaccDuePreference,
      DEFAULT_REMINDER_DAYS.VACCINATION,
    );

    // Récupérer les vaccinations avec nextDueDate non null
    const upcomingVaccinations = await this.prisma.treatment.findMany({
      where: {
        farmId,
        type: 'vaccination',
        nextDueDate: { not: null },
        deletedAt: null,
        animal: {
          status: 'alive',
          deletedAt: null,
        },
      },
      select: {
        id: true,
        animalId: true,
        nextDueDate: true,
        productName: true,
        targetDisease: true,
        animal: {
          select: {
            id: true,
            currentEid: true,
            officialNumber: true,
            visualId: true,
          },
        },
        product: {
          select: {
            nameFr: true,
          },
        },
      },
    });

    this.logger.debug(`Found ${upcomingVaccinations.length} vaccinations with next due date`);

    for (const vaccination of upcomingVaccinations) {
      const dueDate = vaccination.nextDueDate!;
      const daysUntilDue = this.daysBetween(today, dueDate);
      const vaccineName =
        vaccination.product?.nameFr ||
        vaccination.productName ||
        vaccination.targetDisease ||
        'Vaccination';

      const animalIdentifier = this.formatAnimalIdentifier(vaccination.animal);
      const uniqueKey = `${ALERT_CODES.VACC_DUE}:treatment:${vaccination.id}`;

      // Cas 1: Vaccination en retard (VACC_OVERDUE)
      if (this.isOverdue(dueDate, today) && vaccOverduePreference) {
        if (!this.alertExists(context, uniqueKey, ALERT_CODES.VACC_OVERDUE)) {
          alerts.push(
            this.createAlert(
              vaccOverduePreference.alertTemplate.id,
              ALERT_CODES.VACC_OVERDUE,
              uniqueKey,
              {
                preferenceId: vaccOverduePreference.id,
                animalId: vaccination.animalId,
                treatmentId: vaccination.id,
                dueDate,
                metadata: {
                  vaccineName,
                  lastVaccinationDate: null, // Sera enrichi si besoin
                  daysOverdue: Math.abs(daysUntilDue),
                  daysUntilDue: daysUntilDue,
                  animalIdentifier,
                },
              },
            ),
          );
        }
      }
      // Cas 2: Vaccination à venir dans la fenêtre de rappel (VACC_DUE)
      else if (
        this.isInReminderWindow(dueDate, today, reminderDays) &&
        vaccDuePreference
      ) {
        if (!this.alertExists(context, uniqueKey, ALERT_CODES.VACC_DUE)) {
          alerts.push(
            this.createAlert(
              vaccDuePreference.alertTemplate.id,
              ALERT_CODES.VACC_DUE,
              uniqueKey,
              {
                preferenceId: vaccDuePreference.id,
                animalId: vaccination.animalId,
                treatmentId: vaccination.id,
                dueDate,
                metadata: {
                  vaccineName,
                  daysUntilDue,
                  animalIdentifier,
                },
              },
            ),
          );
        }
      }
    }

    this.logger.debug(`Generated ${alerts.length} vaccination alerts`);
    return alerts;
  }
}
