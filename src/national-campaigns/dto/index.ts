import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsDateString, MaxLength, Matches, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignType } from '@prisma/client';

// Re-export Prisma's CampaignType enum for convenience
export { CampaignType };

/**
 * DTO for creating a National Campaign (PHASE_07)
 */
export class CreateNationalCampaignDto {
  @ApiProperty({ description: 'Unique campaign code', example: 'brucellose_2025' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9_-]+$/, { message: 'Code must contain only lowercase letters, numbers, underscores and hyphens' })
  code: string;

  @ApiProperty({ description: 'Campaign name in French', example: 'Campagne Brucellose 2025' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameFr: string;

  @ApiProperty({ description: 'Campaign name in English', example: 'Brucellosis Campaign 2025' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameEn: string;

  @ApiProperty({ description: 'Campaign name in Arabic', example: 'حملة البروسيلا 2025' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameAr: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Campaign type',
    enum: CampaignType,
    example: 'vaccination'
  })
  @IsEnum(CampaignType, { message: 'Type must be one of: vaccination, deworming, screening, treatment, census, other' })
  @IsNotEmpty()
  type: CampaignType;

  @ApiProperty({ description: 'Campaign start date (ISO 8601)', example: '2025-01-01T00:00:00Z' })
  @IsDateString({}, { message: 'Start date must be a valid ISO 8601 date' })
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'Campaign end date (ISO 8601)', example: '2025-12-31T23:59:59Z' })
  @IsDateString({}, { message: 'End date must be a valid ISO 8601 date' })
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ description: 'Is campaign active', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * DTO for updating a National Campaign (PHASE_07)
 */
export class UpdateNationalCampaignDto {
  @ApiPropertyOptional({ description: 'Unique campaign code' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Matches(/^[a-z0-9_-]+$/, { message: 'Code must contain only lowercase letters, numbers, underscores and hyphens' })
  code?: string;

  @ApiPropertyOptional({ description: 'Campaign name in French' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nameFr?: string;

  @ApiPropertyOptional({ description: 'Campaign name in English' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nameEn?: string;

  @ApiPropertyOptional({ description: 'Campaign name in Arabic' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nameAr?: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Campaign type',
    enum: CampaignType,
    required: false
  })
  @IsEnum(CampaignType)
  @IsOptional()
  type?: CampaignType;

  @ApiPropertyOptional({ description: 'Campaign start date (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Campaign end date (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Is campaign active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Version for optimistic locking', example: 1 })
  @IsNumber()
  @IsOptional()
  version?: number;
}

/**
 * DTO for querying National Campaigns (PHASE_07)
 */
export class QueryNationalCampaignDto {
  @ApiPropertyOptional({
    description: 'Filter by campaign type',
    enum: CampaignType,
    example: 'vaccination'
  })
  @IsEnum(CampaignType)
  @IsOptional()
  type?: CampaignType;

  @ApiPropertyOptional({ description: 'Filter by active status', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Search by name (FR/EN/AR) or code' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Include deleted campaigns', default: false })
  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean;
}

// Export separate DTO files
export * from './update-national-campaign.dto';
export * from './national-campaign-response.dto';
