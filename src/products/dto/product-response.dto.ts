import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DataScope, ProductType } from '@prisma/client';

/**
 * Nested DTOs for relations
 */
class ProductCategoryInfo {
  @ApiProperty({ description: 'Category UUID' })
  id: string;

  @ApiProperty({ description: 'Category code' })
  code: string;

  @ApiProperty({ description: 'Category name in French' })
  nameFr: string;

  @ApiProperty({ description: 'Category name in English' })
  nameEn: string;

  @ApiProperty({ description: 'Category name in Arabic' })
  nameAr: string;
}

class ActiveSubstanceInfo {
  @ApiProperty({ description: 'Substance UUID' })
  id: string;

  @ApiProperty({ description: 'Substance code' })
  code: string;

  @ApiProperty({ description: 'International name (INN)' })
  name: string;

  @ApiPropertyOptional({ description: 'Substance name in French' })
  nameFr: string | null;

  @ApiPropertyOptional({ description: 'Substance name in English' })
  nameEn: string | null;

  @ApiPropertyOptional({ description: 'Substance name in Arabic' })
  nameAr: string | null;
}

/**
 * Response DTO for Product entity (PHASE_15)
 * Handles both global and local products (scope pattern)
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

  @ApiPropertyOptional({ description: 'Category ID' })
  categoryId: string | null;

  @ApiPropertyOptional({ description: 'Active substance ID' })
  substanceId: string | null;

  @ApiPropertyOptional({ description: 'ATCvet code (e.g., QJ01MA90)' })
  atcVetCode: string | null;

  @ApiPropertyOptional({ description: 'Manufacturer name' })
  manufacturer: string | null;

  @ApiPropertyOptional({ description: 'Form (injectable, oral, topical, etc.)' })
  form: string | null;

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

  // Optional relations (when included)
  @ApiPropertyOptional({ description: 'Product category', type: ProductCategoryInfo })
  category: ProductCategoryInfo | null;

  @ApiPropertyOptional({ description: 'Active substance', type: ActiveSubstanceInfo })
  substance: ActiveSubstanceInfo | null;
}
