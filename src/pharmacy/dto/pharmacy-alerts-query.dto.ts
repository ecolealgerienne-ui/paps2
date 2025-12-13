import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PharmacyAlertsQueryDto {
  @ApiPropertyOptional({
    description: 'Days threshold for expiring soon alerts (default 30)',
    default: 30,
    minimum: 1,
    maximum: 90,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(90)
  daysThreshold?: number;
}
