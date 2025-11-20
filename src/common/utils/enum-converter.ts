/**
 * Enum value mappings for converting between Flutter app format (camelCase)
 * and database format (snake_case)
 *
 * Based on BACKEND_DELTA.md section 4: Conversion des Enums
 */

export const ENUM_MAPPINGS = {
  // Movement.movementType
  movement_type: {
    'temporaryOut': 'temporary_out',
    'temporaryReturn': 'temporary_return',
    // Others are identical
    'birth': 'birth',
    'purchase': 'purchase',
    'sale': 'sale',
    'death': 'death',
    'slaughter': 'slaughter',
    'exit': 'exit',
    'entry': 'entry',
  },

  // Breeding.method
  breeding_method: {
    'natural': 'natural',
    'artificialInsemination': 'artificial_insemination',
    'embryoTransfer': 'embryo_transfer',
  },

  // Document.type
  document_type: {
    'passport': 'passport',
    'certificate': 'certificate',
    'invoice': 'invoice',
    'transportCert': 'transport_cert',
    'breedingCert': 'breeding_cert',
    'vetReport': 'vet_report',
    'other': 'other',
  },

  // Animal.status
  animal_status: {
    'draft': 'draft',
    'alive': 'alive',
    'sold': 'sold',
    'dead': 'dead',
    'slaughtered': 'slaughtered',
    'onTemporaryMovement': 'on_temporary_movement',
  },

  // Movement.temporaryType (for completeness)
  temporary_type: {
    'loan': 'loan',
    'transhumance': 'transhumance',
    'boarding': 'boarding',
    'quarantine': 'quarantine',
    'exhibition': 'exhibition',
  },
} as const;

/**
 * Convert enum value from camelCase (app) to snake_case (database)
 * @param enumType - Type of enum (e.g., 'movement_type', 'breeding_method')
 * @param value - Value to convert
 * @returns Converted value or original if no mapping exists
 */
export function convertEnumValue(
  enumType: keyof typeof ENUM_MAPPINGS,
  value: string
): string {
  if (!value) return value;

  const mapping = ENUM_MAPPINGS[enumType];
  return mapping[value as keyof typeof mapping] || value;
}

/**
 * Convert enum value from snake_case (database) to camelCase (app)
 * @param enumType - Type of enum
 * @param value - Value to convert back
 * @returns Converted value or original if no mapping exists
 */
export function convertEnumValueReverse(
  enumType: keyof typeof ENUM_MAPPINGS,
  value: string
): string {
  if (!value) return value;

  const mapping = ENUM_MAPPINGS[enumType];

  // Find the key by value (reverse lookup)
  for (const [camelKey, snakeValue] of Object.entries(mapping)) {
    if (snakeValue === value) {
      return camelKey;
    }
  }

  return value;
}
