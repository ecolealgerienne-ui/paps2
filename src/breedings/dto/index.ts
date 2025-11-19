import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BreedingMethod, BreedingStatus } from '../../common/enums';

export class CreateBreedingDto {
  @ApiProperty({ description: 'Breeding ID (UUID)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Female animal ID' })
  @IsString()
  femaleId: string;

  @ApiProperty({ description: 'Male animal ID', required: false })
  @IsOptional()
  @IsString()
  maleId?: string;

  @ApiProperty({ enum: BreedingMethod, description: 'Breeding method' })
  @IsEnum(BreedingMethod)
  method: BreedingMethod;

  @ApiProperty({ description: 'Breeding date' })
  @IsDateString()
  breedingDate: string;

  @ApiProperty({ description: 'Expected due date', required: false })
  @IsOptional()
  @IsDateString()
  expectedDueDate?: string;

  @ApiProperty({ enum: BreedingStatus, default: 'planned', required: false })
  @IsOptional()
  @IsEnum(BreedingStatus)
  status?: BreedingStatus;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBreedingDto {
  @ApiProperty({ description: 'Male animal ID', required: false })
  @IsOptional()
  @IsString()
  maleId?: string;

  @ApiProperty({ enum: BreedingMethod, required: false })
  @IsOptional()
  @IsEnum(BreedingMethod)
  method?: BreedingMethod;

  @ApiProperty({ description: 'Breeding date', required: false })
  @IsOptional()
  @IsDateString()
  breedingDate?: string;

  @ApiProperty({ description: 'Expected due date', required: false })
  @IsOptional()
  @IsDateString()
  expectedDueDate?: string;

  @ApiProperty({ description: 'Actual due date', required: false })
  @IsOptional()
  @IsDateString()
  actualDueDate?: string;

  @ApiProperty({ enum: BreedingStatus, required: false })
  @IsOptional()
  @IsEnum(BreedingStatus)
  status?: BreedingStatus;

  @ApiProperty({ description: 'Offspring animal ID', required: false })
  @IsOptional()
  @IsString()
  offspringId?: string;

  @ApiProperty({ description: 'Number of offspring', required: false })
  @IsOptional()
  @IsNumber()
  offspringCount?: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Version for conflict detection', required: false })
  @IsOptional()
  version?: number;
}

export class QueryBreedingDto {
  @ApiProperty({ description: 'Filter by female ID', required: false })
  @IsOptional()
  @IsString()
  femaleId?: string;

  @ApiProperty({ enum: BreedingStatus, required: false })
  @IsOptional()
  @IsEnum(BreedingStatus)
  status?: BreedingStatus;

  @ApiProperty({ description: 'From date', required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ description: 'To date', required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
