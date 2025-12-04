import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFarmNationalCampaignPreferenceDto {
  @ApiPropertyOptional({
    description: 'Is enrolled in the campaign',
  })
  @IsOptional()
  @IsBoolean()
  isEnrolled?: boolean;

  @ApiPropertyOptional({
    description: 'Enrollment date (ISO 8601)',
    example: '2024-11-24T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  enrolledAt?: string;

  @ApiPropertyOptional({ description: 'Version for optimistic locking', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;
}
