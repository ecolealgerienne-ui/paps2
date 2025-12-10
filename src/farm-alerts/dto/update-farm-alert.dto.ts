// src/farm-alerts/dto/update-farm-alert.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { FarmAlertStatus, ReadPlatform } from '../types';

export class UpdateFarmAlertStatusDto {
  @ApiProperty({
    description: 'New status for the alert',
    enum: FarmAlertStatus,
    example: FarmAlertStatus.READ,
  })
  @IsEnum(FarmAlertStatus)
  status: FarmAlertStatus;

  @ApiPropertyOptional({
    description: 'Platform where the alert was read (required when marking as read)',
    enum: ReadPlatform,
    example: ReadPlatform.WEB,
  })
  @IsOptional()
  @IsEnum(ReadPlatform)
  readOn?: ReadPlatform;
}
