import { IsString, IsOptional, IsInt, Min, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SUPPORTED_LANGUAGES } from '../../common/enums';

/**
 * DTO for creating a Breed
 * Timestamps managed server-side (Reference entity - Option A)
 */
export class CreateBreedDto {
  @ApiProperty({ description: 'Breed ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Species ID' })
  @IsString()
  speciesId: string;

  @ApiProperty({ description: 'Breed name in the specified language' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Language code for the name',
    enum: ['fr', 'en', 'ar'],
    example: 'fr'
  })
  @IsString()
  @IsIn(SUPPORTED_LANGUAGES)
  lang: string;

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
 */
export class UpdateBreedDto {
  @ApiProperty({ description: 'Species ID', required: false })
  @IsOptional()
  @IsString()
  speciesId?: string;

  @ApiProperty({ description: 'Breed name in the specified language', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Language code for the name (required if name is provided)',
    enum: ['fr', 'en', 'ar'],
    example: 'fr',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_LANGUAGES)
  lang?: string;

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
}
