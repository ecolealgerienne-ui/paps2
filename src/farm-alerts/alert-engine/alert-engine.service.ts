// src/farm-alerts/alert-engine/alert-engine.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '../../common/utils/logger.service';
import { FarmAlertStatus } from '../types';
import {
  AlertGenerator,
  GeneratedAlert,
  GenerationContext,
  SyncResult,
  AlertPreferenceWithTemplate,
  ExistingAlert,
} from './generator.interface';

// Import des générateurs (seront ajoutés en Phase 4)
import { VaccinationAlertGenerator } from './generators/vaccination.generator';
import { TreatmentAlertGenerator } from './generators/treatment.generator';
import { NutritionAlertGenerator } from './generators/nutrition.generator';
import { ReproductionAlertGenerator } from './generators/reproduction.generator';
import { HealthAlertGenerator } from './generators/health.generator';
import { AdministrativeAlertGenerator } from './generators/administrative.generator';

/**
 * Service principal du moteur de génération d'alertes
 */
@Injectable()
export class AlertEngineService {
  private readonly logger = new AppLogger(AlertEngineService.name);
  private readonly generators: AlertGenerator[];

  constructor(
    private readonly prisma: PrismaService,
    private readonly vaccinationGenerator: VaccinationAlertGenerator,
    private readonly treatmentGenerator: TreatmentAlertGenerator,
    private readonly nutritionGenerator: NutritionAlertGenerator,
    private readonly reproductionGenerator: ReproductionAlertGenerator,
    private readonly healthGenerator: HealthAlertGenerator,
    private readonly administrativeGenerator: AdministrativeAlertGenerator,
  ) {
    this.generators = [
      vaccinationGenerator,
      treatmentGenerator,
      nutritionGenerator,
      reproductionGenerator,
      healthGenerator,
      administrativeGenerator,
    ];
  }

  /**
   * Génère et synchronise les alertes pour une ferme
   */
  async generateForFarm(farmId: string): Promise<SyncResult> {
    this.logger.debug(`Starting alert generation for farm ${farmId}`);
    const startTime = Date.now();

    try {
      // 1. Récupérer le contexte
      const context = await this.buildContext(farmId);

      // 2. Générer les alertes via tous les générateurs
      const allGeneratedAlerts: GeneratedAlert[] = [];

      for (const generator of this.generators) {
        try {
          const alerts = await generator.generate(context);
          allGeneratedAlerts.push(...alerts);
          this.logger.debug(
            `Generator ${generator.category} produced ${alerts.length} alerts`,
          );
        } catch (error) {
          this.logger.error(
            `Generator ${generator.category} failed: ${error.message}`,
            error.stack,
          );
          // Continuer avec les autres générateurs
        }
      }

      // 3. Synchroniser avec la base de données
      const result = await this.syncAlerts(farmId, allGeneratedAlerts, context);

      const duration = Date.now() - startTime;
      this.logger.audit('Alert generation completed', {
        farmId,
        duration: `${duration}ms`,
        ...result,
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Alert generation failed for farm ${farmId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Construit le contexte de génération
   */
  private async buildContext(farmId: string): Promise<GenerationContext> {
    const today = this.startOfDay(new Date());

    // Récupérer les préférences actives avec leurs templates
    const preferences = await this.prisma.farmAlertTemplatePreference.findMany({
      where: {
        farmId,
        isActive: true,
        deletedAt: null,
        alertTemplate: {
          isActive: true,
          deletedAt: null,
        },
      },
      include: {
        alertTemplate: {
          select: {
            id: true,
            code: true,
            category: true,
            priority: true,
            isActive: true,
          },
        },
      },
    });

    // Récupérer les alertes existantes non résolues
    const existingAlerts = await this.prisma.farmAlert.findMany({
      where: {
        farmId,
        deletedAt: null,
        status: {
          in: [FarmAlertStatus.PENDING, FarmAlertStatus.READ],
        },
      },
      select: {
        id: true,
        alertTemplateId: true,
        alertPreferenceId: true,
        animalId: true,
        lotId: true,
        treatmentId: true,
        breedingId: true,
        documentId: true,
        status: true,
        metadata: true,
      },
    });

    return {
      farmId,
      today,
      preferences: preferences as AlertPreferenceWithTemplate[],
      existingAlerts: existingAlerts as ExistingAlert[],
    };
  }

  /**
   * Synchronise les alertes générées avec la base de données
   */
  private async syncAlerts(
    farmId: string,
    generated: GeneratedAlert[],
    context: GenerationContext,
  ): Promise<SyncResult> {
    const result: SyncResult = {
      created: 0,
      resolved: 0,
      unchanged: 0,
      createdIds: [],
      resolvedIds: [],
    };

    // Créer un map des alertes générées par uniqueKey
    const generatedMap = new Map<string, GeneratedAlert>();
    for (const alert of generated) {
      generatedMap.set(alert.uniqueKey, alert);
    }

    // Créer un map des alertes existantes par uniqueKey
    const existingMap = new Map<string, ExistingAlert>();
    for (const alert of context.existingAlerts) {
      const metadata = alert.metadata as Record<string, unknown>;
      const uniqueKey = metadata?.uniqueKey as string;
      if (uniqueKey) {
        existingMap.set(uniqueKey, alert);
      }
    }

    // Transaction pour atomicité
    await this.prisma.$transaction(async (tx) => {
      // 1. Créer les nouvelles alertes
      const toCreate: GeneratedAlert[] = [];
      for (const [uniqueKey, alert] of generatedMap) {
        if (!existingMap.has(uniqueKey)) {
          toCreate.push(alert);
        } else {
          result.unchanged++;
        }
      }

      if (toCreate.length > 0) {
        const { randomUUID } = await import('crypto');

        for (const alert of toCreate) {
          const id = randomUUID();
          await tx.farmAlert.create({
            data: {
              id,
              farmId,
              alertTemplateId: alert.alertTemplateId,
              alertPreferenceId: alert.alertPreferenceId,
              animalId: alert.animalId,
              lotId: alert.lotId,
              treatmentId: alert.treatmentId,
              breedingId: alert.breedingId,
              documentId: alert.documentId,
              dueDate: alert.dueDate,
              expiresAt: alert.expiresAt,
              metadata: alert.metadata,
              status: FarmAlertStatus.PENDING,
            },
          });
          result.createdIds.push(id);
          result.created++;
        }
      }

      // 2. Résoudre les alertes obsolètes (qui n'ont plus de raison d'exister)
      const now = new Date();
      for (const [uniqueKey, existing] of existingMap) {
        // Si l'alerte n'est plus générée, elle est obsolète
        if (!generatedMap.has(uniqueKey)) {
          // Ne pas toucher aux alertes dismissed (l'utilisateur les a ignorées volontairement)
          if (existing.status !== 'dismissed') {
            await tx.farmAlert.update({
              where: { id: existing.id },
              data: {
                status: FarmAlertStatus.RESOLVED,
                resolvedAt: now,
                version: { increment: 1 },
              },
            });
            result.resolvedIds.push(existing.id);
            result.resolved++;
          }
        }
      }
    });

    return result;
  }

  /**
   * Force la résolution d'alertes spécifiques
   */
  async resolveAlerts(farmId: string, alertIds: string[]): Promise<number> {
    const now = new Date();

    const result = await this.prisma.farmAlert.updateMany({
      where: {
        id: { in: alertIds },
        farmId,
        deletedAt: null,
        status: { in: [FarmAlertStatus.PENDING, FarmAlertStatus.READ] },
      },
      data: {
        status: FarmAlertStatus.RESOLVED,
        resolvedAt: now,
      },
    });

    this.logger.audit('Alerts resolved', {
      farmId,
      count: result.count,
    });

    return result.count;
  }

  /**
   * Invalide le cache et régénère les alertes (pour les triggers)
   */
  async invalidateAndRegenerate(farmId: string): Promise<void> {
    // Pour l'instant, on régénère simplement
    // En Phase future avec Redis, on invalidera d'abord le cache
    await this.generateForFarm(farmId);
  }

  /**
   * Début de journée (00:00:00)
   */
  private startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }
}
