import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BreedResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Unique breed code' })
  code: string;

  @ApiProperty({ description: 'Species ID' })
  speciesId: string;

  @ApiProperty({ description: 'Breed name in French' })
  nameFr: string;

  @ApiProperty({ description: 'Breed name in English' })
  nameEn: string;

  @ApiProperty({ description: 'Breed name in Arabic' })
  nameAr: string;

  @ApiPropertyOptional({ description: 'Breed description' })
  description: string | null;

  @ApiProperty({ description: 'Display order' })
  displayOrder: number;

  @ApiProperty({ description: 'Active status' })
  isActive: boolean;

  @ApiProperty({ description: 'Version for optimistic locking' })
  version: number;

  @ApiPropertyOptional({ description: 'Soft delete timestamp' })
  deletedAt: Date | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
