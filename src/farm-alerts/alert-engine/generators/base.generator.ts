// src/farm-alerts/alert-engine/generators/base.generator.ts

import { AlertCategory } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppLogger } from '../../../common/utils/logger.service';
import {
  AlertGenerator,
  GeneratedAlert,
  GenerationContext,
  AlertPreferenceWithTemplate,
  DEFAULT_REMINDER_DAYS,
} from '../generator.interface';

/**
 * Classe de base pour les générateurs d'alertes
 * Fournit des méthodes utilitaires communes
 */
export abstract class BaseAlertGenerator implements AlertGenerator {
  protected readonly logger: AppLogger;

  constructor(
    protected readonly prisma: PrismaService,
    loggerContext: string,
  ) {
    this.logger = new AppLogger(loggerContext);
  }

  /**
   * Catégorie gérée par ce générateur
   */
  abstract readonly category: AlertCategory;

  /**
   * Génère les alertes pour une ferme
   */
  abstract generate(context: GenerationContext): Promise<GeneratedAlert[]>;

  /**
   * Filtre les préférences pour cette catégorie
   */
  protected getPreferencesForCategory(
    context: GenerationContext,
  ): AlertPreferenceWithTemplate[] {
    return context.preferences.filter(
      (p) =>
        p.isActive &&
        p.alertTemplate.isActive &&
        p.alertTemplate.category === this.category,
    );
  }

  /**
   * Trouve une préférence par code de template
   */
  protected findPreferenceByCode(
    context: GenerationContext,
    code: string,
  ): AlertPreferenceWithTemplate | undefined {
    return context.preferences.find(
      (p) =>
        p.isActive &&
        p.alertTemplate.isActive &&
        p.alertTemplate.code === code,
    );
  }

  /**
   * Calcule le reminderDays effectif selon la hiérarchie:
   * 1. Valeur du fermier (préférence)
   * 2. Valeur par défaut du template (si disponible)
   * 3. Valeur par défaut système
   */
  protected getReminderDays(
    preference: AlertPreferenceWithTemplate | undefined,
    defaultSystemDays: number = DEFAULT_REMINDER_DAYS.VACCINATION,
  ): number {
    if (preference?.reminderDays !== null && preference?.reminderDays !== undefined) {
      return preference.reminderDays;
    }
    // TODO: Si le template a un defaultReminderDays, l'utiliser ici
    return defaultSystemDays;
  }

  /**
   * Calcule le nombre de jours entre deux dates
   */
  protected daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((date2.getTime() - date1.getTime()) / oneDay);
  }

  /**
   * Vérifie si une date est dans la fenêtre de rappel
   * @param dueDate Date d'échéance
   * @param today Date actuelle
   * @param reminderDays Nombre de jours avant l'échéance
   * @returns true si on est dans la fenêtre (dueDate - reminderDays <= today <= dueDate)
   */
  protected isInReminderWindow(
    dueDate: Date,
    today: Date,
    reminderDays: number,
  ): boolean {
    const daysUntilDue = this.daysBetween(today, dueDate);
    return daysUntilDue >= 0 && daysUntilDue <= reminderDays;
  }

  /**
   * Vérifie si une date est dépassée
   */
  protected isOverdue(dueDate: Date, today: Date): boolean {
    return dueDate < today;
  }

  /**
   * Vérifie si une alerte existe déjà (pour dédupliquer)
   */
  protected alertExists(
    context: GenerationContext,
    uniqueKey: string,
    templateCode: string,
  ): boolean {
    // On cherche une alerte active (pending ou read) avec la même clé
    return context.existingAlerts.some((alert) => {
      if (alert.status === 'resolved' || alert.status === 'dismissed') {
        return false;
      }

      // Comparer par les IDs d'entités
      const metadata = alert.metadata as Record<string, unknown>;
      return metadata?.uniqueKey === uniqueKey;
    });
  }

  /**
   * Crée une alerte générée avec les champs de base
   */
  protected createAlert(
    templateId: string,
    templateCode: string,
    uniqueKey: string,
    options: {
      preferenceId?: string;
      animalId?: string;
      lotId?: string;
      treatmentId?: string;
      breedingId?: string;
      documentId?: string;
      dueDate?: Date;
      expiresAt?: Date;
      metadata?: Record<string, unknown>;
    } = {},
  ): GeneratedAlert {
    return {
      alertTemplateId: templateId,
      alertTemplateCode: templateCode,
      alertPreferenceId: options.preferenceId,
      animalId: options.animalId,
      lotId: options.lotId,
      treatmentId: options.treatmentId,
      breedingId: options.breedingId,
      documentId: options.documentId,
      dueDate: options.dueDate,
      expiresAt: options.expiresAt,
      metadata: {
        ...options.metadata,
        uniqueKey, // Stocker la clé unique dans metadata pour comparaison
      },
      uniqueKey,
    };
  }

  /**
   * Formatte un identifiant d'animal pour affichage
   */
  protected formatAnimalIdentifier(animal: {
    currentEid?: string | null;
    officialNumber?: string | null;
    visualId?: string | null;
  }): string {
    return (
      animal.currentEid ||
      animal.officialNumber ||
      animal.visualId ||
      'N/A'
    );
  }

  /**
   * Ajoute des jours à une date
   */
  protected addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Début de journée (00:00:00)
   */
  protected startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }
}
