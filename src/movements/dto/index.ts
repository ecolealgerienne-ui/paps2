import { IsString, IsOptional, IsDateString, IsNumber, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MovementType, TemporaryMovementType, BuyerType } from '../../common/enums';

export class CreateMovementDto {
  @ApiProperty({ description: 'Movement ID (UUID)', required: false })
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

  @ApiProperty({ description: 'Reason for movement', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  // Sale fields
  @ApiProperty({ description: 'Buyer name', required: false })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiProperty({ enum: BuyerType, required: false })
  @IsOptional()
  @IsEnum(BuyerType)
  buyerType?: BuyerType;

  @ApiProperty({ description: 'Buyer contact', required: false })
  @IsOptional()
  @IsString()
  buyerContact?: string;

  @ApiProperty({ description: 'Sale price', required: false })
  @IsOptional()
  @IsNumber()
  salePrice?: number;

  // Purchase fields
  @ApiProperty({ description: 'Seller name', required: false })
  @IsOptional()
  @IsString()
  sellerName?: string;

  @ApiProperty({ description: 'Purchase price', required: false })
  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  // Transfer fields
  @ApiProperty({ description: 'Destination farm ID', required: false })
  @IsOptional()
  @IsString()
  destinationFarmId?: string;

  @ApiProperty({ description: 'Origin farm ID', required: false })
  @IsOptional()
  @IsString()
  originFarmId?: string;

  // Temporary movement fields
  @ApiProperty({ enum: TemporaryMovementType, required: false })
  @IsOptional()
  @IsEnum(TemporaryMovementType)
  temporaryType?: TemporaryMovementType;

  @ApiProperty({ description: 'Expected return date', required: false })
  @IsOptional()
  @IsDateString()
  expectedReturnDate?: string;

  @ApiProperty({ description: 'Document number', required: false })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMovementDto {
  @ApiProperty({ enum: MovementType, required: false })
  @IsOptional()
  @IsEnum(MovementType)
  movementType?: MovementType;

  @ApiProperty({ description: 'Movement date', required: false })
  @IsOptional()
  @IsDateString()
  movementDate?: string;

  @ApiProperty({ description: 'Reason', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Buyer name', required: false })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiProperty({ enum: BuyerType, required: false })
  @IsOptional()
  @IsEnum(BuyerType)
  buyerType?: BuyerType;

  @ApiProperty({ description: 'Buyer contact', required: false })
  @IsOptional()
  @IsString()
  buyerContact?: string;

  @ApiProperty({ description: 'Sale price', required: false })
  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @ApiProperty({ description: 'Seller name', required: false })
  @IsOptional()
  @IsString()
  sellerName?: string;

  @ApiProperty({ description: 'Purchase price', required: false })
  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @ApiProperty({ description: 'Document number', required: false })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Version for conflict detection', required: false })
  @IsOptional()
  version?: number;
}

export class QueryMovementDto {
  @ApiProperty({ enum: MovementType, required: false })
  @IsOptional()
  @IsEnum(MovementType)
  movementType?: MovementType;

  @ApiProperty({ description: 'Status (pending, completed, cancelled)', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'From date', required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ description: 'To date', required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({ description: 'Filter by animal ID', required: false })
  @IsOptional()
  @IsString()
  animalId?: string;

  @ApiProperty({ description: 'Page number', required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
