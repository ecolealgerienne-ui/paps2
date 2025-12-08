import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WeightSource } from '../../common/enums';
import { BaseSyncEntityDto } from '../../common/dto/base-sync-entity.dto';

/**
 * DTO for creating a Weight
 * Extends BaseSyncEntityDto to support offline-first architecture (farmId, created_at, updated_at)
 */
export class CreateWeightDto extends BaseSyncEntityDto {
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

  @ApiProperty({ description: 'Weight date' })
  @IsDateString()
  weightDate: string;

  @ApiProperty({ enum: WeightSource, default: 'manual', required: false })
  @IsOptional()
  @IsEnum(WeightSource)
  source?: WeightSource;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for updating a Weight
 * Extends BaseSyncEntityDto to support offline-first architecture
 */
export class UpdateWeightDto extends BaseSyncEntityDto {
  @ApiProperty({ description: 'Animal ID (to reassign weight)', required: false })
  @IsOptional()
  @IsString()
  animalId?: string;

  @ApiProperty({ description: 'Weight in kg', required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ description: 'Weight date', required: false })
  @IsOptional()
  @IsDateString()
  weightDate?: string;

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

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false, default: 50 })
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: 'Sort field', required: false, default: 'weightDate' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty({ description: 'Sort order', required: false, default: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
}

export class StatsQueryDto {
  @ApiProperty({ description: 'From date (ISO)', required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ description: 'To date (ISO)', required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
