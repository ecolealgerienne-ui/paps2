import { IsString, IsOptional, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
