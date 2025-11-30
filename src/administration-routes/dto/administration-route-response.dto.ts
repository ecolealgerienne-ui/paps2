import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for AdministrationRoute
 *
 * CRITICAL: Nullable fields must use `| null`, NOT `?`
 * Prisma returns `string | null` for String?, not `string | undefined`
 */
export class AdministrationRouteResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Unique code',
    example: 'oral',
  })
  code: string;

  @ApiProperty({
    description: 'French name',
    example: 'Voie orale',
  })
  nameFr: string;

  @ApiProperty({
    description: 'English name',
    example: 'Oral route',
  })
  nameEn: string;

  @ApiProperty({
    description: 'Arabic name',
    example: 'الطريق الفموي',
  })
  nameAr: string;

  @ApiPropertyOptional({
    description: 'Abbreviation',
    example: 'PO',
    nullable: true,
  })
  abbreviation: string | null; // CRITICAL: | null, NOT ?

  @ApiPropertyOptional({
    description: 'Optional description',
    example: 'Administration by mouth',
    nullable: true,
  })
  description: string | null; // CRITICAL: | null, NOT ?

  @ApiProperty({
    description: 'Display order for UI sorting',
    example: 1,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Whether the route is active',
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
