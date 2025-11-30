import { IsString, IsOptional, IsInt, IsBoolean, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for updating a breed
 *
 * Excludes:
 * - code: Cannot be changed (unique identifier)
 * - speciesId: Cannot be changed (core relationship)
 */
export class UpdateBreedDto {
  @ApiPropertyOptional({ description: 'Breed name in French' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameFr?: string;

  @ApiPropertyOptional({ description: 'Breed name in English' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameEn?: string;

  @ApiPropertyOptional({ description: 'Breed name in Arabic' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameAr?: string;

  @ApiPropertyOptional({ description: 'Breed description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Version for optimistic locking', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  version?: number;
}
