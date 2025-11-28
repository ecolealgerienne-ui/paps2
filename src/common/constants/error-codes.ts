// src/common/constants/error-codes.ts

export const ERROR_CODES = {
  // ========================================
  // ANIMALS
  // ========================================
  ANIMAL_NOT_FOUND: 'ANIMAL_NOT_FOUND',
  ANIMAL_MUST_BE_FEMALE: 'ANIMAL_MUST_BE_FEMALE',
  ANIMAL_MUST_BE_MALE: 'ANIMAL_MUST_BE_MALE',

  // ========================================
  // LOTS
  // ========================================
  LOT_NOT_FOUND: 'LOT_NOT_FOUND',

  // ========================================
  // TREATMENTS
  // ========================================
  TREATMENT_NOT_FOUND: 'TREATMENT_NOT_FOUND',
  TREATMENT_ANIMAL_NOT_FOUND: 'TREATMENT_ANIMAL_NOT_FOUND',

  // ========================================
  // VACCINATIONS
  // ========================================
  VACCINATION_NOT_FOUND: 'VACCINATION_NOT_FOUND',
  VACCINATION_ANIMAL_NOT_FOUND: 'VACCINATION_ANIMAL_NOT_FOUND',

  // ========================================
  // MOVEMENTS
  // ========================================
  MOVEMENT_NOT_FOUND: 'MOVEMENT_NOT_FOUND',
  MOVEMENT_ANIMALS_NOT_FOUND: 'MOVEMENT_ANIMALS_NOT_FOUND',

  // ========================================
  // BREEDINGS
  // ========================================
  BREEDING_NOT_FOUND: 'BREEDING_NOT_FOUND',
  MOTHER_NOT_FOUND: 'MOTHER_NOT_FOUND',
  FATHER_NOT_FOUND: 'FATHER_NOT_FOUND',

  // ========================================
  // WEIGHTS
  // ========================================
  WEIGHT_NOT_FOUND: 'WEIGHT_NOT_FOUND',
  WEIGHT_ANIMAL_NOT_FOUND: 'WEIGHT_ANIMAL_NOT_FOUND',

  // ========================================
  // CAMPAIGNS
  // ========================================
  CAMPAIGN_NOT_FOUND: 'CAMPAIGN_NOT_FOUND',
  CAMPAIGN_LOT_NOT_FOUND: 'CAMPAIGN_LOT_NOT_FOUND',

  // ========================================
  // DOCUMENTS
  // ========================================
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',

  // ========================================
  // VETERINARIANS
  // ========================================
  VETERINARIAN_NOT_FOUND: 'VETERINARIAN_NOT_FOUND',

  // ========================================
  // PRODUCTS (unified)
  // ========================================
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  PRODUCT_PACKAGING_NOT_FOUND: 'PRODUCT_PACKAGING_NOT_FOUND',

  // Legacy (deprecated - use PRODUCT_NOT_FOUND)
  MEDICAL_PRODUCT_NOT_FOUND: 'MEDICAL_PRODUCT_NOT_FOUND',
  VACCINE_NOT_FOUND: 'VACCINE_NOT_FOUND',

  // ========================================
  // ADMINISTRATION ROUTES
  // ========================================
  ADMINISTRATION_ROUTE_NOT_FOUND: 'ADMINISTRATION_ROUTE_NOT_FOUND',
  ADMINISTRATION_ROUTE_ALREADY_EXISTS: 'ADMINISTRATION_ROUTE_ALREADY_EXISTS',

  // ========================================
  // ALERT CONFIGURATIONS
  // ========================================
  ALERT_CONFIGURATION_NOT_FOUND: 'ALERT_CONFIGURATION_NOT_FOUND',

  // ========================================
  // FARM PREFERENCES
  // ========================================
  FARM_PREFERENCES_NOT_FOUND: 'FARM_PREFERENCES_NOT_FOUND',

  // ========================================
  // SYNC / GENERIC
  // ========================================
  VERSION_CONFLICT: 'VERSION_CONFLICT',
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  ENTITY_ALREADY_EXISTS: 'ENTITY_ALREADY_EXISTS',
  UNKNOWN_ENTITY_TYPE: 'UNKNOWN_ENTITY_TYPE',
  UNKNOWN_ACTION: 'UNKNOWN_ACTION',
  SYNC_CREATE_FAILED: 'SYNC_CREATE_FAILED',
  SYNC_UPDATE_FAILED: 'SYNC_UPDATE_FAILED',
  SYNC_DELETE_FAILED: 'SYNC_DELETE_FAILED',
  SYNC_CONFLICT: 'SYNC_CONFLICT',

  // ========================================
  // AUTHENTICATION / AUTHORIZATION
  // ========================================
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  FARM_ID_REQUIRED: 'FARM_ID_REQUIRED',
  FARM_ACCESS_DENIED: 'FARM_ACCESS_DENIED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // ========================================
  // VALIDATION
  // ========================================
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_UUID: 'INVALID_UUID',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',
  FIELD_REQUIRED: 'FIELD_REQUIRED',
  FIELD_TOO_LONG: 'FIELD_TOO_LONG',
  FIELD_TOO_SHORT: 'FIELD_TOO_SHORT',
  INVALID_ENUM_VALUE: 'INVALID_ENUM_VALUE',

  // ========================================
  // SYSTEM / NETWORK
  // ========================================
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
