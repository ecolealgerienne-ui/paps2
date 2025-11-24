import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

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
}
