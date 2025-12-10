// src/farm-alerts/alert-engine/generators/reproduction.generator.ts

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
 * Générateur d'alertes pour la reproduction
 * Gère: CALVING_SOON, HEAT_EXPECTED, PREGNANCY_CHECK
 */
@Injectable()
export class ReproductionAlertGenerator extends BaseAlertGenerator {
  readonly category = AlertCategory.reproduction;

  // Durée moyenne pour contrôle de gestation (jours après saillie)
  private readonly PREGNANCY_CHECK_DAYS = 45;

  constructor(prisma: PrismaService) {
    super(prisma, ReproductionAlertGenerator.name);
  }

  async generate(context: GenerationContext): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = [];
    const { farmId, today } = context;

    // Récupérer les préférences
    const calvingSoonPreference = this.findPreferenceByCode(
      context,
      ALERT_CODES.CALVING_SOON,
    );
    const pregnancyCheckPreference = this.findPreferenceByCode(
      context,
      ALERT_CODES.PREGNANCY_CHECK,
    );

    if (!calvingSoonPreference && !pregnancyCheckPreference) {
      this.logger.debug('No reproduction preferences active, skipping');
      return alerts;
    }

    const reminderDays = this.getReminderDays(
      calvingSoonPreference,
      DEFAULT_REMINDER_DAYS.REPRODUCTION,
    );

    // Récupérer les saillies en cours (status = confirmed ou in_progress)
    const activeBreedings = await this.prisma.breeding.findMany({
      where: {
        farmId,
        deletedAt: null,
        status: { in: ['confirmed', 'in_progress'] },
        mother: {
          status: 'alive',
          deletedAt: null,
        },
      },
      select: {
        id: true,
        motherId: true,
        breedingDate: true,
        expectedBirthDate: true,
        status: true,
        mother: {
          select: {
            id: true,
            currentEid: true,
            officialNumber: true,
            visualId: true,
          },
        },
      },
    });

    this.logger.debug(`Found ${activeBreedings.length} active breedings`);

    for (const breeding of activeBreedings) {
      const motherIdentifier = this.formatAnimalIdentifier(breeding.mother);

      // Cas 1: Mise-bas imminente (CALVING_SOON)
      if (calvingSoonPreference && breeding.expectedBirthDate) {
        const daysUntilBirth = this.daysBetween(today, breeding.expectedBirthDate);

        if (this.isInReminderWindow(breeding.expectedBirthDate, today, reminderDays)) {
          const uniqueKey = `${ALERT_CODES.CALVING_SOON}:breeding:${breeding.id}`;
          if (!this.alertExists(context, uniqueKey, ALERT_CODES.CALVING_SOON)) {
            alerts.push(
              this.createAlert(
                calvingSoonPreference.alertTemplate.id,
                ALERT_CODES.CALVING_SOON,
                uniqueKey,
                {
                  preferenceId: calvingSoonPreference.id,
                  animalId: breeding.motherId,
                  breedingId: breeding.id,
                  dueDate: breeding.expectedBirthDate,
                  metadata: {
                    expectedBirthDate: breeding.expectedBirthDate.toISOString(),
                    breedingDate: breeding.breedingDate.toISOString(),
                    daysUntilDue: daysUntilBirth,
                    motherIdentifier,
                  },
                },
              ),
            );
          }
        }
      }

      // Cas 2: Contrôle de gestation à faire (PREGNANCY_CHECK)
      if (
        pregnancyCheckPreference &&
        breeding.status === 'in_progress' // Pas encore confirmée
      ) {
        const checkDueDate = this.addDays(
          breeding.breedingDate,
          this.PREGNANCY_CHECK_DAYS,
        );
        const daysUntilCheck = this.daysBetween(today, checkDueDate);
        const checkReminderDays = this.getReminderDays(
          pregnancyCheckPreference,
          7,
        );

        if (this.isInReminderWindow(checkDueDate, today, checkReminderDays)) {
          const uniqueKey = `${ALERT_CODES.PREGNANCY_CHECK}:breeding:${breeding.id}`;
          if (!this.alertExists(context, uniqueKey, ALERT_CODES.PREGNANCY_CHECK)) {
            alerts.push(
              this.createAlert(
                pregnancyCheckPreference.alertTemplate.id,
                ALERT_CODES.PREGNANCY_CHECK,
                uniqueKey,
                {
                  preferenceId: pregnancyCheckPreference.id,
                  animalId: breeding.motherId,
                  breedingId: breeding.id,
                  dueDate: checkDueDate,
                  metadata: {
                    breedingDate: breeding.breedingDate.toISOString(),
                    checkDueDate: checkDueDate.toISOString(),
                    daysUntilDue: daysUntilCheck,
                    motherIdentifier,
                  },
                },
              ),
            );
          }
        }
      }
    }

    this.logger.debug(`Generated ${alerts.length} reproduction alerts`);
    return alerts;
  }
}
