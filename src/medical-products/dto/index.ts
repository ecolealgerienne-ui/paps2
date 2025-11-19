import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMedicalProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Active substance', required: false })
  @IsOptional()
  @IsString()
  activeSubstance?: string;

  @ApiProperty({ description: 'Manufacturer', required: false })
  @IsOptional()
  @IsString()
  manufacturer?: string;

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

  @ApiProperty({ description: 'Dosage unit', required: false })
  @IsOptional()
  @IsString()
  dosageUnit?: string;

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

  @ApiProperty({ description: 'Active substance', required: false })
  @IsOptional()
  @IsString()
  activeSubstance?: string;

  @ApiProperty({ description: 'Manufacturer', required: false })
  @IsOptional()
  @IsString()
  manufacturer?: string;

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

  @ApiProperty({ description: 'Dosage unit', required: false })
  @IsOptional()
  @IsString()
  dosageUnit?: string;

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

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
