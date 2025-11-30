import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for TherapeuticIndication entity (PHASE_10)
 * Contains dosage info and withdrawal times for product/species/route combinations
 */
export class TherapeuticIndicationResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiPropertyOptional({ description: 'Country code (null = universal rule)' })
  countryCode: string | null;

  @ApiProperty({ description: 'Species ID' })
  speciesId: string;

  @ApiPropertyOptional({ description: 'Age category ID (null = all ages)' })
  ageCategoryId: string | null;

  @ApiProperty({ description: 'Administration route ID' })
  routeId: string;

  // Dosage
  @ApiPropertyOptional({ description: 'Minimum dose (mg/kg)' })
  doseMin: number | null;

  @ApiPropertyOptional({ description: 'Maximum dose (mg/kg)' })
  doseMax: number | null;

  @ApiPropertyOptional({ description: 'Dose unit ID' })
  doseUnitId: string | null;

  @ApiPropertyOptional({ description: 'Original RCP dose text' })
  doseOriginalText: string | null;

  @ApiPropertyOptional({ description: 'Protocol duration in days' })
  protocolDurationDays: number | null;

  // Withdrawal times (CRITICAL for traceability)
  @ApiProperty({ description: 'Withdrawal time for meat (days)' })
  withdrawalMeatDays: number;

  @ApiPropertyOptional({ description: 'Withdrawal time for milk (days)' })
  withdrawalMilkDays: number | null;

  // Validation
  @ApiProperty({ description: 'Is verified by expert' })
  isVerified: boolean;

  @ApiPropertyOptional({ description: 'Validation notes' })
  validationNotes: string | null;

  // Metadata
  @ApiProperty({ description: 'Active status' })
  isActive: boolean;

  @ApiProperty({ description: 'Version for optimistic locking' })
  version: number;

  @ApiPropertyOptional({ description: 'Soft delete timestamp' })
  deletedAt: Date | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
