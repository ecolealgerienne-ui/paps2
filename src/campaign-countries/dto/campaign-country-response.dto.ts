import { ApiProperty } from '@nestjs/swagger';

/**
 * Nested NationalCampaign information in response
 */
class CampaignInfo {
  @ApiProperty({ description: 'Campaign UUID' })
  id: string;

  @ApiProperty({ description: 'Campaign code' })
  code: string;

  @ApiProperty({ description: 'Campaign name in French' })
  nameFr: string;

  @ApiProperty({ description: 'Campaign name in English' })
  nameEn: string;

  @ApiProperty({ description: 'Campaign name in Arabic' })
  nameAr: string;

  @ApiProperty({ description: 'Campaign type (vaccination, deworming, screening, etc.)' })
  type: string;
}

/**
 * Nested Country information in response
 */
class CountryInfo {
  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-2)' })
  code: string;

  @ApiProperty({ description: 'Country name in French' })
  nameFr: string;

  @ApiProperty({ description: 'Country name in English' })
  nameEn: string;

  @ApiProperty({ description: 'Country name in Arabic' })
  nameAr: string;

  @ApiProperty({ description: 'Region', required: false })
  region: string | null;
}

/**
 * DTO for Campaign-Country association response
 */
export class CampaignCountryResponseDto {
  @ApiProperty({ description: 'Association UUID' })
  id: string;

  @ApiProperty({ description: 'Campaign ID' })
  campaignId: string;

  @ApiProperty({ description: 'Country code' })
  countryCode: string;

  @ApiProperty({ description: 'Active status' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Campaign information', type: CampaignInfo, required: false })
  campaign?: CampaignInfo;

  @ApiProperty({ description: 'Country information', type: CountryInfo, required: false })
  country?: CountryInfo;
}
