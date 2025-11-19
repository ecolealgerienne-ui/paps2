import { IsString, IsOptional, IsBoolean, IsInt, IsNumber, Min, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateVaccineDto {
  @ApiProperty({ description: 'Vaccine name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Manufacturer', required: false })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ description: 'Target species (JSON array)', required: false })
  @IsOptional()
  @IsArray()
  targetSpecies?: string[];

  @ApiProperty({ description: 'Target diseases (JSON array)', required: false })
  @IsOptional()
  @IsArray()
  targetDiseases?: string[];

  @ApiProperty({ description: 'Standard dose', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  standardDose?: number;

  @ApiProperty({ description: 'Number of injections required', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  injectionsRequired?: number;

  @ApiProperty({ description: 'Interval between injections (days)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  injectionIntervalDays?: number;

  @ApiProperty({ description: 'Meat withdrawal days', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  meatWithdrawalDays?: number;

  @ApiProperty({ description: 'Milk withdrawal days', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  milkWithdrawalDays?: number;

  @ApiProperty({ description: 'Administration route', required: false })
  @IsOptional()
  @IsString()
  administrationRoute?: string;

  @ApiProperty({ description: 'Is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateVaccineDto {
  @ApiProperty({ description: 'Vaccine name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Manufacturer', required: false })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ description: 'Target species (JSON array)', required: false })
  @IsOptional()
  @IsArray()
  targetSpecies?: string[];

  @ApiProperty({ description: 'Target diseases (JSON array)', required: false })
  @IsOptional()
  @IsArray()
  targetDiseases?: string[];

  @ApiProperty({ description: 'Standard dose', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  standardDose?: number;

  @ApiProperty({ description: 'Number of injections required', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  injectionsRequired?: number;

  @ApiProperty({ description: 'Interval between injections (days)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  injectionIntervalDays?: number;

  @ApiProperty({ description: 'Meat withdrawal days', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  meatWithdrawalDays?: number;

  @ApiProperty({ description: 'Milk withdrawal days', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  milkWithdrawalDays?: number;

  @ApiProperty({ description: 'Administration route', required: false })
  @IsOptional()
  @IsString()
  administrationRoute?: string;

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryVaccineDto {
  @ApiProperty({ description: 'Search by name', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
