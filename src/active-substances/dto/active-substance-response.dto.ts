import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for ActiveSubstance
 *
 * CRITICAL: Nullable fields must use `| null`, NOT `?`
 * Prisma returns `string | null` for String?, not `string | undefined`
 */
export class ActiveSubstanceResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Unique code',
    example: 'amoxicillin',
  })
  code: string;

  @ApiProperty({
    description: 'International name (INN)',
    example: 'Amoxicillin',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'French name',
    example: 'Amoxicilline',
    nullable: true,
  })
  nameFr: string | null; // CRITICAL: | null, NOT ?

  @ApiPropertyOptional({
    description: 'English name',
    example: 'Amoxicillin',
    nullable: true,
  })
  nameEn: string | null; // CRITICAL: | null, NOT ?

  @ApiPropertyOptional({
    description: 'Arabic name',
    example: 'أموكسيسيلين',
    nullable: true,
  })
  nameAr: string | null; // CRITICAL: | null, NOT ?

  @ApiPropertyOptional({
    description: 'ATC/ATCvet code',
    example: 'QJ01CA04',
    nullable: true,
  })
  atcCode: string | null; // CRITICAL: | null, NOT ?

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Beta-lactam antibiotic',
    nullable: true,
  })
  description: string | null; // CRITICAL: | null, NOT ?

  @ApiProperty({
    description: 'Whether the substance is active',
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
