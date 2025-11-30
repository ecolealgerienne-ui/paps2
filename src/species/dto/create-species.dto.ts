import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpeciesDto {
  @ApiProperty({
    description: 'ID unique de l\'espèce (ex: "bovine", "ovine")',
    example: 'bovine'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  id: string;

  @ApiProperty({
    description: 'Nom en français',
    example: 'Bovin'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameFr: string;

  @ApiProperty({
    description: 'Nom en anglais',
    example: 'Bovine'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameEn: string;

  @ApiProperty({
    description: 'Nom en arabe',
    example: 'بقري'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameAr: string;

  @ApiPropertyOptional({
    description: 'Icône de l\'espèce',
    example: 'cow',
    default: ''
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({
    description: 'Ordre d\'affichage',
    example: 1
  })
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Description optionnelle',
    example: 'Famille des bovins incluant vaches, taureaux, etc.'
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Nom scientifique',
    example: 'Bos taurus'
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  scientificName?: string;
}
