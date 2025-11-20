import { IsString, IsOptional, IsBoolean, IsInt, IsNumber, Min, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMedicalProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Commercial name', required: false })
  @IsOptional()
  @IsString()
  commercialName?: string;

  @ApiProperty({ description: 'Category (antibiotic, anti-inflammatory, vitamin, etc.)' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Active ingredient', required: false })
  @IsOptional()
  @IsString()
  activeIngredient?: string;

  @ApiProperty({ description: 'Manufacturer', required: false })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ description: 'Dosage', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dosage?: number;

  @ApiProperty({ description: 'Withdrawal period for meat (days)' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  withdrawalPeriodMeat: number;

  @ApiProperty({ description: 'Withdrawal period for milk (days)' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  withdrawalPeriodMilk: number;

  @ApiProperty({ description: 'Current stock', required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @ApiProperty({ description: 'Minimum stock level', required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiProperty({ description: 'Stock unit' })
  @IsString()
  stockUnit: string;

  @ApiProperty({ description: 'Unit price', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  unitPrice?: number;

  @ApiProperty({ description: 'Batch number', required: false })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiProperty({ description: 'Expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ description: 'Prescription notes/requirements', required: false })
  @IsOptional()
  @IsString()
  prescription?: string;

  @ApiProperty({ description: 'Type (treatment, supplement, etc.)', default: 'treatment' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Target species', default: '' })
  @IsOptional()
  @IsString()
  targetSpecies?: string;

  @ApiProperty({ description: 'Is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateMedicalProductDto {
  @ApiProperty({ description: 'Product name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Commercial name', required: false })
  @IsOptional()
  @IsString()
  commercialName?: string;

  @ApiProperty({ description: 'Category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Active ingredient', required: false })
  @IsOptional()
  @IsString()
  activeIngredient?: string;

  @ApiProperty({ description: 'Manufacturer', required: false })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ description: 'Dosage', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dosage?: number;

  @ApiProperty({ description: 'Withdrawal period for meat (days)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  withdrawalPeriodMeat?: number;

  @ApiProperty({ description: 'Withdrawal period for milk (days)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  withdrawalPeriodMilk?: number;

  @ApiProperty({ description: 'Current stock', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @ApiProperty({ description: 'Minimum stock level', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiProperty({ description: 'Unit price', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  unitPrice?: number;

  @ApiProperty({ description: 'Batch number', required: false })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiProperty({ description: 'Expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ description: 'Prescription notes/requirements', required: false })
  @IsOptional()
  @IsString()
  prescription?: string;

  @ApiProperty({ description: 'Type', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Target species', required: false })
  @IsOptional()
  @IsString()
  targetSpecies?: string;

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryMedicalProductDto {
  @ApiProperty({ description: 'Search by name', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Filter by type', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
