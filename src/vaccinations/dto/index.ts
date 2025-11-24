import { IsString, IsOptional, IsDateString, IsNumber, IsArray, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseSyncEntityDto } from '../../common/dto/base-sync-entity.dto';
import { IsXorField, IsDateAfterOrEqual } from '../../common/validators';

/**
 * DTO for creating a Vaccination
 * Extends BaseSyncEntityDto to support offline-first architecture (farmId, created_at, updated_at)
 * Supports both single and batch vaccinations (animal_ids array)
 */
export class CreateVaccinationDto extends BaseSyncEntityDto {
  @ApiProperty({ description: 'Vaccination ID (UUID)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Animal ID (single vaccination)', required: false })
  @IsOptional()
  @IsString()
  animalId?: string;

  @ApiProperty({ description: 'Animal IDs (legacy - comma-separated or JSON string)', required: false })
  @IsOptional()
  @IsString()
  animalIds?: string;

  @ApiProperty({
    description: 'Animal IDs (batch vaccination - for mass vaccination)',
    type: [String],
    required: false,
    example: ['animal-uuid-1', 'animal-uuid-2', 'animal-uuid-3']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsXorField(['animal_ids', 'animalId', 'animalIds'])
  animal_ids?: string[];

  @ApiProperty({ description: 'Vaccine name' })
  @IsString()
  vaccineName: string;

  @ApiProperty({ description: 'Vaccination type (obligatoire, recommandee, optionnelle)' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Disease' })
  @IsString()
  disease: string;

  @ApiProperty({ description: 'Veterinarian ID', required: false })
  @IsOptional()
  @IsString()
  veterinarianId?: string;

  @ApiProperty({ description: 'Veterinarian name', required: false })
  @IsOptional()
  @IsString()
  veterinarianName?: string;

  @ApiProperty({ description: 'Vaccination date' })
  @IsDateString()
  vaccinationDate: string;

  @ApiProperty({
    description: 'Next due date (must be >= vaccinationDate)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  @IsDateAfterOrEqual('vaccinationDate')
  nextDueDate?: string;

  @ApiProperty({ description: 'Batch number', required: false })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiProperty({ description: 'Expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ description: 'Dose' })
  @IsString()
  dose: string;

  @ApiProperty({ description: 'Administration route' })
  @IsString()
  administrationRoute: string;

  @ApiProperty({ description: 'Withdrawal period in days' })
  @IsNumber()
  withdrawalPeriodDays: number;

  @ApiProperty({ description: 'Dosage amount', required: false })
  @IsOptional()
  @IsNumber()
  dosage?: number;

  @ApiProperty({ description: 'Cost', required: false })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for updating a Vaccination
 * Extends BaseSyncEntityDto to support offline-first architecture
 */
export class UpdateVaccinationDto extends BaseSyncEntityDto {
  @ApiProperty({ description: 'Vaccine name', required: false })
  @IsOptional()
  @IsString()
  vaccineName?: string;

  @ApiProperty({ description: 'Vaccination type (obligatoire, recommandee, optionnelle)', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Disease', required: false })
  @IsOptional()
  @IsString()
  disease?: string;

  @ApiProperty({ description: 'Veterinarian ID', required: false })
  @IsOptional()
  @IsString()
  veterinarianId?: string;

  @ApiProperty({ description: 'Veterinarian name', required: false })
  @IsOptional()
  @IsString()
  veterinarianName?: string;

  @ApiProperty({ description: 'Vaccination date', required: false })
  @IsOptional()
  @IsDateString()
  vaccinationDate?: string;

  @ApiProperty({ description: 'Next due date', required: false })
  @IsOptional()
  @IsDateString()
  nextDueDate?: string;

  @ApiProperty({ description: 'Batch number', required: false })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiProperty({ description: 'Expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ description: 'Dose', required: false })
  @IsOptional()
  @IsString()
  dose?: string;

  @ApiProperty({ description: 'Administration route', required: false })
  @IsOptional()
  @IsString()
  administrationRoute?: string;

  @ApiProperty({ description: 'Withdrawal period in days', required: false })
  @IsOptional()
  @IsNumber()
  withdrawalPeriodDays?: number;

  @ApiProperty({ description: 'Dosage amount', required: false })
  @IsOptional()
  @IsNumber()
  dosage?: number;

  @ApiProperty({ description: 'Cost', required: false })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Version for conflict detection', required: false })
  @IsOptional()
  version?: number;
}

export class QueryVaccinationDto {
  @ApiProperty({ description: 'Filter by animal ID', required: false })
  @IsOptional()
  @IsString()
  animalId?: string;

  @ApiProperty({ description: 'Filter by type (obligatoire, recommandee, optionnelle)', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'From date', required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ description: 'To date', required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
