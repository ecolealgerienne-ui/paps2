import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PharmacyStatsQueryDto {
  @ApiPropertyOptional({
    description: 'Analysis period',
    enum: ['30d', '3months', '6months', '12months'],
    default: '30d',
  })
  @IsOptional()
  @IsString()
  period?: '30d' | '3months' | '6months' | '12months';
}
