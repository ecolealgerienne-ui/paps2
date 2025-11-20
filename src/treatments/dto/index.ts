import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TreatmentStatus } from '../../common/enums';

export class CreateTreatmentDto {
  @ApiProperty({ description: 'Treatment ID (UUID)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Animal ID' })
  @IsString()
  animalId: string;

  @ApiProperty({ description: 'Medical product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  productName: string;

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

  @ApiProperty({ description: 'Duration in days', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ enum: TreatmentStatus, default: 'completed', required: false })
  @IsOptional()
  @IsEnum(TreatmentStatus)
  status?: TreatmentStatus;

  @ApiProperty({ description: 'Withdrawal end date' })
  @IsDateString()
  withdrawalEndDate: string;

  @ApiProperty({ description: 'Cost', required: false })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTreatmentDto {
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
