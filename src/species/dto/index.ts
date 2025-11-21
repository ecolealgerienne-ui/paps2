import { IsString, IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SUPPORTED_LANGUAGES } from '../../common/enums';

/**
 * DTO for creating a Species
 * Timestamps managed server-side (Reference entity - Option A)
 */
export class CreateSpeciesDto {
  @ApiProperty({ description: 'Species ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Species name in the specified language' })
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
}

/**
 * DTO for updating a Species
 * Timestamps managed server-side (Reference entity - Option A)
 */
export class UpdateSpeciesDto {
  @ApiProperty({ description: 'Species name in the specified language', required: false })
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
}
