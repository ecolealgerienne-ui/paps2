import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

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

  @ApiPropertyOptional({
    description: 'Animaux non pesés depuis X jours',
    example: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  notWeighedDays?: number;

  @ApiPropertyOptional({
    description: 'Poids minimum (kg) - filtre sur le dernier poids',
    example: 500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minWeight?: number;

  @ApiPropertyOptional({
    description: 'Poids maximum (kg) - filtre sur le dernier poids',
    example: 800,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxWeight?: number;

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

/**
 * DTO pour les statistiques d'animaux avec filtres
 * Permet de calculer les stats sur un sous-ensemble filtré
 */
export class QueryAnimalStatsDto {
  @ApiPropertyOptional({
    enum: ['alive', 'sold', 'dead', 'slaughtered', 'draft'],
    description: 'Filtrer par statut',
  })
  @IsOptional()
  @IsEnum(['alive', 'sold', 'dead', 'slaughtered', 'draft'])
  status?: string;

  @ApiPropertyOptional({ description: 'Filtrer par espèce' })
  @IsOptional()
  @IsString()
  speciesId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par race' })
  @IsOptional()
  @IsString()
  breedId?: string;

  @ApiPropertyOptional({ enum: ['male', 'female'], description: 'Filtrer par sexe' })
  @IsOptional()
  @IsEnum(['male', 'female'])
  sex?: string;

  @ApiPropertyOptional({
    description: 'Recherche dans EID, numéro officiel, ID visuel',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Nombre de jours pour considérer un animal comme non pesé (défaut: 30)',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  notWeighedDays?: number;

  @ApiPropertyOptional({
    description: 'Poids minimum (kg) - filtre sur le dernier poids',
    example: 500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minWeight?: number;

  @ApiPropertyOptional({
    description: 'Poids maximum (kg) - filtre sur le dernier poids',
    example: 800,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxWeight?: number;
}
