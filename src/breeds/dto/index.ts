import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for creating a Breed
 * Timestamps managed server-side (Reference entity - Option A)
 * PHASE_12: Added code field
 */
export class CreateBreedDto {
  @ApiProperty({ description: 'Breed ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Unique breed code (e.g., lacaune, holstein)' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Species ID' })
  @IsString()
  speciesId: string;

  @ApiProperty({ description: 'Breed name in French' })
  @IsString()
  nameFr: string;

  @ApiProperty({ description: 'Breed name in English' })
  @IsString()
  nameEn: string;

  @ApiProperty({ description: 'Breed name in Arabic' })
  @IsString()
  nameAr: string;

  @ApiProperty({ description: 'Breed description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Display order', required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({ description: 'Is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO for updating a Breed
 * Timestamps managed server-side (Reference entity - Option A)
 * PHASE_12: Added code field and version for optimistic locking
 */
export class UpdateBreedDto {
  @ApiProperty({ description: 'Unique breed code', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'Species ID', required: false })
  @IsOptional()
  @IsString()
  speciesId?: string;

  @ApiProperty({ description: 'Breed name in French', required: false })
  @IsOptional()
  @IsString()
  nameFr?: string;

  @ApiProperty({ description: 'Breed name in English', required: false })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({ description: 'Breed name in Arabic', required: false })
  @IsOptional()
  @IsString()
  nameAr?: string;

  @ApiProperty({ description: 'Breed description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Display order', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Current version for optimistic locking', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  version?: number;
}
