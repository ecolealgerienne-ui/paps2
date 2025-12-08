import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryAnimalDto {
  @ApiPropertyOptional({
    enum: ['alive', 'sold', 'dead', 'slaughtered', 'draft'],
  })
  @IsOptional()
  @IsEnum(['alive', 'sold', 'dead', 'slaughtered', 'draft'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  speciesId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  breedId?: string;

  @ApiPropertyOptional({ enum: ['male', 'female'], description: 'Filter by sex' })
  @IsOptional()
  @IsEnum(['male', 'female'])
  sex?: string;

  @ApiPropertyOptional({
    description: 'Recherche dans EID, numéro officiel, ID visuel',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsString()
  sort?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
