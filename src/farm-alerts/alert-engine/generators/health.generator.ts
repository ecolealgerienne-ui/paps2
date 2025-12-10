// src/farm-alerts/alert-engine/generators/health.generator.ts

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
 * Générateur d'alertes pour la santé
 * Gère: HEALTH_CHECK_DUE, QUARANTINE_ENDING
 */
@Injectable()
export class HealthAlertGenerator extends BaseAlertGenerator {
  readonly category = AlertCategory.health;

  // Intervalle de contrôle sanitaire par défaut (jours)
  private readonly DEFAULT_HEALTH_CHECK_INTERVAL = 180; // 6 mois

  constructor(prisma: PrismaService) {
    super(prisma, HealthAlertGenerator.name);
  }

  async generate(context: GenerationContext): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = [];
    const { farmId, today } = context;

    // Récupérer les préférences
    const healthCheckPreference = this.findPreferenceByCode(
      context,
      ALERT_CODES.HEALTH_CHECK_DUE,
    );
    const quarantineEndingPreference = this.findPreferenceByCode(
      context,
      ALERT_CODES.QUARANTINE_ENDING,
    );

    if (!healthCheckPreference && !quarantineEndingPreference) {
      this.logger.debug('No health preferences active, skipping');
      return alerts;
    }

    // Alertes pour les quarantaines (mouvements temporaires)
    if (quarantineEndingPreference) {
      const quarantineAlerts = await this.generateQuarantineAlerts(
        context,
        quarantineEndingPreference,
      );
      alerts.push(...quarantineAlerts);
    }

    // Note: Les alertes HEALTH_CHECK_DUE nécessiteraient une table de contrôles sanitaires
    // qui n'existe pas encore dans le schéma. Pour l'instant, on peut se baser sur les
    // derniers traitements de type "health" ou une logique similaire.

    this.logger.debug(`Generated ${alerts.length} health alerts`);
    return alerts;
  }

  /**
   * Génère les alertes pour les quarantaines qui se terminent
   */
  private async generateQuarantineAlerts(
    context: GenerationContext,
    preference: NonNullable<ReturnType<typeof this.findPreferenceByCode>>,
  ): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = [];
    const { farmId, today } = context;

    const reminderDays = this.getReminderDays(
      preference,
      DEFAULT_REMINDER_DAYS.HEALTH,
    );

    // Récupérer les mouvements temporaires de type quarantaine avec retour prévu
    const quarantineMovements = await this.prisma.movement.findMany({
      where: {
        farmId,
        deletedAt: null,
        isTemporary: true,
        temporaryType: 'quarantine',
        expectedReturnDate: { not: null },
        returnDate: null, // Pas encore retourné
      },
      select: {
        id: true,
        expectedReturnDate: true,
        movementDate: true,
        notes: true,
        movementAnimals: {
          select: {
            animal: {
              select: {
                id: true,
                currentEid: true,
                officialNumber: true,
                visualId: true,
              },
            },
          },
        },
      },
    });

    this.logger.debug(
      `Found ${quarantineMovements.length} active quarantine movements`,
    );

    for (const movement of quarantineMovements) {
      if (!movement.expectedReturnDate) continue;

      const daysUntilEnd = this.daysBetween(today, movement.expectedReturnDate);

      if (this.isInReminderWindow(movement.expectedReturnDate, today, reminderDays)) {
        // Créer une alerte pour chaque animal en quarantaine
        for (const ma of movement.movementAnimals) {
          const animalIdentifier = this.formatAnimalIdentifier(ma.animal);
          const uniqueKey = `${ALERT_CODES.QUARANTINE_ENDING}:movement:${movement.id}:animal:${ma.animal.id}`;

          if (!this.alertExists(context, uniqueKey, ALERT_CODES.QUARANTINE_ENDING)) {
            alerts.push(
              this.createAlert(
                preference.alertTemplate.id,
                ALERT_CODES.QUARANTINE_ENDING,
                uniqueKey,
                {
                  preferenceId: preference.id,
                  animalId: ma.animal.id,
                  dueDate: movement.expectedReturnDate,
                  metadata: {
                    quarantineEndDate: movement.expectedReturnDate.toISOString(),
                    quarantineStartDate: movement.movementDate.toISOString(),
                    daysUntilEnd,
                    animalIdentifier,
                    notes: movement.notes,
                  },
                },
              ),
            );
          }
        }
      }
    }

    return alerts;
  }
}
