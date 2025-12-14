import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DataScope, ProductType } from '@prisma/client';

/**
 * Response DTO for Product entity (PHASE_15)
 * Handles both global and local products (scope pattern)
 * Simplified for MVP - all product info is denormalized
 */
export class ProductResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Product scope', enum: DataScope })
  scope: DataScope;

  @ApiPropertyOptional({ description: 'Farm ID (null for global, set for local)' })
  farmId: string | null;

  @ApiPropertyOptional({ description: 'Unique product code (required for global, optional for local)' })
  code: string | null;

  @ApiProperty({ description: 'Product name in French' })
  nameFr: string;

  @ApiPropertyOptional({ description: 'Product name in English' })
  nameEn: string | null;

  @ApiPropertyOptional({ description: 'Product name in Arabic' })
  nameAr: string | null;

  @ApiPropertyOptional({ description: 'Commercial/brand name' })
  commercialName: string | null;

  @ApiPropertyOptional({ description: 'Product description' })
  description: string | null;

  @ApiPropertyOptional({ description: 'Product type', enum: ProductType })
  type: ProductType | null;

  @ApiPropertyOptional({ description: 'ATCvet code (e.g., QJ01MA90)' })
  atcVetCode: string | null;

  @ApiPropertyOptional({ description: 'Manufacturer name' })
  manufacturer: string | null;

  @ApiPropertyOptional({ description: 'Form (injectable, oral, topical, etc.) - legacy, prefer therapeuticForm' })
  form: string | null;

  // Simplified fields (Phase 0 - denormalized data from schema)
  @ApiPropertyOptional({ description: 'Category code (antibiotics, vaccines, etc.)' })
  categoryCode: string | null;

  @ApiPropertyOptional({ description: 'Active substance/composition text' })
  composition: string | null;

  @ApiPropertyOptional({ description: 'Therapeutic form (comprimé, injectable, poudre)' })
  therapeuticForm: string | null;

  @ApiPropertyOptional({ description: 'Dosage (e.g., 100 mg/ml, 250 mg)' })
  dosage: string | null;

  @ApiPropertyOptional({ description: 'Administration route (oral, injectable, topique)' })
  administrationRoute: string | null;

  @ApiPropertyOptional({ description: 'Target species list', type: [String] })
  targetSpecies: string[];

  @ApiPropertyOptional({ description: 'Withdrawal period for meat in days' })
  withdrawalMeatDays: number | null;

  @ApiPropertyOptional({ description: 'Withdrawal period for milk in hours' })
  withdrawalMilkHours: number | null;

  @ApiProperty({ description: 'Prescription required flag', default: false })
  prescriptionRequired: boolean;

  @ApiPropertyOptional({ description: 'Target disease (for vaccines)' })
  targetDisease: string | null;

  @ApiPropertyOptional({ description: 'Immunity duration in days (for vaccines)' })
  immunityDurationDays: number | null;

  @ApiPropertyOptional({ description: 'Notes' })
  notes: string | null;

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
