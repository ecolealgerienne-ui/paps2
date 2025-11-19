import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVaccinationDto {
  @ApiProperty({ description: 'Vaccination ID (UUID)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Animal ID', required: false })
  @IsOptional()
  @IsString()
  animalId?: string;

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

  @ApiProperty({ description: 'Vaccination date' })
  @IsDateString()
  vaccinationDate: string;

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
}

export class UpdateVaccinationDto {
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
