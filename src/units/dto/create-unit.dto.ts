import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsInt,
  IsBoolean,
  IsOptional,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UnitType } from '../../common/types/prisma-types';

export class CreateUnitDto {
  @ApiProperty({
    description: 'Unique code for the unit',
    example: 'mg',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[a-z0-9_/]+$/, {
    message: 'Code must contain only lowercase letters, numbers, underscores, and slashes',
  })
  code: string;

  @ApiProperty({
    description: 'Symbol displayed for the unit',
    example: 'mg',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  symbol: string;

  @ApiProperty({
    description: 'French name',
    example: 'Milligramme',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameFr: string;

  @ApiProperty({
    description: 'English name',
    example: 'Milligram',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameEn: string;

  @ApiProperty({
    description: 'Arabic name',
    example: 'ميليغرام',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameAr: string;

  @ApiProperty({
    description: 'Type of unit (mass, volume, concentration, count, percentage, other)',
    enum: UnitType,
    example: UnitType.mass,
  })
  @IsEnum(UnitType)
  unitType: UnitType;

  @ApiPropertyOptional({
    description: 'Optional description of the unit',
    example: 'Unit of mass equal to one thousandth of a gram',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Base unit code for conversions (e.g., "g" for mass units)',
    example: 'g',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  baseUnitCode?: string;

  @ApiPropertyOptional({
    description: 'Conversion factor to base unit (e.g., 0.001 for mg to g)',
    example: 0.001,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  conversionFactor?: number;

  @ApiPropertyOptional({
    description: 'Display order for UI sorting',
    example: 1,
    default: 0,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the unit is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
