import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsDateString,
  IsEnum,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VaccineTargetDisease } from '@prisma/client';

// =============================================================================
// CREATE DTO - For creating vaccines (local scope by default)
// Based on Vaccine model in schema.prisma
// =============================================================================
export class CreateVaccineDto {
  @ApiPropertyOptional({ description: 'UUID généré par le client (optionnel)' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ description: 'Nom français (obligatoire)', example: 'Vaccin Fièvre Aphteuse' })
  @IsString()
  @MaxLength(255)
  nameFr: string;

  @ApiPropertyOptional({ description: 'Nom anglais' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEn?: string;

  @ApiPropertyOptional({ description: 'Nom arabe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameAr?: string;

  @ApiPropertyOptional({ description: 'Code unique (obligatoire pour global)', example: 'fmd-vaccine' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  code?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Maladie cible',
    enum: VaccineTargetDisease,
    example: 'foot_and_mouth',
  })
  @IsOptional()
  @IsEnum(VaccineTargetDisease)
  targetDisease?: VaccineTargetDisease;

  @ApiPropertyOptional({ description: 'Laboratoire fabricant' })
  @IsOptional()
  @IsString()
  laboratoire?: string;

  @ApiPropertyOptional({ description: 'Numéro AMM' })
  @IsOptional()
  @IsString()
  numeroAMM?: string;

  @ApiPropertyOptional({ description: 'Dosage', example: '2ml' })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiPropertyOptional({ description: 'Dosage recommandé' })
  @IsOptional()
  @IsString()
  dosageRecommande?: string;

  @ApiPropertyOptional({ description: 'Durée d\'immunité (jours)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  dureeImmunite?: number;

  @ApiPropertyOptional({ description: 'Actif', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Sync fields
  @ApiPropertyOptional({ description: 'Client creation timestamp' })
  @IsOptional()
  @IsDateString()
  created_at?: string;

  @ApiPropertyOptional({ description: 'Client update timestamp' })
  @IsOptional()
  @IsDateString()
  updated_at?: string;
}

// =============================================================================
// CREATE GLOBAL DTO - For admin creating global vaccines (scope='global')
// =============================================================================
export class CreateGlobalVaccineDto extends CreateVaccineDto {
  @ApiProperty({ description: 'Code unique (obligatoire pour global)', example: 'fmd-vaccine' })
  @IsString()
  @MaxLength(100)
  declare code: string;

  @ApiProperty({
    description: 'Maladie cible (obligatoire pour global)',
    enum: VaccineTargetDisease,
    example: 'foot_and_mouth',
  })
  @IsEnum(VaccineTargetDisease)
  declare targetDisease: VaccineTargetDisease;
}

// =============================================================================
// UPDATE DTO
// =============================================================================
export class UpdateVaccineDto {
  @ApiPropertyOptional({ description: 'Nom français' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameFr?: string;

  @ApiPropertyOptional({ description: 'Nom anglais' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEn?: string;

  @ApiPropertyOptional({ description: 'Nom arabe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameAr?: string;

  @ApiPropertyOptional({ description: 'Code unique' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  code?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Maladie cible',
    enum: VaccineTargetDisease,
  })
  @IsOptional()
  @IsEnum(VaccineTargetDisease)
  targetDisease?: VaccineTargetDisease;

  @ApiPropertyOptional({ description: 'Laboratoire' })
  @IsOptional()
  @IsString()
  laboratoire?: string;

  @ApiPropertyOptional({ description: 'Numéro AMM' })
  @IsOptional()
  @IsString()
  numeroAMM?: string;

  @ApiPropertyOptional({ description: 'Dosage' })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiPropertyOptional({ description: 'Dosage recommandé' })
  @IsOptional()
  @IsString()
  dosageRecommande?: string;

  @ApiPropertyOptional({ description: 'Durée d\'immunité (jours)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  dureeImmunite?: number;

  @ApiPropertyOptional({ description: 'Actif' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Version pour gestion des conflits' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;

  @ApiPropertyOptional({ description: 'Client update timestamp' })
  @IsOptional()
  @IsDateString()
  updated_at?: string;
}

// =============================================================================
// QUERY DTO - For filtering and pagination
// =============================================================================
export class QueryVaccineDto {
  @ApiPropertyOptional({ description: 'Recherche par nom' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par scope (global, local, all)',
    enum: ['global', 'local', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsString()
  scope?: 'global' | 'local' | 'all';

  @ApiPropertyOptional({
    description: 'Filtrer par maladie cible',
    enum: VaccineTargetDisease,
  })
  @IsOptional()
  @IsEnum(VaccineTargetDisease)
  targetDisease?: VaccineTargetDisease;

  @ApiPropertyOptional({ description: 'Filtrer par statut actif' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Page', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Limite par page', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Champ de tri', default: 'nameFr' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
