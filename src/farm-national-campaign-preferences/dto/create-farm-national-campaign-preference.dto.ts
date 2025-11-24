import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateFarmNationalCampaignPreferenceDto {
  @ApiProperty({
    description: 'Farm ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  farmId: string;

  @ApiProperty({
    description: 'National campaign ID',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @IsUUID()
  campaignId: string;

  @ApiPropertyOptional({
    description: 'Is enrolled in the campaign',
    default: false,
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
