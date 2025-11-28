import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateAgeCategoryDto {
  @ApiPropertyOptional({ description: 'Custom ID (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Unique code within species', example: 'calf' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Species ID', example: 'bovine' })
  @IsString()
  speciesId: string;

  @ApiProperty({ description: 'French name', example: 'Veau' })
  @IsString()
  @MaxLength(200)
  nameFr: string;

  @ApiPropertyOptional({ description: 'English name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameEn?: string;

  @ApiPropertyOptional({ description: 'Arabic name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameAr?: string;

  @ApiPropertyOptional({ description: 'Minimum age in days', example: 0 })
  @IsOptional()
  @IsNumber()
  ageMinDays?: number;

  @ApiPropertyOptional({ description: 'Maximum age in days (null = no limit)', example: 180 })
  @IsOptional()
  @IsNumber()
  ageMaxDays?: number;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Is default category for species', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAgeCategoryDto extends PartialType(CreateAgeCategoryDto) {
  @ApiPropertyOptional({ description: 'Version for optimistic locking' })
  @IsOptional()
  @IsNumber()
  version?: number;
}

export class QueryAgeCategoryDto {
  @ApiPropertyOptional({ description: 'Filter by species' })
  @IsOptional()
  @IsString()
  speciesId?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
