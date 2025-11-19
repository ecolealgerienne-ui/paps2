import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LotType } from '../../common/enums';

export class CreateLotDto {
  @ApiProperty({ description: 'Lot ID (UUID)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Lot name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: LotType, description: 'Type of lot' })
  @IsEnum(LotType)
  type: LotType;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Is lot active', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLotDto {
  @ApiProperty({ description: 'Lot name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ enum: LotType, description: 'Type of lot', required: false })
  @IsOptional()
  @IsEnum(LotType)
  type?: LotType;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Is lot active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Version for conflict detection', required: false })
  @IsOptional()
  version?: number;
}

export class QueryLotDto {
  @ApiProperty({ enum: LotType, description: 'Filter by type', required: false })
  @IsOptional()
  @IsEnum(LotType)
  type?: LotType;

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
