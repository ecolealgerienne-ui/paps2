import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
  IsNumber,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UnitType } from '../../common/types/prisma-types';

// =============================================================================
// CREATE DTO
// =============================================================================
export class CreateUnitDto {
  @ApiPropertyOptional({ description: 'UUID (optional)' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ description: 'Unique code', example: 'mg' })
  @IsString()
  @MaxLength(20)
  code: string;

  @ApiProperty({ description: 'Symbol', example: 'mg' })
  @IsString()
  @MaxLength(20)
  symbol: string;

  @ApiProperty({ description: 'Name (French)' })
  @IsString()
  @MaxLength(100)
  nameFr: string;

  @ApiProperty({ description: 'Name (English)' })
  @IsString()
  @MaxLength(100)
  nameEn: string;

  @ApiProperty({ description: 'Name (Arabic)' })
  @IsString()
  @MaxLength(100)
  nameAr: string;

  @ApiProperty({ description: 'Unit type', enum: UnitType })
  @IsEnum(UnitType)
  unitType: UnitType;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Base unit code for conversion', example: 'g' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  baseUnitCode?: string;

  @ApiPropertyOptional({ description: 'Conversion factor to base unit', example: 0.001 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  conversionFactor?: number;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// =============================================================================
// UPDATE DTO
// =============================================================================
export class UpdateUnitDto {
  @ApiPropertyOptional({ description: 'Symbol' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  symbol?: string;

  @ApiPropertyOptional({ description: 'Name (French)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameFr?: string;

  @ApiPropertyOptional({ description: 'Name (English)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameEn?: string;

  @ApiPropertyOptional({ description: 'Name (Arabic)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameAr?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Base unit code' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  baseUnitCode?: string;

  @ApiPropertyOptional({ description: 'Conversion factor' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  conversionFactor?: number;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

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
export class QueryUnitDto {
  @ApiPropertyOptional({ description: 'Filter by unit type', enum: UnitType })
  @IsOptional()
  @IsEnum(UnitType)
  unitType?: UnitType;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
