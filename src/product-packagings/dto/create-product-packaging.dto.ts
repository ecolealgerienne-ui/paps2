import { IsString, IsBoolean, IsUUID, IsNumber, IsOptional, MaxLength, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductPackagingDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-2)', example: 'DZ' })
  @IsString()
  @MaxLength(2)
  countryCode: string;

  @ApiProperty({ description: 'Concentration value', example: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  concentration: number;

  @ApiProperty({ description: 'Concentration unit ID' })
  @IsUUID()
  concentrationUnitId: string;

  @ApiPropertyOptional({ description: 'Volume value', example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ description: 'Volume unit ID' })
  @IsOptional()
  @IsUUID()
  volumeUnitId?: string;

  @ApiProperty({ description: 'Packaging label', example: 'Flacon 100ml' })
  @IsString()
  @MaxLength(255)
  packagingLabel: string;

  @ApiPropertyOptional({ description: 'GTIN/EAN barcode', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gtinEan?: string;

  @ApiPropertyOptional({ description: 'Marketing authorization number (AMM)', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  numeroAMM?: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Mobile sync fields (optional client-provided timestamps)
  @ApiPropertyOptional({ description: 'Client creation timestamp (for offline sync)' })
  @IsOptional()
  @IsDateString()
  created_at?: string;

  @ApiPropertyOptional({ description: 'Client update timestamp (for offline sync)' })
  @IsOptional()
  @IsDateString()
  updated_at?: string;
}
