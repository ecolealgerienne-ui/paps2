import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for creating a Species
 * Timestamps managed server-side (Reference entity - Option A)
 */
export class CreateSpeciesDto {
  @ApiProperty({ description: 'Species ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Species name in French' })
  @IsString()
  nameFr: string;

  @ApiProperty({ description: 'Species name in English' })
  @IsString()
  nameEn: string;

  @ApiProperty({ description: 'Species name in Arabic' })
  @IsString()
  nameAr: string;

  @ApiProperty({ description: 'Icon identifier', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Display order', required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({ description: 'Species description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO for updating a Species
 * Timestamps managed server-side (Reference entity - Option A)
 */
export class UpdateSpeciesDto {
  @ApiProperty({ description: 'Species name in French', required: false })
  @IsOptional()
  @IsString()
  nameFr?: string;

  @ApiProperty({ description: 'Species name in English', required: false })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({ description: 'Species name in Arabic', required: false })
  @IsOptional()
  @IsString()
  nameAr?: string;

  @ApiProperty({ description: 'Icon identifier', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Display order', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({ description: 'Species description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Version for optimistic locking', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  version?: number;
}
