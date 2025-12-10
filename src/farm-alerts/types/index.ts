// src/farm-alerts/types/index.ts

/**
 * Statut d'une alerte générée
 * Miroir de l'enum Prisma FarmAlertStatus
 */
export enum FarmAlertStatus {
  PENDING = 'pending',
  READ = 'read',
  DISMISSED = 'dismissed',
  RESOLVED = 'resolved',
}

/**
 * Plateforme de lecture
 * Miroir de l'enum Prisma ReadPlatform
 */
export enum ReadPlatform {
  MOBILE = 'mobile',
  WEB = 'web',
}

/**
 * Options de filtrage pour la liste des alertes
 */
export interface FarmAlertFilterOptions {
  status?: FarmAlertStatus;
  category?: string;
  priority?: string;
  animalId?: string;
  lotId?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
  orderBy?: 'triggeredAt' | 'dueDate' | 'priority';
  order?: 'asc' | 'desc';
}

/**
 * Résumé des alertes par statut/catégorie/priorité
 */
export interface FarmAlertSummary {
  byStatus: {
    pending: number;
    read: number;
    dismissed: number;
    resolved: number;
  };
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  total: number;
  unreadCount: number;
}

/**
 * Metadata typée pour les alertes (exemples)
 */
export interface VaccinationAlertMetadata {
  vaccineName: string;
  lastVaccinationDate?: string;
  daysUntilDue: number;
  animalIdentifier?: string;
}

export interface TreatmentAlertMetadata {
  treatmentName: string;
  productName?: string;
  daysUntilEnd: number;
  withdrawalEndDate?: string;
}

export interface NutritionAlertMetadata {
  currentWeight?: number;
  previousWeight?: number;
  gmq?: number;
  daysSinceLastWeighing: number;
}

export interface ReproductionAlertMetadata {
  expectedBirthDate?: string;
  breedingDate?: string;
  daysUntilDue: number;
  motherIdentifier?: string;
}

export interface HealthAlertMetadata {
  lastCheckDate?: string;
  quarantineEndDate?: string;
  daysUntilDue: number;
}

export interface AdministrativeAlertMetadata {
  documentType?: string;
  expiryDate?: string;
  daysUntilExpiry?: number;
  missingField?: string;
}

/**
 * Union type pour toutes les metadata
 */
export type FarmAlertMetadata =
  | VaccinationAlertMetadata
  | TreatmentAlertMetadata
  | NutritionAlertMetadata
  | ReproductionAlertMetadata
  | HealthAlertMetadata
  | AdministrativeAlertMetadata
  | Record<string, unknown>;
