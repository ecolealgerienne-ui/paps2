import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * ENUMs locaux (PHASE_15)
 * Correspondent aux ENUMs Prisma mais définis ici car Prisma client pas encore généré
 */
export enum Language {
  fr = 'fr',
  en = 'en',
  ar = 'ar',
}

export enum WeightUnit {
  kg = 'kg',
  lb = 'lb',
}

export enum Currency {
  DZD = 'DZD',  // Dinar algérien
  EUR = 'EUR',  // Euro
  USD = 'USD',  // Dollar américain
  MAD = 'MAD',  // Dirham marocain
}

/**
 * DTO for creating Farm Preferences (PHASE_15)
 */
export class CreateFarmPreferencesDto {
  @ApiPropertyOptional({ description: 'Default veterinarian ID' })
  @IsOptional()
  @IsString()
  defaultVeterinarianId?: string;

  @ApiPropertyOptional({ description: 'Default species ID' })
  @IsOptional()
  @IsString()
  defaultSpeciesId?: string;

  @ApiPropertyOptional({ description: 'Default breed ID' })
  @IsOptional()
  @IsString()
  defaultBreedId?: string;

  @ApiPropertyOptional({
    description: 'Weight unit',
    enum: WeightUnit,
    default: WeightUnit.kg,
    example: 'kg',
  })
  @IsOptional()
  @IsEnum(WeightUnit)
  weightUnit?: WeightUnit;

  @ApiPropertyOptional({
    description: 'Currency',
    enum: Currency,
    default: Currency.DZD,
    example: 'DZD',
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({
    description: 'Language',
    enum: Language,
    default: Language.fr,
    example: 'fr',
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({
    description: 'Date format',
    default: 'DD/MM/YYYY',
    example: 'DD/MM/YYYY',
  })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiPropertyOptional({
    description: 'Enable notifications',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  enableNotifications?: boolean;
}

/**
 * DTO for updating Farm Preferences (PHASE_15)
 */
export class UpdateFarmPreferencesDto {
  @ApiPropertyOptional({ description: 'Default veterinarian ID' })
  @IsOptional()
  @IsString()
  defaultVeterinarianId?: string;

  @ApiPropertyOptional({ description: 'Default species ID' })
  @IsOptional()
  @IsString()
  defaultSpeciesId?: string;

  @ApiPropertyOptional({ description: 'Default breed ID' })
  @IsOptional()
  @IsString()
  defaultBreedId?: string;

  @ApiPropertyOptional({
    description: 'Weight unit (PHASE_15 ENUM)',
    enum: WeightUnit,
    example: 'kg',
  })
  @IsOptional()
  @IsEnum(WeightUnit, { message: 'Weight unit must be one of: kg, lb' })
  weightUnit?: WeightUnit;

  @ApiPropertyOptional({
    description: 'Currency (PHASE_15 ENUM)',
    enum: Currency,
    example: 'DZD',
  })
  @IsOptional()
  @IsEnum(Currency, { message: 'Currency must be one of: DZD, EUR, USD, MAD' })
  currency?: Currency;

  @ApiPropertyOptional({
    description: 'Language (PHASE_15 ENUM)',
    enum: Language,
    example: 'fr',
  })
  @IsOptional()
  @IsEnum(Language, { message: 'Language must be one of: fr, en, ar' })
  language?: Language;

  @ApiPropertyOptional({
    description: 'Date format',
    example: 'DD/MM/YYYY',
  })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiPropertyOptional({ description: 'Enable notifications' })
  @IsOptional()
  @IsBoolean()
  enableNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Version for optimistic locking', example: 1 })
  @IsNumber()
  @IsOptional()
  version?: number;
}

export { FarmPreferencesResponseDto } from './farm-preferences-response.dto';
