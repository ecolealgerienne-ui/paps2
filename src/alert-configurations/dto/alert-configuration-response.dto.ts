import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AlertConfigurationResponseDto {
  @ApiProperty({ description: 'Unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Farm ID', example: '123e4567-e89b-12d3-a456-426614174001' })
  farmId: string;

  @ApiProperty({ description: 'Enable email alerts', example: true })
  enableEmailAlerts: boolean;

  @ApiProperty({ description: 'Enable SMS alerts', example: false })
  enableSmsAlerts: boolean;

  @ApiProperty({ description: 'Enable push notifications', example: true })
  enablePushAlerts: boolean;

  @ApiProperty({ description: 'Days before vaccination due to send reminder', example: 7 })
  vaccinationReminderDays: number;

  @ApiProperty({ description: 'Days before treatment due to send reminder', example: 3 })
  treatmentReminderDays: number;

  @ApiProperty({ description: 'Days before health check due to send reminder', example: 30 })
  healthCheckReminderDays: number;

  @ApiProperty({ description: 'Version for optimistic locking', example: 1 })
  version: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp (soft delete)', nullable: true })
  deletedAt: Date | null;

  @ApiPropertyOptional({ description: 'Associated farm details' })
  farm?: object;
}
