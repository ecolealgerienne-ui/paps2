import { ApiProperty } from '@nestjs/swagger';

/**
 * Nested Breed information in response
 */
class BreedInfo {
  @ApiProperty({ description: 'Breed UUID' })
  id: string;

  @ApiProperty({ description: 'Breed code' })
  code: string;

  @ApiProperty({ description: 'Breed name in French' })
  nameFr: string;

  @ApiProperty({ description: 'Breed name in English' })
  nameEn: string;

  @ApiProperty({ description: 'Breed name in Arabic' })
  nameAr: string;
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
 * DTO for Breed-Country association response
 */
export class BreedCountryResponseDto {
  @ApiProperty({ description: 'Association UUID' })
  id: string;

  @ApiProperty({ description: 'Breed ID' })
  breedId: string;

  @ApiProperty({ description: 'Country code' })
  countryCode: string;

  @ApiProperty({ description: 'Active status' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Breed information', type: BreedInfo, required: false })
  breed?: BreedInfo;

  @ApiProperty({ description: 'Country information', type: CountryInfo, required: false })
  country?: CountryInfo;
}
