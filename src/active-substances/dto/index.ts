import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateActiveSubstanceDto {
  @ApiPropertyOptional({ description: 'Custom ID (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Unique code', example: 'amoxicillin' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Substance name', example: 'Amoxicillin' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'French name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameFr?: string;

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

  @ApiPropertyOptional({ description: 'ATC veterinary code', example: 'QJ01CA04' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  atcCode?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateActiveSubstanceDto extends PartialType(CreateActiveSubstanceDto) {
  @ApiPropertyOptional({ description: 'Version for optimistic locking' })
  @IsOptional()
  @IsNumber()
  version?: number;
}

export class QueryActiveSubstanceDto {
  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Search in name/code' })
  @IsOptional()
  @IsString()
  search?: string;
}
