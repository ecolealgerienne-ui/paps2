// src/farm-alerts/alert-engine/generators/nutrition.generator.ts

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
 * Générateur d'alertes pour la nutrition
 * Gère: WEIGHING_DUE, GMQ_LOW, GMQ_CRITICAL, WEIGHT_LOSS
 */
@Injectable()
export class NutritionAlertGenerator extends BaseAlertGenerator {
  readonly category = AlertCategory.nutrition;

  // Seuils GMQ configurables (en g/jour)
  private readonly GMQ_LOW_THRESHOLD = 100; // Seuil GMQ faible
  private readonly GMQ_CRITICAL_THRESHOLD = 50; // Seuil GMQ critique
  private readonly DEFAULT_WEIGHING_INTERVAL = 14; // Jours entre pesées

  constructor(prisma: PrismaService) {
    super(prisma, NutritionAlertGenerator.name);
  }

  async generate(context: GenerationContext): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = [];
    const { farmId, today } = context;

    // Récupérer les préférences
    const weighingDuePreference = this.findPreferenceByCode(
      context,
      ALERT_CODES.WEIGHING_DUE,
    );
    const gmqLowPreference = this.findPreferenceByCode(
      context,
      ALERT_CODES.GMQ_LOW,
    );
    const gmqCriticalPreference = this.findPreferenceByCode(
      context,
      ALERT_CODES.GMQ_CRITICAL,
    );
    const weightLossPreference = this.findPreferenceByCode(
      context,
      ALERT_CODES.WEIGHT_LOSS,
    );

    if (
      !weighingDuePreference &&
      !gmqLowPreference &&
      !gmqCriticalPreference &&
      !weightLossPreference
    ) {
      this.logger.debug('No nutrition preferences active, skipping');
      return alerts;
    }

    const weighingInterval = this.getReminderDays(
      weighingDuePreference,
      this.DEFAULT_WEIGHING_INTERVAL,
    );

    // Récupérer les animaux vivants avec leurs dernières pesées
    const animalsWithWeights = await this.prisma.animal.findMany({
      where: {
        farmId,
        status: 'alive',
        deletedAt: null,
      },
      select: {
        id: true,
        currentEid: true,
        officialNumber: true,
        visualId: true,
        birthDate: true,
        weights: {
          where: { deletedAt: null },
          orderBy: { weightDate: 'desc' },
          take: 2, // Dernière et avant-dernière pesée
          select: {
            id: true,
            weight: true,
            weightDate: true,
          },
        },
      },
    });

    this.logger.debug(`Analyzing weights for ${animalsWithWeights.length} animals`);

    for (const animal of animalsWithWeights) {
      const animalIdentifier = this.formatAnimalIdentifier(animal);
      const lastWeight = animal.weights[0];
      const previousWeight = animal.weights[1];

      // Cas 1: Pesée due (WEIGHING_DUE)
      if (weighingDuePreference) {
        const daysSinceLastWeighing = lastWeight
          ? this.daysBetween(lastWeight.weightDate, today)
          : this.daysBetween(animal.birthDate, today);

        if (daysSinceLastWeighing >= weighingInterval) {
          const uniqueKey = `${ALERT_CODES.WEIGHING_DUE}:animal:${animal.id}`;
          if (!this.alertExists(context, uniqueKey, ALERT_CODES.WEIGHING_DUE)) {
            alerts.push(
              this.createAlert(
                weighingDuePreference.alertTemplate.id,
                ALERT_CODES.WEIGHING_DUE,
                uniqueKey,
                {
                  preferenceId: weighingDuePreference.id,
                  animalId: animal.id,
                  metadata: {
                    daysSinceLastWeighing,
                    lastWeighingDate: lastWeight?.weightDate?.toISOString() || null,
                    currentWeight: lastWeight?.weight || null,
                    animalIdentifier,
                  },
                },
              ),
            );
          }
        }
      }

      // Si on a deux pesées, on peut calculer le GMQ et détecter la perte de poids
      if (lastWeight && previousWeight) {
        const daysBetweenWeights = this.daysBetween(
          previousWeight.weightDate,
          lastWeight.weightDate,
        );

        if (daysBetweenWeights > 0) {
          const weightDiff = lastWeight.weight - previousWeight.weight;
          const gmq = (weightDiff / daysBetweenWeights) * 1000; // en g/jour

          // Cas 2: Perte de poids (WEIGHT_LOSS)
          if (weightDiff < 0 && weightLossPreference) {
            const uniqueKey = `${ALERT_CODES.WEIGHT_LOSS}:animal:${animal.id}`;
            if (!this.alertExists(context, uniqueKey, ALERT_CODES.WEIGHT_LOSS)) {
              alerts.push(
                this.createAlert(
                  weightLossPreference.alertTemplate.id,
                  ALERT_CODES.WEIGHT_LOSS,
                  uniqueKey,
                  {
                    preferenceId: weightLossPreference.id,
                    animalId: animal.id,
                    metadata: {
                      currentWeight: lastWeight.weight,
                      previousWeight: previousWeight.weight,
                      weightLoss: Math.abs(weightDiff),
                      daysBetweenWeights,
                      animalIdentifier,
                    },
                  },
                ),
              );
            }
          }

          // Cas 3: GMQ critique (GMQ_CRITICAL)
          if (gmq < this.GMQ_CRITICAL_THRESHOLD && gmqCriticalPreference) {
            const uniqueKey = `${ALERT_CODES.GMQ_CRITICAL}:animal:${animal.id}`;
            if (!this.alertExists(context, uniqueKey, ALERT_CODES.GMQ_CRITICAL)) {
              alerts.push(
                this.createAlert(
                  gmqCriticalPreference.alertTemplate.id,
                  ALERT_CODES.GMQ_CRITICAL,
                  uniqueKey,
                  {
                    preferenceId: gmqCriticalPreference.id,
                    animalId: animal.id,
                    metadata: {
                      gmq: Math.round(gmq),
                      threshold: this.GMQ_CRITICAL_THRESHOLD,
                      currentWeight: lastWeight.weight,
                      previousWeight: previousWeight.weight,
                      daysSinceLastWeighing: this.daysBetween(
                        lastWeight.weightDate,
                        today,
                      ),
                      animalIdentifier,
                    },
                  },
                ),
              );
            }
          }
          // Cas 4: GMQ faible (GMQ_LOW)
          else if (
            gmq >= this.GMQ_CRITICAL_THRESHOLD &&
            gmq < this.GMQ_LOW_THRESHOLD &&
            gmqLowPreference
          ) {
            const uniqueKey = `${ALERT_CODES.GMQ_LOW}:animal:${animal.id}`;
            if (!this.alertExists(context, uniqueKey, ALERT_CODES.GMQ_LOW)) {
              alerts.push(
                this.createAlert(
                  gmqLowPreference.alertTemplate.id,
                  ALERT_CODES.GMQ_LOW,
                  uniqueKey,
                  {
                    preferenceId: gmqLowPreference.id,
                    animalId: animal.id,
                    metadata: {
                      gmq: Math.round(gmq),
                      threshold: this.GMQ_LOW_THRESHOLD,
                      currentWeight: lastWeight.weight,
                      previousWeight: previousWeight.weight,
                      daysSinceLastWeighing: this.daysBetween(
                        lastWeight.weightDate,
                        today,
                      ),
                      animalIdentifier,
                    },
                  },
                ),
              );
            }
          }
        }
      }
    }

    this.logger.debug(`Generated ${alerts.length} nutrition alerts`);
    return alerts;
  }
}
