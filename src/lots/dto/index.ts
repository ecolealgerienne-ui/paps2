import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LotType } from '../../common/enums';
import { BaseSyncEntityDto } from '../../common/dto/base-sync-entity.dto';

/**
 * DTO for creating a Lot
 * Extends BaseSyncEntityDto to support offline-first architecture (farmId, created_at, updated_at)
 * Supports creating lot with initial animals via animalIds array
 */
export class CreateLotDto extends BaseSyncEntityDto {
  @ApiProperty({ description: 'Lot ID (UUID)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Lot name' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Animal IDs to add to lot during creation',
    type: [String],
    required: false,
    example: ['animal-uuid-1', 'animal-uuid-2']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  animalIds?: string[];

  @ApiProperty({ enum: LotType, description: 'Type of lot', required: false })
  @IsOptional()
  @IsEnum(LotType)
  type?: LotType;

  @ApiProperty({ description: 'Status (open, closed, archived)', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Product ID', required: false })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ description: 'Product name', required: false })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ description: 'Treatment date', required: false })
  @IsOptional()
  @IsDateString()
  treatmentDate?: string;

  @ApiProperty({ description: 'Withdrawal end date', required: false })
  @IsOptional()
  @IsDateString()
  withdrawalEndDate?: string;

  @ApiProperty({ description: 'Veterinarian ID', required: false })
  @IsOptional()
  @IsString()
  veterinarianId?: string;

  @ApiProperty({ description: 'Veterinarian name', required: false })
  @IsOptional()
  @IsString()
  veterinarianName?: string;

  @ApiProperty({ description: 'Total price', required: false })
  @IsOptional()
  @IsNumber()
  priceTotal?: number;

  @ApiProperty({ description: 'Buyer name', required: false })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiProperty({ description: 'Seller name', required: false })
  @IsOptional()
  @IsString()
  sellerName?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Is lot active', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Is completed', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({ description: 'Completed at date', required: false })
  @IsOptional()
  @IsDateString()
  completedAt?: string;
}

/**
 * DTO for updating a Lot
 * Extends BaseSyncEntityDto to support offline-first architecture
 * Supports updating animals via animalIds array (replaces existing animals)
 */
export class UpdateLotDto extends BaseSyncEntityDto {
  @ApiProperty({ description: 'Lot name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Animal IDs to set in lot (replaces existing animals)',
    type: [String],
    required: false,
    example: ['animal-uuid-1', 'animal-uuid-2']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  animalIds?: string[];

  @ApiProperty({ enum: LotType, description: 'Type of lot', required: false })
  @IsOptional()
  @IsEnum(LotType)
  type?: LotType;

  @ApiProperty({ description: 'Status', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Product ID', required: false })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ description: 'Product name', required: false })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ description: 'Treatment date', required: false })
  @IsOptional()
  @IsDateString()
  treatmentDate?: string;

  @ApiProperty({ description: 'Withdrawal end date', required: false })
  @IsOptional()
  @IsDateString()
  withdrawalEndDate?: string;

  @ApiProperty({ description: 'Veterinarian ID', required: false })
  @IsOptional()
  @IsString()
  veterinarianId?: string;

  @ApiProperty({ description: 'Veterinarian name', required: false })
  @IsOptional()
  @IsString()
  veterinarianName?: string;

  @ApiProperty({ description: 'Total price', required: false })
  @IsOptional()
  @IsNumber()
  priceTotal?: number;

  @ApiProperty({ description: 'Buyer name', required: false })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiProperty({ description: 'Seller name', required: false })
  @IsOptional()
  @IsString()
  sellerName?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Is lot active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Is completed', required: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({ description: 'Completed at date', required: false })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiProperty({ description: 'Version for conflict detection', required: false })
  @IsOptional()
  version?: number;
}

export class QueryLotDto {
  @ApiProperty({ enum: LotType, description: 'Filter by type', required: false })
  @IsOptional()
  @IsEnum(LotType)
  type?: LotType;

  @ApiProperty({ description: 'Filter by status (open, closed, archived)', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Filter by completed', required: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Search by name', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

export class AddAnimalsToLotDto {
  @ApiProperty({ description: 'Array of animal IDs to add', type: [String] })
  @IsString({ each: true })
  animalIds: string[];
}
