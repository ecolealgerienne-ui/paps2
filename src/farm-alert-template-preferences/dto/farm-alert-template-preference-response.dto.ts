import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AlertTemplateSummaryDto {
  @ApiProperty({ description: 'Alert Template ID' })
  id: string;

  @ApiProperty({ description: 'Alert Template code' })
  code: string;

  @ApiProperty({ description: 'French name' })
  nameFr: string;

  @ApiPropertyOptional({ description: 'English name' })
  nameEn: string | null;

  @ApiPropertyOptional({ description: 'Arabic name' })
  nameAr: string | null;

  @ApiPropertyOptional({ description: 'French description' })
  descriptionFr: string | null;

  @ApiPropertyOptional({ description: 'English description' })
  descriptionEn: string | null;

  @ApiPropertyOptional({ description: 'Arabic description' })
  descriptionAr: string | null;

  @ApiProperty({ description: 'Alert category', example: 'vaccination' })
  category: string;

  @ApiProperty({ description: 'Alert priority', example: 'medium' })
  priority: string;

  @ApiProperty({ description: 'Whether the template is active' })
  isActive: boolean;
}

export class FarmAlertTemplatePreferenceResponseDto {
  @ApiProperty({ description: 'Unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Farm ID', example: '123e4567-e89b-12d3-a456-426614174001' })
  farmId: string;

  @ApiProperty({ description: 'Alert Template ID', example: '123e4567-e89b-12d3-a456-426614174002' })
  alertTemplateId: string;

  @ApiProperty({ description: 'Display order for sorting', example: 0 })
  displayOrder: number;

  @ApiProperty({ description: 'Whether this preference is active', example: true })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Custom reminder days (null = use default)', example: 7, nullable: true })
  reminderDays: number | null;

  @ApiProperty({ description: 'Version for optimistic locking', example: 1 })
  version: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp (soft delete)', nullable: true })
  deletedAt: Date | null;

  @ApiPropertyOptional({ description: 'Associated alert template details', type: AlertTemplateSummaryDto })
  alertTemplate?: AlertTemplateSummaryDto;
}
