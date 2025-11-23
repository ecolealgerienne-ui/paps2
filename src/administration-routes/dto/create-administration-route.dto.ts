import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdministrationRouteDto {
  @ApiProperty({
    description: 'Unique code for the administration route',
    example: 'oral',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    description: 'Name in French',
    example: 'Voie orale',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameFr: string;

  @ApiProperty({
    description: 'Name in English',
    example: 'Oral route',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameEn: string;

  @ApiProperty({
    description: 'Name in Arabic',
    example: 'الطريق الفموي',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameAr: string;

  @ApiProperty({
    description: 'Optional description',
    example: 'Medication administered by mouth',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
