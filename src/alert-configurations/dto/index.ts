import { IsString, IsOptional, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating an AlertConfiguration
 * Timestamps managed server-side (Reference entity - Option A)
 */
export class CreateAlertConfigurationDto {
  @ApiProperty({ description: 'Alert configuration ID (UUID)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Farm ID' })
  @IsString()
  farmId: string;

  @ApiProperty({ description: 'Evaluation type' })
  @IsString()
  evaluationType: string;

  @ApiProperty({ description: 'Type (urgent, important, routine)' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Title i18n key' })
  @IsString()
  titleKey: string;

  @ApiProperty({ description: 'Message i18n key' })
  @IsString()
  messageKey: string;

  @ApiProperty({ description: 'Severity level (1-10)', required: false, default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  severity?: number;

  @ApiProperty({ description: 'Icon name' })
  @IsString()
  iconName: string;

  @ApiProperty({ description: 'Color hex code' })
  @IsString()
  colorHex: string;

  @ApiProperty({ description: 'Is enabled', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ description: 'Alert type (vaccination_due, treatment_due, etc.)', required: false })
  @IsOptional()
  @IsString()
  alertType?: string;

  @ApiProperty({ description: 'Is enabled (alternative)', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({ description: 'Days before due to alert', required: false, default: 7 })
  @IsOptional()
  @IsInt()
  @Min(0)
  daysBeforeDue?: number;

  @ApiProperty({ description: 'Priority (low, medium, high)', required: false, default: 'medium' })
  @IsOptional()
  @IsString()
  priority?: string;
}

export class UpdateAlertConfigurationDto {
  @ApiProperty({ description: 'Is enabled', required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ description: 'Is enabled (alternative)', required: false })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({ description: 'Severity level (1-10)', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  severity?: number;

  @ApiProperty({ description: 'Days before due to alert', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  daysBeforeDue?: number;

  @ApiProperty({ description: 'Priority (low, medium, high)', required: false })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({ description: 'Version for conflict detection', required: false })
  @IsOptional()
  version?: number;
}

export class QueryAlertConfigurationDto {
  @ApiProperty({ description: 'Filter by type', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Filter by category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Filter by enabled status', required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
