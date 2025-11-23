import { IsString, IsNotEmpty, IsOptional, IsBoolean, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCountryDto {
  @ApiProperty({
    description: 'Code ISO 3166-1 alpha-2',
    example: 'DZ'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{2}$/, { message: 'Code must be ISO 3166-1 alpha-2 (2 uppercase letters)' })
  code: string;

  @ApiProperty({ example: 'Algérie' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameFr: string;

  @ApiProperty({ example: 'Algeria' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameEn: string;

  @ApiProperty({ example: 'الجزائر' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameAr: string;

  @ApiPropertyOptional({ example: 'Africa' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  region?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
