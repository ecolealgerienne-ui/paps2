import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitType } from '../../common/types/prisma-types';

/**
 * Response DTO for Unit
 *
 * CRITICAL: Nullable fields must use `| null`, NOT `?`
 * Prisma returns `string | null` for String?, not `string | undefined`
 */
export class UnitResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Unique code',
    example: 'mg',
  })
  code: string;

  @ApiProperty({
    description: 'Symbol displayed for the unit',
    example: 'mg',
  })
  symbol: string;

  @ApiProperty({
    description: 'French name',
    example: 'Milligramme',
  })
  nameFr: string;

  @ApiProperty({
    description: 'English name',
    example: 'Milligram',
  })
  nameEn: string;

  @ApiProperty({
    description: 'Arabic name',
    example: 'ميليغرام',
  })
  nameAr: string;

  @ApiProperty({
    description: 'Type of unit',
    enum: UnitType,
    example: UnitType.mass,
  })
  unitType: UnitType;

  @ApiPropertyOptional({
    description: 'Optional description',
    example: 'Unit of mass equal to one thousandth of a gram',
    nullable: true,
  })
  description: string | null; // CRITICAL: | null, NOT ?

  @ApiPropertyOptional({
    description: 'Base unit code for conversions',
    example: 'g',
    nullable: true,
  })
  baseUnitCode: string | null; // CRITICAL: | null, NOT ?

  @ApiPropertyOptional({
    description: 'Conversion factor to base unit',
    example: 0.001,
    nullable: true,
  })
  conversionFactor: number | null; // CRITICAL: | null, NOT ?

  @ApiProperty({
    description: 'Display order for UI sorting',
    example: 1,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Whether the unit is active',
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
