import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignType } from '../types/campaign-type.enum';
import { PersonalCampaignStatus } from '../types/personal-campaign-status.enum';

class LotSummaryDto {
  @ApiProperty({ description: 'Lot ID' })
  id: string;

  @ApiProperty({ description: 'Lot name' })
  name: string;

  @ApiPropertyOptional({ description: 'Lot type' })
  type?: string;
}

export class PersonalCampaignResponseDto {
  @ApiProperty({ description: 'Unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Farm ID', example: '123e4567-e89b-12d3-a456-426614174001' })
  farmId: string;

  @ApiPropertyOptional({ description: 'Lot ID', nullable: true })
  lotId: string | null;

  @ApiProperty({ description: 'Campaign name', example: 'Vaccination printemps 2024' })
  name: string;

  @ApiPropertyOptional({ description: 'Campaign description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Product name' })
  productName: string;

  @ApiProperty({ description: 'Campaign type', enum: CampaignType })
  type: CampaignType;

  @ApiProperty({ description: 'Campaign date' })
  campaignDate: Date;

  @ApiProperty({ description: 'Withdrawal end date' })
  withdrawalEndDate: Date;

  @ApiPropertyOptional({ description: 'Veterinarian ID', nullable: true })
  veterinarianId: string | null;

  @ApiPropertyOptional({ description: 'Veterinarian name', nullable: true })
  veterinarianName: string | null;

  @ApiProperty({ description: 'Animal IDs as JSON string' })
  animalIdsJson: string;

  @ApiProperty({ description: 'Campaign status', enum: PersonalCampaignStatus })
  status: PersonalCampaignStatus;

  @ApiPropertyOptional({ description: 'Start date', nullable: true })
  startDate: Date | null;

  @ApiPropertyOptional({ description: 'End date', nullable: true })
  endDate: Date | null;

  @ApiPropertyOptional({ description: 'Target animal count', nullable: true })
  targetCount: number | null;

  @ApiProperty({ description: 'Completed count', example: 0 })
  completedCount: number;

  @ApiProperty({ description: 'Is completed', example: false })
  completed: boolean;

  @ApiPropertyOptional({ description: 'Notes', nullable: true })
  notes: string | null;

  @ApiProperty({ description: 'Version for optimistic locking', example: 1 })
  version: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp (soft delete)', nullable: true })
  deletedAt: Date | null;

  @ApiPropertyOptional({ description: 'Associated lot details', type: LotSummaryDto })
  lot?: LotSummaryDto;
}
