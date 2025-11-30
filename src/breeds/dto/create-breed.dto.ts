import { IsString, IsOptional, IsInt, IsBoolean, IsNotEmpty, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBreedDto {
  @ApiProperty({ description: 'Unique breed code (e.g., lacaune, holstein)', example: 'holstein', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Species ID' })
  @IsString()
  @IsNotEmpty()
  speciesId: string;

  @ApiProperty({ description: 'Breed name in French', example: 'Holstein', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameFr: string;

  @ApiProperty({ description: 'Breed name in English', example: 'Holstein', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameEn: string;

  @ApiProperty({ description: 'Breed name in Arabic', example: 'هولشتاين', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameAr: string;

  @ApiPropertyOptional({ description: 'Breed description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display order', default: 0, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
