import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FarmNationalCampaignPreferenceResponseDto {
  @ApiProperty({ description: 'Unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Farm ID', example: '123e4567-e89b-12d3-a456-426614174001' })
  farmId: string;

  @ApiProperty({ description: 'National Campaign ID', example: '123e4567-e89b-12d3-a456-426614174002' })
  campaignId: string;

  @ApiProperty({ description: 'Whether the farm is enrolled in this campaign', example: true })
  isEnrolled: boolean;

  @ApiPropertyOptional({ description: 'Date when the farm enrolled', nullable: true })
  enrolledAt: Date | null;

  @ApiProperty({ description: 'Version for optimistic locking', example: 1 })
  version: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp (soft delete)', nullable: true })
  deletedAt: Date | null;

  @ApiPropertyOptional({ description: 'Associated farm details' })
  farm?: object;

  @ApiPropertyOptional({ description: 'Associated national campaign details' })
  campaign?: object;
}
