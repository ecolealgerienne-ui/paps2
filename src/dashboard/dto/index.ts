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
}
