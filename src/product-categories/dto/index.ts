import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateProductCategoryDto {
  @ApiPropertyOptional({ description: 'Custom ID (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Unique code', example: 'antibiotics' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'French name', example: 'Antibiotiques' })
  @IsString()
  @MaxLength(200)
  nameFr: string;

  @ApiPropertyOptional({ description: 'English name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameEn?: string;

  @ApiPropertyOptional({ description: 'Arabic name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameAr?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductCategoryDto extends PartialType(CreateProductCategoryDto) {
  @ApiPropertyOptional({ description: 'Version for optimistic locking' })
  @IsOptional()
  @IsNumber()
  version?: number;
}

export class QueryProductCategoryDto {
  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
