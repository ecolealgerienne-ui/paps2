import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for AgeCategory
 *
 * CRITICAL: Nullable fields must use `| null`, NOT `?`
 * Prisma returns `string | null` for String?, not `string | undefined`
 */
export class AgeCategoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Unique code for the age category within a species',
    example: 'ADULT',
  })
  code: string;

  @ApiProperty({
    description: 'Species ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  speciesId: string;

  @ApiProperty({
    description: 'French name',
    example: 'Adulte',
  })
  nameFr: string;

  @ApiProperty({
    description: 'English name',
    example: 'Adult',
  })
  nameEn: string;

  @ApiProperty({
    description: 'Arabic name',
    example: 'بالغ',
  })
  nameAr: string;

  @ApiPropertyOptional({
    description: 'Optional description',
    example: 'Animal has reached full maturity',
    nullable: true,
  })
  description: string | null; // CRITICAL: | null, NOT ?

  @ApiProperty({
    description: 'Minimum age in days (inclusive)',
    example: 365,
  })
  ageMinDays: number;

  @ApiPropertyOptional({
    description: 'Maximum age in days (inclusive). Null means no upper limit.',
    example: 3650,
    nullable: true,
  })
  ageMaxDays: number | null; // CRITICAL: | null, NOT ?

  @ApiProperty({
    description: 'Display order for UI sorting',
    example: 1,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Whether this is the default age category for the species',
    example: false,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Whether the age category is active',
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
