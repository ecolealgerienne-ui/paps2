import { IsString, IsBoolean, IsUUID, IsNumber, IsInt, IsOptional, MaxLength, Min, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for updating a product packaging
 *
 * Excludes:
 * - productId: Cannot be changed (part of unique constraint)
 * - countryCode: Cannot be changed (part of unique constraint)
 */
export class UpdateProductPackagingDto {
  @ApiPropertyOptional({ description: 'Concentration value' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  concentration?: number;

  @ApiPropertyOptional({ description: 'Concentration unit ID' })
  @IsOptional()
  @IsUUID()
  concentrationUnitId?: string;

  @ApiPropertyOptional({ description: 'Volume value' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ description: 'Volume unit ID' })
  @IsOptional()
  @IsUUID()
  volumeUnitId?: string;

  @ApiPropertyOptional({ description: 'Packaging label' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  packagingLabel?: string;

  @ApiPropertyOptional({ description: 'GTIN/EAN barcode' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gtinEan?: string;

  @ApiPropertyOptional({ description: 'Marketing authorization number (AMM)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  numeroAMM?: string;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Version for optimistic locking', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;

  // Mobile sync field
  @ApiPropertyOptional({ description: 'Client update timestamp (for offline sync)' })
  @IsOptional()
  @IsDateString()
  updated_at?: string;
}
