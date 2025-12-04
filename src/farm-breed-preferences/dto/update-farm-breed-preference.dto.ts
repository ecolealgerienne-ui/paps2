import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFarmBreedPreferenceDto {
  @ApiPropertyOptional({ description: 'Display order for sorting', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Whether this preference is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Version for optimistic locking', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;
}
