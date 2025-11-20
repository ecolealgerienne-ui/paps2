import { IsString, IsOptional, IsDateString, IsNumber, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BreedingMethod, BreedingStatus } from '../../common/enums';
import { Type } from 'class-transformer';
import { BaseSyncEntityDto } from '../../common/dto/base-sync-entity.dto';

/**
 * DTO for creating a Breeding
 * Extends BaseSyncEntityDto to support offline-first architecture (farmId, created_at, updated_at)
 */
export class CreateBreedingDto extends BaseSyncEntityDto {
  @ApiProperty({ description: 'Breeding ID (UUID)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Mother animal ID' })
  @IsString()
  motherId: string;

  @ApiProperty({ description: 'Father animal ID', required: false })
  @IsOptional()
  @IsString()
  fatherId?: string;

  @ApiProperty({ description: 'Father name (for external males)', required: false })
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiProperty({ enum: BreedingMethod, description: 'Breeding method' })
  @IsEnum(BreedingMethod)
  method: BreedingMethod;

  @ApiProperty({ description: 'Breeding date' })
  @IsDateString()
  breedingDate: string;

  @ApiProperty({ description: 'Expected birth date' })
  @IsDateString()
  expectedBirthDate: string;

  @ApiProperty({ description: 'Expected offspring count', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  expectedOffspringCount?: number;

  @ApiProperty({ description: 'Veterinarian ID', required: false })
  @IsOptional()
  @IsString()
  veterinarianId?: string;

  @ApiProperty({ description: 'Veterinarian name', required: false })
  @IsOptional()
  @IsString()
  veterinarianName?: string;

  @ApiProperty({ enum: BreedingStatus, default: 'planned', required: false })
  @IsOptional()
  @IsEnum(BreedingStatus)
  status?: BreedingStatus;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for updating a Breeding
 * Extends BaseSyncEntityDto to support offline-first architecture
 */
export class UpdateBreedingDto extends BaseSyncEntityDto {
  @ApiProperty({ description: 'Father animal ID', required: false })
  @IsOptional()
  @IsString()
  fatherId?: string;

  @ApiProperty({ description: 'Father name (for external males)', required: false })
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiProperty({ enum: BreedingMethod, required: false })
  @IsOptional()
  @IsEnum(BreedingMethod)
  method?: BreedingMethod;

  @ApiProperty({ description: 'Breeding date', required: false })
  @IsOptional()
  @IsDateString()
  breedingDate?: string;

  @ApiProperty({ description: 'Expected birth date', required: false })
  @IsOptional()
  @IsDateString()
  expectedBirthDate?: string;

  @ApiProperty({ description: 'Actual birth date', required: false })
  @IsOptional()
  @IsDateString()
  actualBirthDate?: string;

  @ApiProperty({ description: 'Expected offspring count', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  expectedOffspringCount?: number;

  @ApiProperty({ description: 'Offspring IDs (JSON array)', required: false })
  @IsOptional()
  @IsArray()
  offspringIds?: string[];

  @ApiProperty({ description: 'Veterinarian ID', required: false })
  @IsOptional()
  @IsString()
  veterinarianId?: string;

  @ApiProperty({ enum: BreedingStatus, required: false })
  @IsOptional()
  @IsEnum(BreedingStatus)
  status?: BreedingStatus;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Version for conflict detection', required: false })
  @IsOptional()
  version?: number;
}

export class QueryBreedingDto {
  @ApiProperty({ description: 'Filter by mother ID', required: false })
  @IsOptional()
  @IsString()
  motherId?: string;

  @ApiProperty({ description: 'Filter by father ID', required: false })
  @IsOptional()
  @IsString()
  fatherId?: string;

  @ApiProperty({ enum: BreedingStatus, required: false })
  @IsOptional()
  @IsEnum(BreedingStatus)
  status?: BreedingStatus;

  @ApiProperty({ description: 'From date', required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ description: 'To date', required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
