import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for linking/unlinking a NationalCampaign to/from a Country
 * PHASE_19: CampaignCountries
 */
export class LinkCampaignCountryDto {
  @ApiProperty({
    description: 'Campaign ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'DZ'
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;
}
