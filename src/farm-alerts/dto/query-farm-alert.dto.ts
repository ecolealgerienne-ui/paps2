// src/farm-alerts/dto/query-farm-alert.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FarmAlertStatus } from '../types';

export class QueryFarmAlertDto {
  @ApiPropertyOptional({
    description: 'Filter by alert status',
    enum: FarmAlertStatus,
    example: FarmAlertStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(FarmAlertStatus)
  status?: FarmAlertStatus;

  @ApiPropertyOptional({
    description: 'Filter by alert category (from AlertTemplate)',
    example: 'vaccination',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by alert priority (from AlertTemplate)',
    example: 'high',
  })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({
    description: 'Filter by animal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  animalId?: string;

  @ApiPropertyOptional({
    description: 'Filter by lot ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  lotId?: string;

  @ApiPropertyOptional({
    description: 'Filter alerts triggered after this date',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter alerts triggered before this date',
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Field to order by',
    enum: ['triggeredAt', 'dueDate', 'priority'],
    default: 'triggeredAt',
  })
  @IsOptional()
  @IsEnum(['triggeredAt', 'dueDate', 'priority'])
  orderBy?: 'triggeredAt' | 'dueDate' | 'priority' = 'triggeredAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
