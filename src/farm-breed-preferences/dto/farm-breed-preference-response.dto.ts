import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class BreedSummaryDto {
  @ApiProperty({ description: 'Breed ID' })
  id: string;

  @ApiProperty({ description: 'Breed code' })
  code: string;

  @ApiProperty({ description: 'French name' })
  nameFr: string;

  @ApiPropertyOptional({ description: 'English name' })
  nameEn: string | null;

  @ApiPropertyOptional({ description: 'Arabic name' })
  nameAr: string | null;

  @ApiProperty({ description: 'Species ID' })
  speciesId: string;
}

export class FarmBreedPreferenceResponseDto {
  @ApiProperty({ description: 'Unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Farm ID', example: '123e4567-e89b-12d3-a456-426614174001' })
  farmId: string;

  @ApiProperty({ description: 'Breed ID', example: '123e4567-e89b-12d3-a456-426614174002' })
  breedId: string;

  @ApiProperty({ description: 'Display order for sorting', example: 0 })
  displayOrder: number;

  @ApiProperty({ description: 'Whether this preference is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Version for optimistic locking', example: 1 })
  version: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp (soft delete)', nullable: true })
  deletedAt: Date | null;

  @ApiPropertyOptional({ description: 'Associated breed details', type: BreedSummaryDto })
  breed?: BreedSummaryDto;
}
