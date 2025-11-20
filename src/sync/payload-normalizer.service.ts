import { Injectable } from '@nestjs/common';
import { camelToSnake } from '../common/utils/case-converter';
import { convertEnumValue } from '../common/utils/enum-converter';

/**
 * Service for normalizing payloads from Flutter app format to database format
 *
 * Responsibilities:
 * 1. Convert camelCase keys to snake_case for specific entities
 * 2. Convert enum values (e.g., artificialInsemination → artificial_insemination)
 * 3. Remove client-only fields (synced, last_synced_at, server_version)
 *
 * Based on BACKEND_DELTA.md section 7.2
 */
@Injectable()
export class PayloadNormalizerService {

  /**
   * Normalize payload based on entity type
   * @param entityType - Type of entity (animal, lot, breeding, etc.)
   * @param payload - Raw payload from app (camelCase)
   * @returns Normalized payload ready for Prisma (snake_case)
   */
  normalize(entityType: string, payload: any): any {
    if (!payload || typeof payload !== 'object') {
      return payload;
    }

    // Clone to avoid mutation
    let normalized = { ...payload };

    // === STEP 1: Case Conversion ===
    // NOTE: Prisma models use camelCase and auto-map to snake_case DB columns via @map
    // So we DON'T convert to snake_case - Prisma handles that
    // We only need to handle special cases below

    // === STEP 2: Special Case - Animal ===
    // Animal: Accept farm_id (snake_case) and convert TO farmId (camelCase) for Prisma
    // Prisma model field is "farmId" not "farm_id"
    if (entityType === 'animal') {
      if (payload.farm_id && !payload.farmId) {
        normalized.farmId = payload.farm_id;
        delete normalized.farm_id;
      }
      // If farmId is already provided, keep it as-is
    }

    // === STEP 3: Special Case - Lot.animalIds ===
    // Extract animalIds (keep as separate field for junction table)
    if (entityType === 'lot' && payload.animalIds) {
      // Store animalIds separately - will be handled by sync service
      normalized._animalIds = payload.animalIds;
      delete normalized.animalIds; // Remove from main payload
    }

    // === STEP 4: Special Case - Campaign.animalIds ===
    // Convert array to JSON string for animalIdsJson field
    if (entityType === 'campaign' && payload.animalIds) {
      normalized.animalIdsJson = JSON.stringify(payload.animalIds);
      delete normalized.animalIds;
    }

    // === STEP 5: Enum Conversions ===
    normalized = this.convertEnums(entityType, normalized);

    // === STEP 6: Convert Date Strings to Date Objects ===
    // Prisma requires Date objects, not ISO strings
    normalized = this.convertDates(normalized);

    // === STEP 7: Remove Client-Only Fields ===
    delete normalized.synced;
    delete normalized.last_synced_at;
    delete normalized.server_version;

    return normalized;
  }

  /**
   * Convert date strings to Date objects
   * Prisma requires Date objects for DateTime fields
   */
  private convertDates(payload: any): any {
    const dateFields = [
      'birthDate', 'birth_date',
      'startDate', 'start_date',
      'endDate', 'end_date',
      'plannedEndDate', 'planned_end_date',
      'actualEndDate', 'actual_end_date',
      'breedingDate', 'breeding_date',
      'expectedBirthDate', 'expected_birth_date',
      'actualBirthDate', 'actual_birth_date',
      'movementDate', 'movement_date',
      'returnDate', 'return_date',
      'weightDate', 'weight_date',
      'treatmentDate', 'treatment_date',
      'vaccinationDate', 'vaccination_date',
      'issueDate', 'issue_date',
      'expiryDate', 'expiry_date',
    ];

    for (const field of dateFields) {
      if (payload[field] && typeof payload[field] === 'string') {
        payload[field] = new Date(payload[field]);
      }
    }

    return payload;
  }

  /**
   * Convert enum values based on entity type
   * @param entityType - Type of entity
   * @param payload - Payload with potential enum fields
   * @returns Payload with converted enum values
   */
  private convertEnums(entityType: string, payload: any): any {
    switch (entityType) {
      case 'movement':
        // Convert movement type (Prisma field is movementType)
        if (payload.movementType) {
          payload.movementType = convertEnumValue('movement_type', payload.movementType);
        }

        // Convert temporary type if exists
        if (payload.temporaryType) {
          payload.temporaryType = convertEnumValue('temporary_type', payload.temporaryType);
        }
        break;

      case 'breeding':
        // Convert breeding method (Prisma field is breedingMethod)
        if (payload.breedingMethod) {
          payload.breedingMethod = convertEnumValue('breeding_method', payload.breedingMethod);
        }
        break;

      case 'document':
        // Convert document type (Prisma field is documentType)
        if (payload.documentType) {
          payload.documentType = convertEnumValue('document_type', payload.documentType);
        }
        break;

      case 'animal':
        // Convert animal status
        if (payload.status) {
          payload.status = convertEnumValue('animal_status', payload.status);
        }
        break;
    }

    return payload;
  }

  /**
   * Denormalize payload from database format back to app format
   * Useful for responses
   * @param entityType - Type of entity
   * @param data - Data from database
   * @returns Data in app format (camelCase)
   */
  denormalize(entityType: string, data: any): any {
    // This method can be implemented later if needed for responses
    // For now, we mainly normalize incoming data
    return data;
  }
}
