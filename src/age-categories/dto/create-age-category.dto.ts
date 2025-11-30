import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  IsBoolean,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateAgeCategoryDto {
  @ApiProperty({
    description: 'Unique code for the age category within a species',
    example: 'ADULT',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'Code must contain only uppercase letters, numbers, and underscores',
  })
  code: string;

  @ApiProperty({
    description: 'Species ID this age category belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  speciesId: string;

  @ApiProperty({
    description: 'French name',
    example: 'Adulte',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameFr: string;

  @ApiProperty({
    description: 'English name',
    example: 'Adult',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameEn: string;

  @ApiProperty({
    description: 'Arabic name',
    example: 'بالغ',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameAr: string;

  @ApiPropertyOptional({
    description: 'Optional description of the age category',
    example: 'Animal has reached full maturity',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Minimum age in days (inclusive)',
    example: 365,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  ageMinDays: number;

  @ApiPropertyOptional({
    description: 'Maximum age in days (inclusive). Null means no upper limit.',
    example: 3650,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  ageMaxDays?: number;

  @ApiPropertyOptional({
    description: 'Display order for UI sorting',
    example: 1,
    default: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether this is the default age category for the species',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the age category is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
