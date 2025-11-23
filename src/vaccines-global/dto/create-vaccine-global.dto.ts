import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * ENUM pour les maladies ciblées par les vaccins
 * Correspond à l'ENUM Prisma VaccineTargetDisease
 */
export enum VaccineTargetDisease {
  BRUCELLOSIS = 'brucellosis',
  BLUETONGUE = 'bluetongue',
  FOOT_AND_MOUTH = 'foot_and_mouth',
  RABIES = 'rabies',
  ANTHRAX = 'anthrax',
  LUMPY_SKIN = 'lumpy_skin',
  PPR = 'ppr', // Peste Petits Ruminants
  SHEEP_POX = 'sheep_pox',
  ENTEROTOXEMIA = 'enterotoxemia',
  PASTEURELLOSIS = 'pasteurellosis',
  OTHER = 'other',
}

/**
 * DTO pour la création d'un vaccin global
 */
export class CreateVaccineGlobalDto {
  @ApiProperty({
    description: 'Code unique du vaccin',
    example: 'brucellose_b19',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @ApiProperty({
    description: 'Nom du vaccin en français',
    example: 'Brucellosis B19',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameFr: string;

  @ApiProperty({
    description: 'Nom du vaccin en anglais',
    example: 'Brucellosis B19',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameEn: string;

  @ApiProperty({
    description: 'Nom du vaccin en arabe',
    example: 'بروسيلا B19',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameAr: string;

  @ApiPropertyOptional({
    description: 'Description détaillée du vaccin',
    example: 'Vaccin contre la brucellose pour bovins et ovins',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Maladie ciblée par le vaccin',
    enum: VaccineTargetDisease,
    example: VaccineTargetDisease.BRUCELLOSIS,
  })
  @IsEnum(VaccineTargetDisease, {
    message: 'Target disease must be a valid VaccineTargetDisease enum value',
  })
  @IsNotEmpty()
  targetDisease: VaccineTargetDisease;

  @ApiPropertyOptional({
    description: 'Nom du laboratoire fabricant',
    example: 'Ceva',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  laboratoire?: string;

  @ApiPropertyOptional({
    description: "Numéro d'autorisation de mise sur le marché",
    example: 'FR/V/1234567',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  numeroAMM?: string;

  @ApiPropertyOptional({
    description: 'Dosage recommandé',
    example: '2 ml par animal',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  dosageRecommande?: string;

  @ApiPropertyOptional({
    description: "Durée d'immunité en jours",
    example: 365,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  dureeImmunite?: number;
}
