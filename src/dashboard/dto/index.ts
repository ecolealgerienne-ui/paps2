import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActionsQueryDto {
  @ApiProperty({ description: 'Filter by urgency (urgent, this_week, planned, opportunities)', required: false })
  @IsOptional()
  @IsString()
  urgency?: 'urgent' | 'this_week' | 'planned' | 'opportunities';
}

export class DashboardStatsQueryDto {
  @ApiProperty({ description: 'From date (ISO)', required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ description: 'To date (ISO)', required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({ description: 'Analysis period', required: false, default: '6months', enum: ['30d', '3months', '6months', '12months', '24months'] })
  @IsOptional()
  @IsString()
  period?: '30d' | '3months' | '6months' | '12months' | '24months';
}
