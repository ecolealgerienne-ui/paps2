// src/farm-alerts/alert-engine/generators/treatment.generator.ts

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
 * Générateur d'alertes pour les traitements
 * Gère: TREATMENT_ENDING, WITHDRAWAL_ACTIVE, WITHDRAWAL_ENDING
 */
@Injectable()
export class TreatmentAlertGenerator extends BaseAlertGenerator {
  readonly category = AlertCategory.treatment;

  constructor(prisma: PrismaService) {
    super(prisma, TreatmentAlertGenerator.name);
  }

  async generate(context: GenerationContext): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = [];
    const { farmId, today } = context;

    // Récupérer les préférences
    const withdrawalActivePreference = this.findPreferenceByCode(
      context,
      ALERT_CODES.WITHDRAWAL_ACTIVE,
    );
    const withdrawalEndingPreference = this.findPreferenceByCode(
      context,
      ALERT_CODES.WITHDRAWAL_ENDING,
    );

    if (!withdrawalActivePreference && !withdrawalEndingPreference) {
      this.logger.debug('No treatment preferences active, skipping');
      return alerts;
    }

    const reminderDays = this.getReminderDays(
      withdrawalEndingPreference,
      DEFAULT_REMINDER_DAYS.TREATMENT,
    );

    // Récupérer les traitements avec délai d'attente actif
    const treatmentsWithWithdrawal = await this.prisma.treatment.findMany({
      where: {
        farmId,
        type: 'treatment',
        deletedAt: null,
        OR: [
          { withdrawalEndDate: { gte: today } },
          { computedWithdrawalMeatDate: { gte: today } },
          { computedWithdrawalMilkDate: { gte: today } },
        ],
        animal: {
          status: 'alive',
          deletedAt: null,
        },
      },
      select: {
        id: true,
        animalId: true,
        productName: true,
        withdrawalEndDate: true,
        computedWithdrawalMeatDate: true,
        computedWithdrawalMilkDate: true,
        treatmentDate: true,
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

    this.logger.debug(
      `Found ${treatmentsWithWithdrawal.length} treatments with active withdrawal`,
    );

    for (const treatment of treatmentsWithWithdrawal) {
      const productName =
        treatment.product?.nameFr || treatment.productName || 'Traitement';
      const animalIdentifier = this.formatAnimalIdentifier(treatment.animal);

      // Déterminer la date de fin de délai d'attente la plus tardive
      const withdrawalDates = [
        treatment.withdrawalEndDate,
        treatment.computedWithdrawalMeatDate,
        treatment.computedWithdrawalMilkDate,
      ].filter((d): d is Date => d !== null);

      if (withdrawalDates.length === 0) continue;

      const latestWithdrawalDate = new Date(
        Math.max(...withdrawalDates.map((d) => d.getTime())),
      );
      const daysUntilEnd = this.daysBetween(today, latestWithdrawalDate);

      const uniqueKey = `${ALERT_CODES.WITHDRAWAL_ACTIVE}:treatment:${treatment.id}`;

      // Cas 1: Délai d'attente actif (WITHDRAWAL_ACTIVE)
      if (daysUntilEnd > reminderDays && withdrawalActivePreference) {
        if (!this.alertExists(context, uniqueKey, ALERT_CODES.WITHDRAWAL_ACTIVE)) {
          alerts.push(
            this.createAlert(
              withdrawalActivePreference.alertTemplate.id,
              ALERT_CODES.WITHDRAWAL_ACTIVE,
              uniqueKey,
              {
                preferenceId: withdrawalActivePreference.id,
                animalId: treatment.animalId,
                treatmentId: treatment.id,
                dueDate: latestWithdrawalDate,
                metadata: {
                  treatmentName: productName,
                  productName,
                  daysUntilEnd,
                  withdrawalEndDate: latestWithdrawalDate.toISOString(),
                  treatmentDate: treatment.treatmentDate.toISOString(),
                  animalIdentifier,
                },
              },
            ),
          );
        }
      }
      // Cas 2: Délai d'attente se termine bientôt (WITHDRAWAL_ENDING)
      else if (
        daysUntilEnd >= 0 &&
        daysUntilEnd <= reminderDays &&
        withdrawalEndingPreference
      ) {
        const endingUniqueKey = `${ALERT_CODES.WITHDRAWAL_ENDING}:treatment:${treatment.id}`;
        if (
          !this.alertExists(context, endingUniqueKey, ALERT_CODES.WITHDRAWAL_ENDING)
        ) {
          alerts.push(
            this.createAlert(
              withdrawalEndingPreference.alertTemplate.id,
              ALERT_CODES.WITHDRAWAL_ENDING,
              endingUniqueKey,
              {
                preferenceId: withdrawalEndingPreference.id,
                animalId: treatment.animalId,
                treatmentId: treatment.id,
                dueDate: latestWithdrawalDate,
                metadata: {
                  treatmentName: productName,
                  productName,
                  daysUntilEnd,
                  withdrawalEndDate: latestWithdrawalDate.toISOString(),
                  animalIdentifier,
                },
              },
            ),
          );
        }
      }
    }

    this.logger.debug(`Generated ${alerts.length} treatment alerts`);
    return alerts;
  }
}
