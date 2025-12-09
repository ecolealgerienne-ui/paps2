import { IsString, IsOptional, IsDateString, IsNumber, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MovementType, TemporaryMovementType, BuyerType, MovementStatus } from '../../common/enums';
import { BaseSyncEntityDto } from '../../common/dto/base-sync-entity.dto';

/**
 * DTO for creating a Movement
 * Extends BaseSyncEntityDto to support offline-first architecture (farmId, created_at, updated_at)
 */
export class CreateMovementDto extends BaseSyncEntityDto {
  @ApiPropertyOptional({ description: 'Movement ID (UUID)' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ enum: MovementType, description: 'Type of movement' })
  @IsEnum(MovementType)
  movementType: MovementType;

  @ApiProperty({ description: 'Movement date' })
  @IsDateString()
  movementDate: string;

  @ApiProperty({ description: 'Animal IDs involved in movement', type: [String] })
  @IsArray()
  @IsString({ each: true })
  animalIds: string[];

  @ApiPropertyOptional({ description: 'Lot ID' })
  @IsOptional()
  @IsString()
  lotId?: string;

  @ApiPropertyOptional({ description: 'Reason for movement' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ enum: MovementStatus, description: 'Movement status', default: 'ongoing' })
  @IsOptional()
  @IsEnum(MovementStatus)
  status?: MovementStatus;

  // Sale fields
  @ApiPropertyOptional({ description: 'Buyer name' })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiPropertyOptional({ enum: BuyerType })
  @IsOptional()
  @IsEnum(BuyerType)
  buyerType?: BuyerType;

  @ApiPropertyOptional({ description: 'Buyer contact' })
  @IsOptional()
  @IsString()
  buyerContact?: string;

  @ApiPropertyOptional({ description: 'Buyer farm ID' })
  @IsOptional()
  @IsString()
  buyerFarmId?: string;

  @ApiPropertyOptional({ description: 'Buyer QR signature' })
  @IsOptional()
  @IsString()
  buyerQrSignature?: string;

  @ApiPropertyOptional({ description: 'Sale price' })
  @IsOptional()
  @IsNumber()
  salePrice?: number;

  // Purchase fields
  @ApiPropertyOptional({ description: 'Seller name' })
  @IsOptional()
  @IsString()
  sellerName?: string;

  @ApiPropertyOptional({ description: 'Purchase price' })
  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  // Transfer fields
  @ApiPropertyOptional({ description: 'Destination farm ID' })
  @IsOptional()
  @IsString()
  destinationFarmId?: string;

  @ApiPropertyOptional({ description: 'Origin farm ID' })
  @IsOptional()
  @IsString()
  originFarmId?: string;

  // Slaughter fields
  @ApiPropertyOptional({ description: 'Slaughterhouse name' })
  @IsOptional()
  @IsString()
  slaughterhouseName?: string;

  @ApiPropertyOptional({ description: 'Slaughterhouse ID' })
  @IsOptional()
  @IsString()
  slaughterhouseId?: string;

  // Temporary movement fields
  @ApiPropertyOptional({ description: 'Is temporary movement', default: false })
  @IsOptional()
  @IsBoolean()
  isTemporary?: boolean;

  @ApiPropertyOptional({ enum: TemporaryMovementType })
  @IsOptional()
  @IsEnum(TemporaryMovementType)
  temporaryType?: TemporaryMovementType;

  @ApiPropertyOptional({ description: 'Expected return date' })
  @IsOptional()
  @IsDateString()
  expectedReturnDate?: string;

  @ApiPropertyOptional({ description: 'Return date' })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiPropertyOptional({ description: 'Return notes' })
  @IsOptional()
  @IsString()
  returnNotes?: string;

  @ApiPropertyOptional({ description: 'Related movement ID (for return movements)' })
  @IsOptional()
  @IsString()
  relatedMovementId?: string;

  @ApiPropertyOptional({ description: 'Document number' })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for updating a Movement
 * Extends BaseSyncEntityDto to support offline-first architecture
 */
export class UpdateMovementDto extends BaseSyncEntityDto {
  @ApiPropertyOptional({ enum: MovementType })
  @IsOptional()
  @IsEnum(MovementType)
  movementType?: MovementType;

  @ApiPropertyOptional({ description: 'Movement date' })
  @IsOptional()
  @IsDateString()
  movementDate?: string;

  @ApiPropertyOptional({ description: 'Animal IDs to update (replaces existing list)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  animalIds?: string[];

  @ApiPropertyOptional({ description: 'Lot ID' })
  @IsOptional()
  @IsString()
  lotId?: string;

  @ApiPropertyOptional({ description: 'Reason' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ enum: MovementStatus })
  @IsOptional()
  @IsEnum(MovementStatus)
  status?: MovementStatus;

  // Sale fields
  @ApiPropertyOptional({ description: 'Buyer name' })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiPropertyOptional({ enum: BuyerType })
  @IsOptional()
  @IsEnum(BuyerType)
  buyerType?: BuyerType;

  @ApiPropertyOptional({ description: 'Buyer contact' })
  @IsOptional()
  @IsString()
  buyerContact?: string;

  @ApiPropertyOptional({ description: 'Buyer farm ID' })
  @IsOptional()
  @IsString()
  buyerFarmId?: string;

  @ApiPropertyOptional({ description: 'Buyer QR signature' })
  @IsOptional()
  @IsString()
  buyerQrSignature?: string;

  @ApiPropertyOptional({ description: 'Sale price' })
  @IsOptional()
  @IsNumber()
  salePrice?: number;

  // Purchase fields
  @ApiPropertyOptional({ description: 'Seller name' })
  @IsOptional()
  @IsString()
  sellerName?: string;

  @ApiPropertyOptional({ description: 'Purchase price' })
  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  // Transfer fields
  @ApiPropertyOptional({ description: 'Destination farm ID' })
  @IsOptional()
  @IsString()
  destinationFarmId?: string;

  @ApiPropertyOptional({ description: 'Origin farm ID' })
  @IsOptional()
  @IsString()
  originFarmId?: string;

  // Slaughter fields
  @ApiPropertyOptional({ description: 'Slaughterhouse name' })
  @IsOptional()
  @IsString()
  slaughterhouseName?: string;

  @ApiPropertyOptional({ description: 'Slaughterhouse ID' })
  @IsOptional()
  @IsString()
  slaughterhouseId?: string;

  // Temporary movement fields
  @ApiPropertyOptional({ description: 'Is temporary movement' })
  @IsOptional()
  @IsBoolean()
  isTemporary?: boolean;

  @ApiPropertyOptional({ enum: TemporaryMovementType })
  @IsOptional()
  @IsEnum(TemporaryMovementType)
  temporaryType?: TemporaryMovementType;

  @ApiPropertyOptional({ description: 'Expected return date' })
  @IsOptional()
  @IsDateString()
  expectedReturnDate?: string;

  @ApiPropertyOptional({ description: 'Return date' })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiPropertyOptional({ description: 'Return notes' })
  @IsOptional()
  @IsString()
  returnNotes?: string;

  @ApiPropertyOptional({ description: 'Related movement ID' })
  @IsOptional()
  @IsString()
  relatedMovementId?: string;

  @ApiPropertyOptional({ description: 'Document number' })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Version for conflict detection' })
  @IsOptional()
  @IsNumber()
  version?: number;
}

export class QueryMovementDto {
  @ApiPropertyOptional({ enum: MovementType })
  @IsOptional()
  @IsEnum(MovementType)
  movementType?: MovementType;

  @ApiPropertyOptional({ enum: MovementStatus, description: 'Status (ongoing, closed, archived)' })
  @IsOptional()
  @IsEnum(MovementStatus)
  status?: MovementStatus;

  @ApiPropertyOptional({ description: 'Filter by lot ID' })
  @IsOptional()
  @IsString()
  lotId?: string;

  @ApiPropertyOptional({ description: 'From date' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'To date' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Filter by animal ID' })
  @IsOptional()
  @IsString()
  animalId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
