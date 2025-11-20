import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WeightSource } from '../../common/enums';

export class CreateWeightDto {
  @ApiProperty({ description: 'Weight ID (UUID)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Animal ID' })
  @IsString()
  animalId: string;

  @ApiProperty({ description: 'Weight in kg' })
  @IsNumber()
  weight: number;

  @ApiProperty({ description: 'Date when weight was recorded' })
  @IsDateString()
  recordedAt: string;

  @ApiProperty({ enum: WeightSource, default: 'manual', required: false })
  @IsOptional()
  @IsEnum(WeightSource)
  source?: WeightSource;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateWeightDto {
  @ApiProperty({ description: 'Weight in kg', required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ description: 'Date when weight was recorded', required: false })
  @IsOptional()
  @IsDateString()
  recordedAt?: string;

  @ApiProperty({ enum: WeightSource, required: false })
  @IsOptional()
  @IsEnum(WeightSource)
  source?: WeightSource;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Version for conflict detection', required: false })
  @IsOptional()
  version?: number;
}

export class QueryWeightDto {
  @ApiProperty({ description: 'Filter by animal ID', required: false })
  @IsOptional()
  @IsString()
  animalId?: string;

  @ApiProperty({ enum: WeightSource, required: false })
  @IsOptional()
  @IsEnum(WeightSource)
  source?: WeightSource;

  @ApiProperty({ description: 'From date', required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ description: 'To date', required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
