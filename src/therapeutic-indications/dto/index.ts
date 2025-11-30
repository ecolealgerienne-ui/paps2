import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// =============================================================================
// CREATE DTO
// =============================================================================
export class CreateTherapeuticIndicationDto {
  @ApiPropertyOptional({ description: 'UUID (optional)' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ description: 'Country code (null = universal rule)' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ description: 'Species ID' })
  @IsUUID()
  speciesId: string;

  @ApiPropertyOptional({ description: 'Age category ID (null = all ages)' })
  @IsOptional()
  @IsUUID()
  ageCategoryId?: string;

  @ApiProperty({ description: 'Administration route ID' })
  @IsUUID()
  routeId: string;

  // Dosage
  @ApiPropertyOptional({ description: 'Minimum dose (mg/kg)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  doseMin?: number;

  @ApiPropertyOptional({ description: 'Maximum dose (mg/kg)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  doseMax?: number;

  @ApiPropertyOptional({ description: 'Dose unit ID' })
  @IsOptional()
  @IsUUID()
  doseUnitId?: string;

  @ApiPropertyOptional({ description: 'Original RCP dose text' })
  @IsOptional()
  @IsString()
  doseOriginalText?: string;

  @ApiPropertyOptional({ description: 'Protocol duration in days' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  protocolDurationDays?: number;

  // Withdrawal times (CRITICAL for traceability)
  @ApiProperty({ description: 'Withdrawal time for meat (days)' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  withdrawalMeatDays: number;

  @ApiPropertyOptional({ description: 'Withdrawal time for milk (days)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  withdrawalMilkDays?: number;

  // Validation
  @ApiPropertyOptional({ description: 'Is verified by expert', default: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Validation notes' })
  @IsOptional()
  @IsString()
  validationNotes?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// =============================================================================
// UPDATE DTO
// =============================================================================
export class UpdateTherapeuticIndicationDto {
  @ApiPropertyOptional({ description: 'Minimum dose' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  doseMin?: number;

  @ApiPropertyOptional({ description: 'Maximum dose' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  doseMax?: number;

  @ApiPropertyOptional({ description: 'Dose unit ID' })
  @IsOptional()
  @IsUUID()
  doseUnitId?: string;

  @ApiPropertyOptional({ description: 'Original RCP dose text' })
  @IsOptional()
  @IsString()
  doseOriginalText?: string;

  @ApiPropertyOptional({ description: 'Protocol duration in days' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  protocolDurationDays?: number;

  @ApiPropertyOptional({ description: 'Withdrawal time for meat (days)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  withdrawalMeatDays?: number;

  @ApiPropertyOptional({ description: 'Withdrawal time for milk (days)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  withdrawalMilkDays?: number;

  @ApiPropertyOptional({ description: 'Is verified' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Validation notes' })
  @IsOptional()
  @IsString()
  validationNotes?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Version for conflict management' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;
}

// =============================================================================
// QUERY DTO
// =============================================================================
export class QueryTherapeuticIndicationDto {
  @ApiPropertyOptional({ description: 'Filter by product ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: 'Filter by species ID' })
  @IsOptional()
  @IsUUID()
  speciesId?: string;

  @ApiPropertyOptional({ description: 'Filter by country code' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({ description: 'Filter by route ID' })
  @IsOptional()
  @IsUUID()
  routeId?: string;

  @ApiPropertyOptional({ description: 'Filter verified only' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

// Export response DTO
export * from './therapeutic-indication-response.dto';
