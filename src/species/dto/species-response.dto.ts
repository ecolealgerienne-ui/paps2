import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for Species
 *
 * CRITICAL: Nullable fields must use `| null`, NOT `?`
 * Prisma returns `string | null` for String?, not `string | undefined`
 */
export class SpeciesResponseDto {
  @ApiProperty({
    description: 'Unique species identifier',
    example: 'bovine',
  })
  id: string;

  @ApiProperty({
    description: 'French name',
    example: 'Bovin',
  })
  nameFr: string;

  @ApiProperty({
    description: 'English name',
    example: 'Bovine',
  })
  nameEn: string;

  @ApiProperty({
    description: 'Arabic name',
    example: 'بقري',
  })
  nameAr: string;

  @ApiProperty({
    description: 'Icon identifier',
    example: 'cow',
  })
  icon: string;

  @ApiProperty({
    description: 'Display order',
    example: 1,
  })
  displayOrder: number;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Famille des bovins incluant vaches, taureaux, etc.',
    nullable: true,
  })
  description: string | null; // CRITICAL: | null, NOT ?

  @ApiPropertyOptional({
    description: 'Scientific name',
    example: 'Bos taurus',
    nullable: true,
  })
  scientificName: string | null; // CRITICAL: | null, NOT ?

  @ApiProperty({
    description: 'Version number for optimistic locking',
    example: 1,
  })
  version: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-11-30T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-30T10:05:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Soft delete timestamp',
    example: null,
    nullable: true,
  })
  deletedAt: Date | null; // CRITICAL: | null, NOT ?
}
