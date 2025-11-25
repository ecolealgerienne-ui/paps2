import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsInt,
  IsUUID,
  IsDateString,
  IsEnum,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// =============================================================================
// CREATE DTO - For creating veterinarians (local scope by default)
// =============================================================================
export class CreateVeterinarianDto {
  @ApiPropertyOptional({ description: 'UUID généré par le client (optionnel)' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ description: 'Prénom' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ description: 'Nom de famille' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ description: 'Titre (Dr., Prof., etc.)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  title?: string;

  @ApiProperty({ description: 'Numéro de licence' })
  @IsString()
  @MaxLength(100)
  licenseNumber: string;

  @ApiPropertyOptional({ description: 'Spécialités (séparées par virgule)' })
  @IsOptional()
  @IsString()
  specialties?: string;

  @ApiPropertyOptional({ description: 'Nom de la clinique' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  clinic?: string;

  @ApiProperty({ description: 'Numéro de téléphone' })
  @IsString()
  @MaxLength(50)
  phone: string;

  @ApiPropertyOptional({ description: 'Numéro mobile' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mobile?: string;

  @ApiPropertyOptional({ description: 'Adresse email' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ description: 'Adresse' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Ville' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Code postal' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Pays' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Code département (2-3 caractères)' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9A-Z]{2,3}$/, { message: 'Department must be 2-3 alphanumeric characters' })
  department?: string;

  @ApiPropertyOptional({ description: 'Code commune (5 chiffres)' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{5}$/, { message: 'Commune must be exactly 5 digits' })
  commune?: string;

  @ApiPropertyOptional({ description: 'Disponible', default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Service d\'urgence disponible', default: false })
  @IsOptional()
  @IsBoolean()
  emergencyService?: boolean;

  @ApiPropertyOptional({ description: 'Horaires de travail' })
  @IsOptional()
  @IsString()
  workingHours?: string;

  @ApiPropertyOptional({ description: 'Frais de consultation' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  consultationFee?: number;

  @ApiPropertyOptional({ description: 'Frais d\'urgence' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  emergencyFee?: number;

  @ApiPropertyOptional({ description: 'Devise' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Vétérinaire préféré', default: false })
  @IsOptional()
  @IsBoolean()
  isPreferred?: boolean;

  @ApiPropertyOptional({ description: 'Vétérinaire par défaut', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

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
// CREATE GLOBAL DTO - For admin creating global veterinarians (scope='global')
// =============================================================================
export class CreateGlobalVeterinarianDto extends CreateVeterinarianDto {
  @ApiProperty({ description: 'Numéro de licence (obligatoire et unique pour global)' })
  @IsString()
  @MaxLength(100)
  declare licenseNumber: string;

  @ApiProperty({ description: 'Département (obligatoire pour global)' })
  @IsString()
  @Matches(/^[0-9A-Z]{2,3}$/, { message: 'Department must be 2-3 alphanumeric characters' })
  declare department: string;
}

// =============================================================================
// UPDATE DTO
// =============================================================================
export class UpdateVeterinarianDto {
  @ApiPropertyOptional({ description: 'Prénom' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Nom de famille' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ description: 'Titre' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  title?: string;

  @ApiPropertyOptional({ description: 'Numéro de licence' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'Spécialités' })
  @IsOptional()
  @IsString()
  specialties?: string;

  @ApiPropertyOptional({ description: 'Nom de la clinique' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  clinic?: string;

  @ApiPropertyOptional({ description: 'Numéro de téléphone' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ description: 'Numéro mobile' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mobile?: string;

  @ApiPropertyOptional({ description: 'Adresse email' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ description: 'Adresse' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Ville' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Code postal' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Pays' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Code département' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9A-Z]{2,3}$/, { message: 'Department must be 2-3 alphanumeric characters' })
  department?: string;

  @ApiPropertyOptional({ description: 'Code commune' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{5}$/, { message: 'Commune must be exactly 5 digits' })
  commune?: string;

  @ApiPropertyOptional({ description: 'Disponible' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Service d\'urgence' })
  @IsOptional()
  @IsBoolean()
  emergencyService?: boolean;

  @ApiPropertyOptional({ description: 'Horaires de travail' })
  @IsOptional()
  @IsString()
  workingHours?: string;

  @ApiPropertyOptional({ description: 'Frais de consultation' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  consultationFee?: number;

  @ApiPropertyOptional({ description: 'Frais d\'urgence' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  emergencyFee?: number;

  @ApiPropertyOptional({ description: 'Devise' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Vétérinaire préféré' })
  @IsOptional()
  @IsBoolean()
  isPreferred?: boolean;

  @ApiPropertyOptional({ description: 'Vétérinaire par défaut' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Note' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rating?: number;

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
export class QueryVeterinarianDto {
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

  @ApiPropertyOptional({ description: 'Filtrer par département' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Filtrer par statut actif' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filtrer par disponibilité' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Filtrer par service d\'urgence' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  emergencyService?: boolean;

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

  @ApiPropertyOptional({ description: 'Champ de tri', default: 'lastName' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
