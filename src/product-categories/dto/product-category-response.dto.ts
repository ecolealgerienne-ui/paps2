import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for ProductCategory
 *
 * CRITICAL: Nullable fields must use `| null`, NOT `?`
 * Prisma returns `string | null` for String?, not `string | undefined`
 */
export class ProductCategoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Unique code',
    example: 'antibiotics',
  })
  code: string;

  @ApiProperty({
    description: 'French name',
    example: 'Antibiotiques',
  })
  nameFr: string;

  @ApiProperty({
    description: 'English name',
    example: 'Antibiotics',
  })
  nameEn: string;

  @ApiProperty({
    description: 'Arabic name',
    example: 'مضادات حيوية',
  })
  nameAr: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Antimicrobial medications',
    nullable: true,
  })
  description: string | null; // CRITICAL: | null, NOT ?

  @ApiProperty({
    description: 'Display order',
    example: 1,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Version number for optimistic locking',
    example: 1,
  })
  version: number;

  @ApiPropertyOptional({
    description: 'Soft delete timestamp',
    example: null,
    nullable: true,
  })
  deletedAt: Date | null; // CRITICAL: | null, NOT ?

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
}
