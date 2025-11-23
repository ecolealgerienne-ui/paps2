import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateVaccineCountryDto {
  @ApiProperty({
    description: 'Vaccine ID (reference to vaccines_global)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  vaccineId: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'DZ',
    minLength: 2,
    maxLength: 2,
  })
  @IsString()
  @Length(2, 2, { message: 'Country code must be exactly 2 characters (ISO 3166-1 alpha-2)' })
  countryCode: string;

  @ApiPropertyOptional({
    description: 'AMM number (marketing authorization number)',
    example: 'DZ/V/2024/B19',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  numeroAMM?: string;

  @ApiPropertyOptional({
    description: 'Is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
