import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsOptional,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdministrationRouteDto {
  @ApiProperty({
    description: 'Unique code for the administration route',
    example: 'oral',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[a-z_]+$/, {
    message: 'Code must contain only lowercase letters and underscores',
  })
  code: string;

  @ApiProperty({
    description: 'French name',
    example: 'Voie orale',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameFr: string;

  @ApiProperty({
    description: 'English name',
    example: 'Oral route',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameEn: string;

  @ApiProperty({
    description: 'Arabic name',
    example: 'الطريق الفموي',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameAr: string;

  @ApiPropertyOptional({
    description: 'Abbreviation (e.g., PO, IM, IV, SC, TOP)',
    example: 'PO',
    maxLength: 10,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  abbreviation?: string;

  @ApiPropertyOptional({
    description: 'Optional description',
    example: 'Administration by mouth',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Display order for UI sorting',
    example: 1,
    default: 0,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the route is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
