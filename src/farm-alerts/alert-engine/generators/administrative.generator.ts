// src/farm-alerts/alert-engine/generators/administrative.generator.ts

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
 * Générateur d'alertes administratives
 * Gère: DOC_EXPIRING, ID_MISSING
 */
@Injectable()
export class AdministrativeAlertGenerator extends BaseAlertGenerator {
  readonly category = AlertCategory.administrative;

  constructor(prisma: PrismaService) {
    super(prisma, AdministrativeAlertGenerator.name);
  }

  async generate(context: GenerationContext): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = [];
    const { farmId, today } = context;

    // Récupérer les préférences
    const docExpiringPreference = this.findPreferenceByCode(
      context,
      ALERT_CODES.DOC_EXPIRING,
    );
    const idMissingPreference = this.findPreferenceByCode(
      context,
      ALERT_CODES.ID_MISSING,
    );

    if (!docExpiringPreference && !idMissingPreference) {
      this.logger.debug('No administrative preferences active, skipping');
      return alerts;
    }

    // Générer les alertes pour documents expirants
    if (docExpiringPreference) {
      const docAlerts = await this.generateDocumentExpiringAlerts(
        context,
        docExpiringPreference,
      );
      alerts.push(...docAlerts);
    }

    // Générer les alertes pour identifications manquantes
    if (idMissingPreference) {
      const idAlerts = await this.generateMissingIdAlerts(
        context,
        idMissingPreference,
      );
      alerts.push(...idAlerts);
    }

    this.logger.debug(`Generated ${alerts.length} administrative alerts`);
    return alerts;
  }

  /**
   * Génère les alertes pour les documents qui expirent bientôt
   */
  private async generateDocumentExpiringAlerts(
    context: GenerationContext,
    preference: NonNullable<ReturnType<typeof this.findPreferenceByCode>>,
  ): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = [];
    const { farmId, today } = context;

    const reminderDays = this.getReminderDays(
      preference,
      DEFAULT_REMINDER_DAYS.ADMINISTRATIVE,
    );

    // Récupérer les documents avec date d'expiration dans la fenêtre
    const reminderDate = this.addDays(today, reminderDays);

    const expiringDocuments = await this.prisma.document.findMany({
      where: {
        farmId,
        deletedAt: null,
        expiryDate: {
          not: null,
          gte: today,
          lte: reminderDate,
        },
      },
      select: {
        id: true,
        type: true,
        title: true,
        fileName: true,
        expiryDate: true,
        animalId: true,
      },
    });

    this.logger.debug(`Found ${expiringDocuments.length} expiring documents`);

    for (const doc of expiringDocuments) {
      if (!doc.expiryDate) continue;

      const daysUntilExpiry = this.daysBetween(today, doc.expiryDate);
      const uniqueKey = `${ALERT_CODES.DOC_EXPIRING}:document:${doc.id}`;

      if (!this.alertExists(context, uniqueKey, ALERT_CODES.DOC_EXPIRING)) {
        alerts.push(
          this.createAlert(
            preference.alertTemplate.id,
            ALERT_CODES.DOC_EXPIRING,
            uniqueKey,
            {
              preferenceId: preference.id,
              documentId: doc.id,
              animalId: doc.animalId || undefined,
              dueDate: doc.expiryDate,
              metadata: {
                documentType: doc.type,
                documentTitle: doc.title || doc.fileName,
                expiryDate: doc.expiryDate.toISOString(),
                daysUntilExpiry,
              },
            },
          ),
        );
      }
    }

    return alerts;
  }

  /**
   * Génère les alertes pour les animaux sans identification officielle
   */
  private async generateMissingIdAlerts(
    context: GenerationContext,
    preference: NonNullable<ReturnType<typeof this.findPreferenceByCode>>,
  ): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = [];
    const { farmId, today } = context;

    // Délai avant de considérer l'identification comme manquante (jours depuis naissance)
    // Un animal nouveau-né a un certain délai légal pour être identifié
    const gracePeriodDays = 30;
    const gracePeriodDate = this.addDays(today, -gracePeriodDays);

    // Récupérer les animaux vivants sans identification officielle
    const animalsWithoutId = await this.prisma.animal.findMany({
      where: {
        farmId,
        status: 'alive',
        deletedAt: null,
        birthDate: { lte: gracePeriodDate }, // Né il y a plus de X jours
        AND: [
          {
            OR: [{ currentEid: null }, { currentEid: '' }],
          },
          {
            OR: [{ officialNumber: null }, { officialNumber: '' }],
          },
        ],
      },
      select: {
        id: true,
        currentEid: true,
        officialNumber: true,
        visualId: true,
        birthDate: true,
      },
    });

    this.logger.debug(
      `Found ${animalsWithoutId.length} animals without official identification`,
    );

    for (const animal of animalsWithoutId) {
      const uniqueKey = `${ALERT_CODES.ID_MISSING}:animal:${animal.id}`;
      const animalIdentifier = animal.visualId || 'N/A';
      const daysSinceBirth = this.daysBetween(animal.birthDate, today);

      if (!this.alertExists(context, uniqueKey, ALERT_CODES.ID_MISSING)) {
        alerts.push(
          this.createAlert(
            preference.alertTemplate.id,
            ALERT_CODES.ID_MISSING,
            uniqueKey,
            {
              preferenceId: preference.id,
              animalId: animal.id,
              metadata: {
                missingField: !animal.currentEid && !animal.officialNumber
                  ? 'both'
                  : !animal.currentEid
                    ? 'currentEid'
                    : 'officialNumber',
                visualId: animal.visualId,
                birthDate: animal.birthDate.toISOString(),
                daysSinceBirth,
                animalIdentifier,
              },
            },
          ),
        );
      }
    }

    return alerts;
  }
}
