import { IsBoolean, IsInt, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating Alert Configuration (PHASE_14)
 * 1 configuration unique par ferme
 */
export class CreateAlertConfigurationDto {
  @ApiPropertyOptional({
    description: 'Enable email alerts',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enableEmailAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'Enable SMS alerts',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  enableSmsAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'Enable push notifications',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enablePushAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'Days before vaccination due to send reminder',
    default: 7,
    example: 7,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  vaccinationReminderDays?: number;

  @ApiPropertyOptional({
    description: 'Days before treatment due to send reminder',
    default: 3,
    example: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  treatmentReminderDays?: number;

  @ApiPropertyOptional({
    description: 'Days before health check due to send reminder',
    default: 30,
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  healthCheckReminderDays?: number;
}

/**
 * DTO for updating Alert Configuration (PHASE_14)
 */
export class UpdateAlertConfigurationDto {
  @ApiPropertyOptional({ description: 'Enable email alerts' })
  @IsOptional()
  @IsBoolean()
  enableEmailAlerts?: boolean;

  @ApiPropertyOptional({ description: 'Enable SMS alerts' })
  @IsOptional()
  @IsBoolean()
  enableSmsAlerts?: boolean;

  @ApiPropertyOptional({ description: 'Enable push notifications' })
  @IsOptional()
  @IsBoolean()
  enablePushAlerts?: boolean;

  @ApiPropertyOptional({ description: 'Days before vaccination due to send reminder' })
  @IsOptional()
  @IsInt()
  @Min(0)
  vaccinationReminderDays?: number;

  @ApiPropertyOptional({ description: 'Days before treatment due to send reminder' })
  @IsOptional()
  @IsInt()
  @Min(0)
  treatmentReminderDays?: number;

  @ApiPropertyOptional({ description: 'Days before health check due to send reminder' })
  @IsOptional()
  @IsInt()
  @Min(0)
  healthCheckReminderDays?: number;

  @ApiPropertyOptional({ description: 'Version for optimistic locking', example: 1 })
  @IsNumber()
  @IsOptional()
  version?: number;
}
