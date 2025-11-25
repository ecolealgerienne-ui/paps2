import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNumber,
  Min,
  IsDateString,
  IsEnum,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VaccineType } from '@prisma/client';

// =============================================================================
// CREATE DTO - For creating vaccines (local scope by default)
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

  @ApiPropertyOptional({ description: 'Nom commercial' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  commercialName?: string;

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
    description: 'Type de vaccin',
    enum: VaccineType,
    example: 'viral',
  })
  @IsOptional()
  @IsEnum(VaccineType)
  type?: VaccineType;

  @ApiPropertyOptional({ description: 'Maladie cible', example: 'Fièvre Aphteuse' })
  @IsOptional()
  @IsString()
  targetDisease?: string;

  @ApiPropertyOptional({ description: 'Espèces cibles (séparées par virgule)', example: 'bovine,ovine,caprine' })
  @IsOptional()
  @IsString()
  targetSpecies?: string;

  @ApiPropertyOptional({ description: 'Souche du vaccin' })
  @IsOptional()
  @IsString()
  strain?: string;

  @ApiPropertyOptional({ description: 'Laboratoire fabricant' })
  @IsOptional()
  @IsString()
  laboratoire?: string;

  @ApiPropertyOptional({ description: 'Fabricant' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Numéro AMM' })
  @IsOptional()
  @IsString()
  numeroAMM?: string;

  @ApiPropertyOptional({ description: 'Dosage', example: '2ml' })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiPropertyOptional({ description: 'Voie d\'administration' })
  @IsOptional()
  @IsString()
  administrationRoute?: string;

  @ApiPropertyOptional({ description: 'Site d\'injection' })
  @IsOptional()
  @IsString()
  injectionSite?: string;

  @ApiPropertyOptional({ description: 'Âge minimum (jours)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAgeInDays?: number;

  @ApiPropertyOptional({ description: 'Âge maximum (jours)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxAgeInDays?: number;

  @ApiPropertyOptional({ description: 'Intervalle entre doses (jours)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  intervalBetweenDoses?: number;

  @ApiPropertyOptional({ description: 'Nombre de doses requises' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numberOfDoses?: number;

  @ApiPropertyOptional({ description: 'Durée de protection (mois)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  protectionDurationMonths?: number;

  @ApiPropertyOptional({ description: 'Intervalle de rappel (mois)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  boosterIntervalMonths?: number;

  @ApiPropertyOptional({ description: 'Délai d\'attente viande (jours)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  withdrawalPeriodMeat?: number;

  @ApiPropertyOptional({ description: 'Délai d\'attente lait (jours)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  withdrawalPeriodMilk?: number;

  @ApiPropertyOptional({ description: 'Conditions de stockage' })
  @IsOptional()
  @IsString()
  storageConditions?: string;

  @ApiPropertyOptional({ description: 'Stock actuel', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @ApiPropertyOptional({ description: 'Stock minimum', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ description: 'Unité de stock' })
  @IsOptional()
  @IsString()
  stockUnit?: string;

  @ApiPropertyOptional({ description: 'Prix unitaire' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Devise' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Numéro de lot' })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Date d\'expiration' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Obligatoire (campagne nationale)', default: false })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

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
    description: 'Type de vaccin (obligatoire pour global)',
    enum: VaccineType,
    example: 'viral',
  })
  @IsEnum(VaccineType)
  declare type: VaccineType;

  @ApiProperty({ description: 'Maladie cible (obligatoire pour global)', example: 'Fièvre Aphteuse' })
  @IsString()
  declare targetDisease: string;
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

  @ApiPropertyOptional({ description: 'Nom commercial' })
  @IsOptional()
  @IsString()
  commercialName?: string;

  @ApiPropertyOptional({ description: 'Code unique' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  code?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: VaccineType })
  @IsOptional()
  @IsEnum(VaccineType)
  type?: VaccineType;

  @ApiPropertyOptional({ description: 'Maladie cible' })
  @IsOptional()
  @IsString()
  targetDisease?: string;

  @ApiPropertyOptional({ description: 'Espèces cibles' })
  @IsOptional()
  @IsString()
  targetSpecies?: string;

  @ApiPropertyOptional({ description: 'Souche' })
  @IsOptional()
  @IsString()
  strain?: string;

  @ApiPropertyOptional({ description: 'Laboratoire' })
  @IsOptional()
  @IsString()
  laboratoire?: string;

  @ApiPropertyOptional({ description: 'Fabricant' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Numéro AMM' })
  @IsOptional()
  @IsString()
  numeroAMM?: string;

  @ApiPropertyOptional({ description: 'Dosage' })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiPropertyOptional({ description: 'Voie d\'administration' })
  @IsOptional()
  @IsString()
  administrationRoute?: string;

  @ApiPropertyOptional({ description: 'Site d\'injection' })
  @IsOptional()
  @IsString()
  injectionSite?: string;

  @ApiPropertyOptional({ description: 'Âge minimum (jours)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAgeInDays?: number;

  @ApiPropertyOptional({ description: 'Âge maximum (jours)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxAgeInDays?: number;

  @ApiPropertyOptional({ description: 'Intervalle entre doses (jours)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  intervalBetweenDoses?: number;

  @ApiPropertyOptional({ description: 'Nombre de doses' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numberOfDoses?: number;

  @ApiPropertyOptional({ description: 'Durée de protection (mois)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  protectionDurationMonths?: number;

  @ApiPropertyOptional({ description: 'Intervalle de rappel (mois)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  boosterIntervalMonths?: number;

  @ApiPropertyOptional({ description: 'Délai d\'attente viande (jours)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  withdrawalPeriodMeat?: number;

  @ApiPropertyOptional({ description: 'Délai d\'attente lait (jours)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  withdrawalPeriodMilk?: number;

  @ApiPropertyOptional({ description: 'Conditions de stockage' })
  @IsOptional()
  @IsString()
  storageConditions?: string;

  @ApiPropertyOptional({ description: 'Stock actuel' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @ApiPropertyOptional({ description: 'Stock minimum' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ description: 'Unité de stock' })
  @IsOptional()
  @IsString()
  stockUnit?: string;

  @ApiPropertyOptional({ description: 'Prix unitaire' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Devise' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Numéro de lot' })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Date d\'expiration' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Obligatoire' })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

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

  @ApiPropertyOptional({ description: 'Filtrer par maladie cible' })
  @IsOptional()
  @IsString()
  targetDisease?: string;

  @ApiPropertyOptional({ enum: VaccineType })
  @IsOptional()
  @IsEnum(VaccineType)
  type?: VaccineType;

  @ApiPropertyOptional({ description: 'Filtrer par vaccins obligatoires' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isMandatory?: boolean;

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
