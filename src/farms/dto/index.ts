import { IsString, IsOptional, IsBoolean, IsNumber, Matches, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a Farm (PHASE_03)
 */
export class CreateFarmDto {
  @ApiProperty({ description: 'Farm ID (UUID)', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Farm name', example: 'Ma Ferme' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Owner ID', example: 'user-123' })
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @ApiPropertyOptional({ description: 'Farm address', example: '123 Rue de la Ferme' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: 'Postal code', example: '81000' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'City', example: 'Albi' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'FR'
  })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{2}$/, { message: 'Country must be ISO 3166-1 alpha-2 (ex: FR, DZ)' })
  country?: string;

  @ApiPropertyOptional({
    description: 'Department code (2-3 characters)',
    example: '81'
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9A-Z]{2,3}$/, { message: 'Invalid department format' })
  department?: string;

  @ApiPropertyOptional({
    description: 'Commune code (INSEE - 5 digits)',
    example: '81004'
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{5}$/, { message: 'Commune must be 5 digits' })
  commune?: string;

  @ApiPropertyOptional({ description: 'Latitude', example: 43.9298 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude', example: 2.1479 })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  // Champs existants (compatibilité)
  @ApiProperty({ description: 'Farm location (legacy field)', example: 'Albi, France' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ description: 'Cheptel number', example: 'FR-81-12345' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  cheptelNumber?: string;

  @ApiPropertyOptional({ description: 'Group ID' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Group name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  groupName?: string;

  @ApiPropertyOptional({ description: 'Is default farm', example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Is farm active', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO for updating a Farm (PHASE_03)
 */
export class UpdateFarmDto {
  @ApiPropertyOptional({ description: 'Farm name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Farm address' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'FR'
  })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{2}$/, { message: 'Country must be ISO 3166-1 alpha-2 (ex: FR, DZ)' })
  country?: string;

  @ApiPropertyOptional({
    description: 'Department code (2-3 characters)',
    example: '81'
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9A-Z]{2,3}$/, { message: 'Invalid department format' })
  department?: string;

  @ApiPropertyOptional({
    description: 'Commune code (INSEE - 5 digits)',
    example: '81004'
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{5}$/, { message: 'Commune must be 5 digits' })
  commune?: string;

  @ApiPropertyOptional({ description: 'Latitude' })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  // Champs existants
  @ApiPropertyOptional({ description: 'Farm location (legacy field)' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Owner ID' })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Cheptel number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  cheptelNumber?: string;

  @ApiPropertyOptional({ description: 'Group ID' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Group name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  groupName?: string;

  @ApiPropertyOptional({ description: 'Is default farm' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Is farm active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Version for optimistic locking', example: 1 })
  @IsOptional()
  @IsNumber()
  version?: number;
}

/**
 * DTO for querying Farms (PHASE_03)
 */
export class QueryFarmDto {
  @ApiPropertyOptional({ description: 'Search by name or location' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by owner ID' })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Filter by group ID' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Filter by default status' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by country code (ISO 3166-1 alpha-2)', example: 'FR' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'Country must be ISO 3166-1 alpha-2' })
  country?: string;

  @ApiPropertyOptional({ description: 'Filter by department code', example: '81' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9A-Z]{2,3}$/, { message: 'Invalid department format' })
  department?: string;

  @ApiPropertyOptional({ description: 'Include deleted farms', default: false })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}

/**
 * DTO for toggling farm active status
 */
export class ToggleActiveFarmDto {
  @ApiProperty({ description: 'Active status', example: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
