import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertCategory, AlertPriority } from '@prisma/client';

/**
 * Response DTO for AlertTemplate
 *
 * CRITICAL: Nullable fields must use `| null`, NOT `?`
 * Prisma returns `string | null` for String?, not `string | undefined`
 */
export class AlertTemplateResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Unique code',
    example: 'vaccination_due',
  })
  code: string;

  @ApiProperty({
    description: 'French name',
    example: 'Vaccination à venir',
  })
  nameFr: string;

  @ApiProperty({
    description: 'English name',
    example: 'Vaccination Due',
  })
  nameEn: string;

  @ApiProperty({
    description: 'Arabic name',
    example: 'التطعيم المستحق',
  })
  nameAr: string;

  @ApiPropertyOptional({
    description: 'French description',
    example: 'Alerte pour rappel de vaccination',
    nullable: true,
  })
  descriptionFr: string | null; // CRITICAL: | null, NOT ?

  @ApiPropertyOptional({
    description: 'English description',
    example: 'Alert for vaccination reminder',
    nullable: true,
  })
  descriptionEn: string | null; // CRITICAL: | null, NOT ?

  @ApiPropertyOptional({
    description: 'Arabic description',
    example: 'تنبيه لتذكير التطعيم',
    nullable: true,
  })
  descriptionAr: string | null; // CRITICAL: | null, NOT ?

  @ApiProperty({
    description: 'Alert category',
    enum: AlertCategory,
    example: AlertCategory.vaccination,
  })
  category: AlertCategory;

  @ApiProperty({
    description: 'Alert priority',
    enum: AlertPriority,
    example: AlertPriority.medium,
  })
  priority: AlertPriority;

  @ApiProperty({
    description: 'Whether the template is active',
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
