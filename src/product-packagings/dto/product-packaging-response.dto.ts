import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductPackagingResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-2)' })
  countryCode: string;

  @ApiProperty({ description: 'Concentration value' })
  concentration: number;

  @ApiProperty({ description: 'Concentration unit ID' })
  concentrationUnitId: string;

  @ApiPropertyOptional({ description: 'Volume value' })
  volume: number | null;

  @ApiPropertyOptional({ description: 'Volume unit ID' })
  volumeUnitId: string | null;

  @ApiProperty({ description: 'Packaging label' })
  packagingLabel: string;

  @ApiPropertyOptional({ description: 'GTIN/EAN barcode' })
  gtinEan: string | null;

  @ApiPropertyOptional({ description: 'Marketing authorization number (AMM)' })
  numeroAMM: string | null;

  @ApiProperty({ description: 'Active status' })
  isActive: boolean;

  @ApiProperty({ description: 'Version for optimistic locking' })
  version: number;

  @ApiPropertyOptional({ description: 'Soft delete timestamp' })
  deletedAt: Date | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
