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

  @ApiProperty({
    description: 'Nom du pays en français',
    example: 'Algérie'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameFr: string;

  @ApiProperty({
    description: 'Nom du pays en anglais',
    example: 'Algeria'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameEn: string;

  @ApiProperty({
    description: 'Nom du pays en arabe',
    example: 'الجزائر'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameAr: string;

  @ApiPropertyOptional({
    description: 'Région géographique',
    example: 'Africa',
    enum: ['Africa', 'Europe', 'Asia', 'Americas', 'Oceania']
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  region?: string;

  @ApiPropertyOptional({
    description: 'Pays actif ou non',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
