// src/farm-alerts/dto/bulk-update.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsUUID, ArrayMinSize } from 'class-validator';
import { FarmAlertStatus, ReadPlatform } from '../types';

/**
 * DTO pour la mise à jour en masse des alertes
 */
export class BulkUpdateFarmAlertsDto {
  @ApiProperty({
    description: 'List of alert IDs to update',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  alertIds: string[];

  @ApiProperty({
    description: 'New status to apply to all alerts',
    enum: FarmAlertStatus,
    example: FarmAlertStatus.READ,
  })
  @IsEnum(FarmAlertStatus)
  status: FarmAlertStatus;

  @ApiPropertyOptional({
    description: 'Platform where alerts were read (required when status is read)',
    enum: ReadPlatform,
    example: ReadPlatform.WEB,
  })
  @IsOptional()
  @IsEnum(ReadPlatform)
  readOn?: ReadPlatform;
}

/**
 * DTO pour marquer toutes les alertes comme lues
 */
export class MarkAllAsReadDto {
  @ApiProperty({
    description: 'Platform where alerts are being read',
    enum: ReadPlatform,
    example: ReadPlatform.WEB,
  })
  @IsEnum(ReadPlatform)
  readOn: ReadPlatform;

  @ApiPropertyOptional({
    description: 'Optional category filter (only mark alerts of this category)',
    example: 'vaccination',
  })
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Optional priority filter (only mark alerts of this priority)',
    example: 'high',
  })
  @IsOptional()
  priority?: string;
}

/**
 * Résultat d'une opération bulk
 */
export class BulkUpdateResultDto {
  @ApiProperty({
    description: 'Number of alerts successfully updated',
    example: 10,
  })
  updated: number;

  @ApiProperty({
    description: 'Number of alerts that failed to update',
    example: 0,
  })
  failed: number;

  @ApiPropertyOptional({
    description: 'IDs of alerts that failed to update',
    example: [],
    type: [String],
  })
  failedIds?: string[];
}
