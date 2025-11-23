import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a Custom Vaccine (PHASE_10)
 */
export class CreateVaccineDto {
  @ApiProperty({ description: 'Vaccine name', example: 'Vaccin Brucellose B19' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Vaccin contre la brucellose bovine' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Target disease', example: 'Brucellose' })
  @IsOptional()
  @IsString()
  targetDisease?: string;

  @ApiPropertyOptional({ description: 'Laboratory/manufacturer', example: 'SAIDAL' })
  @IsOptional()
  @IsString()
  laboratoire?: string;

  @ApiPropertyOptional({ description: 'Dosage information', example: '2ml par animal' })
  @IsOptional()
  @IsString()
  dosage?: string;
}

/**
 * DTO for updating a Custom Vaccine (PHASE_10)
 */
export class UpdateVaccineDto {
  @ApiPropertyOptional({ description: 'Vaccine name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Target disease' })
  @IsOptional()
  @IsString()
  targetDisease?: string;

  @ApiPropertyOptional({ description: 'Laboratory/manufacturer' })
  @IsOptional()
  @IsString()
  laboratoire?: string;

  @ApiPropertyOptional({ description: 'Dosage information' })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiPropertyOptional({ description: 'Version for optimistic locking', example: 1 })
  @IsNumber()
  @IsOptional()
  version?: number;
}

/**
 * DTO for querying Custom Vaccines (PHASE_10)
 */
export class QueryVaccineDto {
  @ApiPropertyOptional({ description: 'Search by name', example: 'Brucellose' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Include deleted vaccines', default: false })
  @IsOptional()
  includeDeleted?: boolean;
}
