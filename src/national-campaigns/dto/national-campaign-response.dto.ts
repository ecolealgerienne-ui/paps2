import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignType } from './index';

/**
 * DTO for National Campaign response
 */
export class NationalCampaignResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Unique campaign code' })
  code: string;

  @ApiProperty({ description: 'Campaign name in French' })
  nameFr: string;

  @ApiProperty({ description: 'Campaign name in English' })
  nameEn: string;

  @ApiProperty({ description: 'Campaign name in Arabic' })
  nameAr: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  description: string | null;

  @ApiProperty({ description: 'Campaign type', enum: CampaignType })
  type: CampaignType;

  @ApiProperty({ description: 'Campaign start date' })
  startDate: Date;

  @ApiProperty({ description: 'Campaign end date' })
  endDate: Date;

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
