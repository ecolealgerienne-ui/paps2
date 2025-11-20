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

    // Entities that require COMPLETE camelCase → snake_case transformation
    const camelCaseEntities = [
      'lot',
      'breeding',
      'document',
      'campaign',
      'veterinarian',
      'medicalProduct',
    ];

    if (camelCaseEntities.includes(entityType)) {
      normalized = camelToSnake(payload);
    }

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
    // Extract animalIds before normalizing (keep as separate field)
    if (entityType === 'lot' && (payload.animalIds || normalized.animal_ids)) {
      // Store animalIds separately - will be handled by LotsService
      normalized._animalIds = payload.animalIds || normalized.animal_ids;
      delete normalized.animal_ids; // Remove from main payload
    }

    // === STEP 4: Special Case - Campaign.animalIds ===
    // Convert array to JSON string for animal_ids_json field
    if (entityType === 'campaign' && (payload.animalIds || normalized.animal_ids)) {
      const animalIdsArray = payload.animalIds || normalized.animal_ids;
      normalized.animal_ids_json = JSON.stringify(animalIdsArray);
      delete normalized.animal_ids;
    }

    // === STEP 5: Enum Conversions ===
    normalized = this.convertEnums(entityType, normalized);

    // === STEP 6: Remove Client-Only Fields ===
    delete normalized.synced;
    delete normalized.last_synced_at;
    delete normalized.server_version;

    return normalized;
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
        // Convert movement type
        if (payload.movement_type || payload.movementType) {
          const typeField = payload.movement_type || payload.movementType;
          payload.movement_type = convertEnumValue('movement_type', typeField);
          delete payload.movementType; // Clean up if exists
        }

        // Convert temporary type if exists
        if (payload.temporary_type || payload.temporaryType) {
          const tempField = payload.temporary_type || payload.temporaryType;
          payload.temporary_type = convertEnumValue('temporary_type', tempField);
          delete payload.temporaryType;
        }
        break;

      case 'breeding':
        // Convert breeding method (field is breeding_method after camelToSnake)
        if (payload.breeding_method) {
          payload.breeding_method = convertEnumValue('breeding_method', payload.breeding_method);
        }
        break;

      case 'document':
        // Convert document type (field is document_type after camelToSnake)
        if (payload.document_type) {
          payload.document_type = convertEnumValue('document_type', payload.document_type);
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
