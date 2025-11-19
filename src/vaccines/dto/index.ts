import { IsString, IsOptional, IsBoolean, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateVaccineDto {
  @ApiProperty({ description: 'Vaccine name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Target disease' })
  @IsString()
  disease: string;

  @ApiProperty({ description: 'Species ID', required: false })
  @IsOptional()
  @IsString()
  speciesId?: string;

  @ApiProperty({ description: 'Manufacturer', required: false })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ description: 'Dosage per animal', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dosagePerAnimal?: number;

  @ApiProperty({ description: 'Dosage unit', required: false })
  @IsOptional()
  @IsString()
  dosageUnit?: string;

  @ApiProperty({ description: 'Booster required', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  boosterRequired?: boolean;

  @ApiProperty({ description: 'Booster interval in days', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  boosterIntervalDays?: number;

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

  @ApiProperty({ description: 'Target disease', required: false })
  @IsOptional()
  @IsString()
  disease?: string;

  @ApiProperty({ description: 'Species ID', required: false })
  @IsOptional()
  @IsString()
  speciesId?: string;

  @ApiProperty({ description: 'Manufacturer', required: false })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ description: 'Dosage per animal', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dosagePerAnimal?: number;

  @ApiProperty({ description: 'Dosage unit', required: false })
  @IsOptional()
  @IsString()
  dosageUnit?: string;

  @ApiProperty({ description: 'Booster required', required: false })
  @IsOptional()
  @IsBoolean()
  boosterRequired?: boolean;

  @ApiProperty({ description: 'Booster interval in days', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  boosterIntervalDays?: number;

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

  @ApiProperty({ description: 'Filter by species', required: false })
  @IsOptional()
  @IsString()
  speciesId?: string;

  @ApiProperty({ description: 'Filter by disease', required: false })
  @IsOptional()
  @IsString()
  disease?: string;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
