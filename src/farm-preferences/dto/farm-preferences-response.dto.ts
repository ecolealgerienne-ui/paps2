import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language, WeightUnit, Currency } from './index';

export class FarmPreferencesResponseDto {
  @ApiProperty({ description: 'Unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Farm ID', example: '123e4567-e89b-12d3-a456-426614174001' })
  farmId: string;

  @ApiPropertyOptional({ description: 'Default veterinarian ID', nullable: true })
  defaultVeterinarianId: string | null;

  @ApiPropertyOptional({ description: 'Default species ID', nullable: true })
  defaultSpeciesId: string | null;

  @ApiPropertyOptional({ description: 'Default breed ID', nullable: true })
  defaultBreedId: string | null;

  @ApiProperty({ description: 'Weight unit', enum: WeightUnit, example: 'kg' })
  weightUnit: WeightUnit;

  @ApiProperty({ description: 'Currency', enum: Currency, example: 'DZD' })
  currency: Currency;

  @ApiProperty({ description: 'Language', enum: Language, example: 'fr' })
  language: Language;

  @ApiProperty({ description: 'Date format', example: 'DD/MM/YYYY' })
  dateFormat: string;

  @ApiProperty({ description: 'Enable notifications', example: true })
  enableNotifications: boolean;

  @ApiProperty({ description: 'Version for optimistic locking', example: 1 })
  version: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp (soft delete)', nullable: true })
  deletedAt: Date | null;

  @ApiPropertyOptional({ description: 'Associated farm details' })
  farm?: object;
}
