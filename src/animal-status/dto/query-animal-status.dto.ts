import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { AnimalStatusType } from './create-animal-status.dto';

export class QueryAnimalStatusDto {
  @ApiPropertyOptional({
    enum: AnimalStatusType,
    description: 'Filtrer par type de statut',
  })
  @IsOptional()
  @IsEnum(AnimalStatusType)
  statusType?: AnimalStatusType;

  @ApiPropertyOptional({
    description: 'Ne retourner que les statuts actifs (endDate = null)',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activeOnly?: boolean;

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
}
