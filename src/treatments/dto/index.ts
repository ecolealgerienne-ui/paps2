import { IsString, IsOptional, IsDateString, IsNumber, IsEnum, IsArray, ValidateIf, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TreatmentStatus, TreatmentType } from '../../common/enums';
import { BaseSyncEntityDto } from '../../common/dto/base-sync-entity.dto';
import { IsXorField, IsDateAfterOrEqual } from '../../common/validators';

/**
 * DTO for creating a Treatment
 * Extends BaseSyncEntityDto to support offline-first architecture (farmId, created_at, updated_at)
 * Supports both single and batch treatments (animal_ids array)
 */
export class CreateTreatmentDto extends BaseSyncEntityDto {
  @ApiProperty({ description: 'Treatment ID (UUID)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ enum: TreatmentType, default: TreatmentType.TREATMENT, description: 'Treatment type (treatment or vaccination)' })
  @IsOptional()
  @IsEnum(TreatmentType)
  type?: TreatmentType;

  @ApiProperty({ description: 'Animal ID (single treatment)', required: false })
  @IsOptional()
  @IsString()
  animalId?: string;

  @ApiProperty({
    description: 'Animal IDs (batch treatment - for mass treatment)',
    type: [String],
    required: false,
    example: ['animal-uuid-1', 'animal-uuid-2', 'animal-uuid-3']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsXorField(['animal_ids', 'animalId'])
  animal_ids?: string[];

  @ApiProperty({ description: 'Medical product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  productName: string;

  @ApiPropertyOptional({ description: 'Product packaging ID (new workflow)' })
  @IsOptional()
  @IsString()
  packagingId?: string;

  @ApiPropertyOptional({ description: 'Therapeutic indication ID (new workflow)' })
  @IsOptional()
  @IsString()
  indicationId?: string;

  @ApiProperty({ description: 'Veterinarian ID', required: false })
  @IsOptional()
  @IsString()
  veterinarianId?: string;

  @ApiProperty({ description: 'Veterinarian name', required: false })
  @IsOptional()
  @IsString()
  veterinarianName?: string;

  @ApiProperty({ description: 'Campaign ID', required: false })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiProperty({ description: 'Administration route ID', required: false })
  @IsOptional()
  @IsString()
  routeId?: string;

  @ApiProperty({ description: 'Diagnosis', required: false })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({ description: 'Treatment date' })
  @IsDateString()
  treatmentDate: string;

  @ApiPropertyOptional({ description: 'Animal weight at treatment time (kg)' })
  @IsOptional()
  @IsNumber()
  animalWeightKg?: number;

  @ApiProperty({ description: 'Dose amount' })
  @IsNumber()
  dose: number;

  @ApiProperty({ description: 'Dosage amount', required: false })
  @IsOptional()
  @IsNumber()
  dosage?: number;

  @ApiProperty({ description: 'Dosage unit (ml, mg, etc.)', required: false })
  @IsOptional()
  @IsString()
  dosageUnit?: string;

  @ApiPropertyOptional({ description: 'Quantity administered (new workflow)' })
  @IsOptional()
  @IsNumber()
  quantityAdministered?: number;

  @ApiPropertyOptional({ description: 'Quantity unit ID (new workflow)' })
  @IsOptional()
  @IsString()
  quantityUnitId?: string;

  @ApiPropertyOptional({ description: 'Batch/lot number' })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Batch expiry date' })
  @IsOptional()
  @IsDateString()
  batchExpiryDate?: string;

  @ApiProperty({ description: 'Duration in days', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ enum: TreatmentStatus, default: 'completed', required: false })
  @IsOptional()
  @IsEnum(TreatmentStatus)
  status?: TreatmentStatus;

  @ApiPropertyOptional({
    description: 'Withdrawal end date (legacy). If not provided and autoCalculateWithdrawal=true, will be calculated from indication.',
  })
  @IsOptional()
  @IsDateString()
  withdrawalEndDate?: string;

  @ApiPropertyOptional({
    description: 'Auto-calculate withdrawal dates from therapeutic indication',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  autoCalculateWithdrawal?: boolean;

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
 * DTO for updating a Treatment
 * Extends BaseSyncEntityDto to support offline-first architecture
 */
export class UpdateTreatmentDto extends BaseSyncEntityDto {
  @ApiProperty({ description: 'Medical product ID', required: false })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ description: 'Product name', required: false })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ description: 'Veterinarian ID', required: false })
  @IsOptional()
  @IsString()
  veterinarianId?: string;

  @ApiProperty({ description: 'Veterinarian name', required: false })
  @IsOptional()
  @IsString()
  veterinarianName?: string;

  @ApiProperty({ description: 'Campaign ID', required: false })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiProperty({ description: 'Administration route ID', required: false })
  @IsOptional()
  @IsString()
  routeId?: string;

  @ApiProperty({ description: 'Diagnosis', required: false })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({ description: 'Treatment date', required: false })
  @IsOptional()
  @IsDateString()
  treatmentDate?: string;

  @ApiProperty({ description: 'Dose amount', required: false })
  @IsOptional()
  @IsNumber()
  dose?: number;

  @ApiProperty({ description: 'Dosage amount', required: false })
  @IsOptional()
  @IsNumber()
  dosage?: number;

  @ApiProperty({ description: 'Dosage unit', required: false })
  @IsOptional()
  @IsString()
  dosageUnit?: string;

  @ApiProperty({ description: 'Duration in days', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ enum: TreatmentStatus, required: false })
  @IsOptional()
  @IsEnum(TreatmentStatus)
  status?: TreatmentStatus;

  @ApiProperty({ description: 'Withdrawal end date', required: false })
  @IsOptional()
  @IsDateString()
  withdrawalEndDate?: string;

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

export class QueryTreatmentDto {
  @ApiProperty({ description: 'Filter by animal ID', required: false })
  @IsOptional()
  @IsString()
  animalId?: string;

  @ApiProperty({ enum: TreatmentStatus, required: false })
  @IsOptional()
  @IsEnum(TreatmentStatus)
  status?: TreatmentStatus;

  @ApiProperty({ description: 'From date', required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ description: 'To date', required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
