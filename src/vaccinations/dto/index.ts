import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VaccinationType } from '../../common/enums';

export class CreateVaccinationDto {
  @ApiProperty({ description: 'Vaccination ID (UUID)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Animal ID' })
  @IsString()
  animalId: string;

  @ApiProperty({ description: 'Vaccine ID' })
  @IsString()
  vaccineId: string;

  @ApiProperty({ description: 'Veterinarian ID', required: false })
  @IsOptional()
  @IsString()
  veterinarianId?: string;

  @ApiProperty({ description: 'Administration route ID', required: false })
  @IsOptional()
  @IsString()
  routeId?: string;

  @ApiProperty({ description: 'Campaign ID', required: false })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiProperty({ enum: VaccinationType, description: 'Type of vaccination' })
  @IsEnum(VaccinationType)
  vaccinationType: VaccinationType;

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

  @ApiProperty({ description: 'Dosage amount', required: false })
  @IsOptional()
  @IsNumber()
  dosage?: number;

  @ApiProperty({ description: 'Dosage unit', required: false })
  @IsOptional()
  @IsString()
  dosageUnit?: string;

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
  @ApiProperty({ description: 'Vaccine ID', required: false })
  @IsOptional()
  @IsString()
  vaccineId?: string;

  @ApiProperty({ description: 'Veterinarian ID', required: false })
  @IsOptional()
  @IsString()
  veterinarianId?: string;

  @ApiProperty({ description: 'Administration route ID', required: false })
  @IsOptional()
  @IsString()
  routeId?: string;

  @ApiProperty({ enum: VaccinationType, required: false })
  @IsOptional()
  @IsEnum(VaccinationType)
  vaccinationType?: VaccinationType;

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

  @ApiProperty({ description: 'Dosage amount', required: false })
  @IsOptional()
  @IsNumber()
  dosage?: number;

  @ApiProperty({ description: 'Dosage unit', required: false })
  @IsOptional()
  @IsString()
  dosageUnit?: string;

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

  @ApiProperty({ description: 'Filter by vaccine ID', required: false })
  @IsOptional()
  @IsString()
  vaccineId?: string;

  @ApiProperty({ enum: VaccinationType, required: false })
  @IsOptional()
  @IsEnum(VaccinationType)
  vaccinationType?: VaccinationType;

  @ApiProperty({ description: 'From date', required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ description: 'To date', required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
