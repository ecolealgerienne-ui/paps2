import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a Farm
 * Timestamps managed server-side (Reference entity - Option A)
 */
export class CreateFarmDto {
  @ApiProperty({ description: 'Farm ID (UUID)' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Farm name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Farm location' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Owner ID' })
  @IsString()
  ownerId: string;

  @ApiProperty({ description: 'Cheptel number', required: false })
  @IsOptional()
  @IsString()
  cheptelNumber?: string;

  @ApiProperty({ description: 'Group ID', required: false })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiProperty({ description: 'Group name', required: false })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiProperty({ description: 'Is default farm', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

/**
 * DTO for updating a Farm
 * Timestamps managed server-side (Reference entity - Option A)
 */
export class UpdateFarmDto {
  @ApiProperty({ description: 'Farm name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Farm location', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Owner ID', required: false })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiProperty({ description: 'Cheptel number', required: false })
  @IsOptional()
  @IsString()
  cheptelNumber?: string;

  @ApiProperty({ description: 'Group ID', required: false })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiProperty({ description: 'Group name', required: false })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiProperty({ description: 'Is default farm', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

/**
 * DTO for querying Farms
 */
export class QueryFarmDto {
  @ApiProperty({ description: 'Search by name or location', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by owner ID', required: false })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiProperty({ description: 'Filter by group ID', required: false })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiProperty({ description: 'Filter by default status', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
