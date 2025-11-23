import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateVaccineCountryDto {
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
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
