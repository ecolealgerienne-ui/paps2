import { IsString, IsOptional, IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActiveSubstanceDto {
  @ApiProperty({
    description: 'Unique code',
    example: 'amoxicillin',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    description: 'International name (INN)',
    example: 'Amoxicillin',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    description: 'French name',
    example: 'Amoxicilline',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameFr?: string;

  @ApiPropertyOptional({
    description: 'English name',
    example: 'Amoxicillin',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameEn?: string;

  @ApiPropertyOptional({
    description: 'Arabic name',
    example: 'أموكسيسيلين',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameAr?: string;

  @ApiPropertyOptional({
    description: 'ATC/ATCvet code',
    example: 'QJ01CA04',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  atcCode?: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Beta-lactam antibiotic',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Active status',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
