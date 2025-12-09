import { IsString, IsOptional, IsDateString, IsEnum, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { AnimalStatus } from '../../common/enums';

/**
 * Report data types for export
 */
export enum ReportDataType {
  HERD_INVENTORY = 'herd_inventory',
  TREATMENTS = 'treatments',
  VACCINATIONS = 'vaccinations',
  GROWTH = 'growth',
  MOVEMENTS = 'movements',
}

/**
 * DTO for querying report data (bulk export)
 */
export class ReportDataQueryDto {
  @ApiPropertyOptional({
    description: 'Type of report data to export',
    enum: ReportDataType,
    default: ReportDataType.HERD_INVENTORY,
  })
  @IsOptional()
  @IsEnum(ReportDataType)
  type?: ReportDataType;

  @ApiPropertyOptional({ description: 'From date (ISO)' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'To date (ISO)' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by animal status (all = no filter)',
    enum: ['all', ...Object.values(AnimalStatus)],
    default: 'all',
  })
  @IsOptional()
  @IsIn(['all', ...Object.values(AnimalStatus)])
  animalStatus?: 'all' | AnimalStatus;

  @ApiPropertyOptional({
    description: 'Filter by lot IDs (comma-separated)',
    example: 'lot-uuid-1,lot-uuid-2',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map(s => s.trim()) : value))
  lotIds?: string[];

  @ApiPropertyOptional({ description: 'Filter by species ID' })
  @IsOptional()
  @IsString()
  speciesId?: string;
}
