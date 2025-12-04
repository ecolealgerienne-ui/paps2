import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FarmProductPreferenceResponseDto {
  @ApiProperty({ description: 'Unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Farm ID', example: '123e4567-e89b-12d3-a456-426614174001' })
  farmId: string;

  @ApiProperty({ description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174002' })
  productId: string;

  @ApiProperty({ description: 'Display order for sorting', example: 0 })
  displayOrder: number;

  @ApiProperty({ description: 'Whether this preference is active', example: true })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Selected packaging ID', nullable: true })
  packagingId: string | null;

  @ApiPropertyOptional({ description: 'User-defined dose (overrides AMM/RCP)', nullable: true })
  userDefinedDose: number | null;

  @ApiPropertyOptional({ description: 'User-defined dose unit', nullable: true })
  userDefinedDoseUnit: string | null;

  @ApiPropertyOptional({ description: 'User-defined meat withdrawal period in days', nullable: true })
  userDefinedMeatWithdrawal: number | null;

  @ApiPropertyOptional({ description: 'User-defined milk withdrawal period in hours', nullable: true })
  userDefinedMilkWithdrawal: number | null;

  @ApiProperty({ description: 'Version for optimistic locking', example: 1 })
  version: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp (soft delete)', nullable: true })
  deletedAt: Date | null;

  @ApiPropertyOptional({ description: 'Associated product details' })
  product?: object;

  @ApiPropertyOptional({ description: 'Associated farm details' })
  farm?: object;

  @ApiPropertyOptional({ description: 'Selected packaging details' })
  packaging?: object;

  @ApiPropertyOptional({ description: 'Associated farmer product lots' })
  lots?: object[];
}
