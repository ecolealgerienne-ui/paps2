// src/farm-alerts/alert-engine/generator.interface.ts

import { AlertCategory, AlertPriority } from '@prisma/client';

/**
 * Représente une alerte à générer
 */
export interface GeneratedAlert {
  /** ID du template d'alerte à utiliser */
  alertTemplateId: string;

  /** Code du template (pour lookup) */
  alertTemplateCode: string;

  /** ID de la préférence utilisée (optionnel) */
  alertPreferenceId?: string;

  /** ID de l'animal concerné (optionnel) */
  animalId?: string;

  /** ID du lot concerné (optionnel) */
  lotId?: string;

  /** ID du traitement concerné (optionnel) */
  treatmentId?: string;

  /** ID de la reproduction concernée (optionnel) */
  breedingId?: string;

  /** ID du document concerné (optionnel) */
  documentId?: string;

  /** Date d'échéance de l'action (optionnel) */
  dueDate?: Date;

  /** Date d'expiration de l'alerte (optionnel) */
  expiresAt?: Date;

  /** Données contextuelles */
  metadata: Record<string, unknown>;

  /**
   * Clé unique pour dédupliquer les alertes.
   * Utilisée pour éviter de créer des doublons.
   * Format suggéré: `${templateCode}:${entityType}:${entityId}`
   */
  uniqueKey: string;
}

/**
 * Préférence d'alerte avec son template
 */
export interface AlertPreferenceWithTemplate {
  id: string;
  farmId: string;
  alertTemplateId: string;
  reminderDays: number | null;
  isActive: boolean;
  alertTemplate: {
    id: string;
    code: string;
    category: AlertCategory;
    priority: AlertPriority;
    isActive: boolean;
  };
}

/**
 * Alerte existante (pour comparaison)
 */
export interface ExistingAlert {
  id: string;
  alertTemplateId: string;
  alertPreferenceId: string | null;
  animalId: string | null;
  lotId: string | null;
  treatmentId: string | null;
  breedingId: string | null;
  documentId: string | null;
  status: string;
  metadata: Record<string, unknown>;
}

/**
 * Contexte de génération passé aux générateurs
 */
export interface GenerationContext {
  farmId: string;
  today: Date;
  preferences: AlertPreferenceWithTemplate[];
  existingAlerts: ExistingAlert[];
}

/**
 * Interface pour un générateur d'alertes spécialisé
 */
export interface AlertGenerator {
  /**
   * Catégorie gérée par ce générateur
   */
  readonly category: AlertCategory;

  /**
   * Génère les alertes pour une ferme
   * @param context Contexte de génération
   * @returns Liste des alertes à créer
   */
  generate(context: GenerationContext): Promise<GeneratedAlert[]>;
}

/**
 * Résultat de la synchronisation des alertes
 */
export interface SyncResult {
  /** Nombre d'alertes créées */
  created: number;

  /** Nombre d'alertes résolues (obsolètes) */
  resolved: number;

  /** Nombre d'alertes inchangées */
  unchanged: number;

  /** IDs des alertes créées */
  createdIds: string[];

  /** IDs des alertes résolues */
  resolvedIds: string[];
}

/**
 * Codes d'alertes standards par catégorie
 */
export const ALERT_CODES = {
  // Vaccination
  VACC_DUE: 'VACC_DUE',
  VACC_OVERDUE: 'VACC_OVERDUE',
  VACC_ANNUAL_DUE: 'VACC_ANNUAL_DUE',

  // Treatment
  TREATMENT_ENDING: 'TREATMENT_ENDING',
  TREATMENT_OVERDUE: 'TREATMENT_OVERDUE',
  WITHDRAWAL_ACTIVE: 'WITHDRAWAL_ACTIVE',
  WITHDRAWAL_ENDING: 'WITHDRAWAL_ENDING',

  // Nutrition
  WEIGHING_DUE: 'WEIGHING_DUE',
  GMQ_LOW: 'GMQ_LOW',
  GMQ_CRITICAL: 'GMQ_CRITICAL',
  WEIGHT_LOSS: 'WEIGHT_LOSS',

  // Reproduction
  CALVING_SOON: 'CALVING_SOON',
  HEAT_EXPECTED: 'HEAT_EXPECTED',
  PREGNANCY_CHECK: 'PREGNANCY_CHECK',

  // Health
  HEALTH_CHECK_DUE: 'HEALTH_CHECK_DUE',
  QUARANTINE_ENDING: 'QUARANTINE_ENDING',

  // Administrative
  DOC_EXPIRING: 'DOC_EXPIRING',
  ID_MISSING: 'ID_MISSING',
} as const;

export type AlertCode = typeof ALERT_CODES[keyof typeof ALERT_CODES];

/**
 * Délais par défaut du système (en jours)
 */
export const DEFAULT_REMINDER_DAYS = {
  VACCINATION: 7,
  TREATMENT: 3,
  NUTRITION: 14,
  REPRODUCTION: 7,
  HEALTH: 30,
  ADMINISTRATIVE: 30,
} as const;
