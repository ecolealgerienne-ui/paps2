import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for linking/unlinking a Breed to/from a Country
 * PHASE_16: BreedCountries
 */
export class LinkBreedCountryDto {
  @ApiProperty({
    description: 'Breed ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  breedId: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'DZ'
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;
}
