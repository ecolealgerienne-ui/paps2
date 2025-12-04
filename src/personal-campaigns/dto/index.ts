import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CampaignType } from '../types/campaign-type.enum';
import { PersonalCampaignStatus } from '../types/personal-campaign-status.enum';

export class CreatePersonalCampaignDto {
  @ApiProperty({ description: 'Campaign ID (UUID)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Campaign name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Campaign description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  productName: string;

  @ApiProperty({ enum: CampaignType, description: 'Type of campaign' })
  @IsEnum(CampaignType)
  type: CampaignType;

  @ApiProperty({ description: 'Lot ID to target', required: false })
  @IsOptional()
  @IsString()
  lotId?: string;

  @ApiProperty({ description: 'Campaign date' })
  @IsDateString()
  campaignDate: string;

  @ApiProperty({ description: 'Withdrawal end date' })
  @IsDateString()
  withdrawalEndDate: string;

  @ApiProperty({ description: 'Veterinarian ID', required: false })
  @IsOptional()
  @IsString()
  veterinarianId?: string;

  @ApiProperty({ description: 'Veterinarian name', required: false })
  @IsOptional()
  @IsString()
  veterinarianName?: string;

  @ApiProperty({ description: 'Animal IDs (JSON string)' })
  @IsString()
  animalIdsJson: string;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Target animal count', required: false })
  @IsOptional()
  @IsNumber()
  targetCount?: number;

  @ApiProperty({ enum: PersonalCampaignStatus, default: PersonalCampaignStatus.planned, required: false })
  @IsOptional()
  @IsEnum(PersonalCampaignStatus)
  status?: PersonalCampaignStatus;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePersonalCampaignDto {
  @ApiProperty({ description: 'Campaign name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Campaign description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CampaignType, required: false })
  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @ApiProperty({ description: 'Lot ID', required: false })
  @IsOptional()
  @IsString()
  lotId?: string;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Target count', required: false })
  @IsOptional()
  @IsNumber()
  targetCount?: number;

  @ApiProperty({ description: 'Completed count', required: false })
  @IsOptional()
  @IsNumber()
  completedCount?: number;

  @ApiProperty({ enum: PersonalCampaignStatus, required: false })
  @IsOptional()
  @IsEnum(PersonalCampaignStatus)
  status?: PersonalCampaignStatus;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Version for conflict detection', required: false })
  @IsOptional()
  version?: number;
}

export class QueryPersonalCampaignDto {
  @ApiProperty({ enum: CampaignType, required: false })
  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @ApiProperty({ enum: PersonalCampaignStatus, required: false })
  @IsOptional()
  @IsEnum(PersonalCampaignStatus)
  status?: PersonalCampaignStatus;

  @ApiProperty({ description: 'From date', required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ description: 'To date', required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}

export { PersonalCampaignResponseDto } from './personal-campaign-response.dto';
