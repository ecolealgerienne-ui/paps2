import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductCountryDto {
  @ApiProperty({
    description: 'Product ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'DZ'
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiPropertyOptional({
    description: 'AMM number specific to this country',
    example: 'DZ/V/2024/001'
  })
  @IsString()
  @IsOptional()
  numeroAMM?: string;

  @ApiPropertyOptional({
    description: 'Is this association active',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
