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
import { MedicalProductType } from '@prisma/client';

// =============================================================================
// CREATE DTO - For creating medical products (local scope by default)
// =============================================================================
export class CreateMedicalProductDto {
  @ApiPropertyOptional({ description: 'UUID généré par le client (optionnel)' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ description: 'Nom français (obligatoire)', example: 'Enrofloxacine 100mg' })
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

  @ApiPropertyOptional({ description: 'Code unique (obligatoire pour global)', example: 'enrofloxacine-100' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  code?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type de produit médical',
    enum: MedicalProductType,
    example: 'antibiotic',
  })
  @IsOptional()
  @IsEnum(MedicalProductType)
  type?: MedicalProductType;

  @ApiPropertyOptional({ description: 'Catégorie (antibiotic, vitamin, etc.)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Principe actif' })
  @IsOptional()
  @IsString()
  principeActif?: string;

  @ApiPropertyOptional({ description: 'Ingrédient actif' })
  @IsOptional()
  @IsString()
  activeIngredient?: string;

  @ApiPropertyOptional({ description: 'Laboratoire fabricant' })
  @IsOptional()
  @IsString()
  laboratoire?: string;

  @ApiPropertyOptional({ description: 'Fabricant' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Numéro AMM (Autorisation Mise sur le Marché)' })
  @IsOptional()
  @IsString()
  numeroAMM?: string;

  @ApiPropertyOptional({ description: 'Forme (tablet, injection, powder, etc.)' })
  @IsOptional()
  @IsString()
  form?: string;

  @ApiPropertyOptional({ description: 'Dosage' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dosage?: number;

  @ApiPropertyOptional({ description: 'Unité de dosage' })
  @IsOptional()
  @IsString()
  dosageUnit?: string;

  @ApiPropertyOptional({ description: 'Formule de dosage' })
  @IsOptional()
  @IsString()
  dosageFormula?: string;

  @ApiPropertyOptional({ description: 'Fréquence d\'administration' })
  @IsOptional()
  @IsString()
  administrationFrequency?: string;

  @ApiPropertyOptional({ description: 'Voie d\'administration par défaut' })
  @IsOptional()
  @IsString()
  defaultAdministrationRoute?: string;

  @ApiPropertyOptional({ description: 'Site d\'injection par défaut' })
  @IsOptional()
  @IsString()
  defaultInjectionSite?: string;

  @ApiPropertyOptional({ description: 'Durée standard du traitement (jours)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  standardCureDays?: number;

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

  @ApiPropertyOptional({ description: 'Conditions de stockage' })
  @IsOptional()
  @IsString()
  storageConditions?: string;

  @ApiPropertyOptional({ description: 'Notes de prescription' })
  @IsOptional()
  @IsString()
  prescription?: string;

  @ApiPropertyOptional({ description: 'Type de produit (treatment, vaccine)', default: 'treatment' })
  @IsOptional()
  @IsString()
  productType?: string;

  @ApiPropertyOptional({ description: 'Espèces cibles' })
  @IsOptional()
  @IsString()
  targetSpecies?: string;

  @ApiPropertyOptional({ description: 'Protocole de vaccination' })
  @IsOptional()
  @IsString()
  vaccinationProtocol?: string;

  @ApiPropertyOptional({ description: 'Jours de rappel (séparés par virgule)' })
  @IsOptional()
  @IsString()
  reminderDays?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

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
// CREATE GLOBAL DTO - For admin creating global products (scope='global')
// =============================================================================
export class CreateGlobalMedicalProductDto extends CreateMedicalProductDto {
  @ApiProperty({ description: 'Code unique (obligatoire pour global)', example: 'enrofloxacine-100' })
  @IsString()
  @MaxLength(100)
  declare code: string;

  @ApiProperty({
    description: 'Type de produit médical (obligatoire pour global)',
    enum: MedicalProductType,
    example: 'antibiotic',
  })
  @IsEnum(MedicalProductType)
  declare type: MedicalProductType;

  @ApiProperty({ description: 'Délai d\'attente viande (jours) - obligatoire pour global' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  declare withdrawalPeriodMeat: number;

  @ApiProperty({ description: 'Délai d\'attente lait (jours) - obligatoire pour global' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  declare withdrawalPeriodMilk: number;
}

// =============================================================================
// UPDATE DTO
// =============================================================================
export class UpdateMedicalProductDto {
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

  @ApiPropertyOptional({ enum: MedicalProductType })
  @IsOptional()
  @IsEnum(MedicalProductType)
  type?: MedicalProductType;

  @ApiPropertyOptional({ description: 'Catégorie' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Principe actif' })
  @IsOptional()
  @IsString()
  principeActif?: string;

  @ApiPropertyOptional({ description: 'Ingrédient actif' })
  @IsOptional()
  @IsString()
  activeIngredient?: string;

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

  @ApiPropertyOptional({ description: 'Forme' })
  @IsOptional()
  @IsString()
  form?: string;

  @ApiPropertyOptional({ description: 'Dosage' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dosage?: number;

  @ApiPropertyOptional({ description: 'Unité de dosage' })
  @IsOptional()
  @IsString()
  dosageUnit?: string;

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

  @ApiPropertyOptional({ description: 'Conditions de stockage' })
  @IsOptional()
  @IsString()
  storageConditions?: string;

  @ApiPropertyOptional({ description: 'Notes de prescription' })
  @IsOptional()
  @IsString()
  prescription?: string;

  @ApiPropertyOptional({ description: 'Type de produit' })
  @IsOptional()
  @IsString()
  productType?: string;

  @ApiPropertyOptional({ description: 'Espèces cibles' })
  @IsOptional()
  @IsString()
  targetSpecies?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

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
export class QueryMedicalProductDto {
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

  @ApiPropertyOptional({ description: 'Filtrer par catégorie' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: MedicalProductType })
  @IsOptional()
  @IsEnum(MedicalProductType)
  type?: MedicalProductType;

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
