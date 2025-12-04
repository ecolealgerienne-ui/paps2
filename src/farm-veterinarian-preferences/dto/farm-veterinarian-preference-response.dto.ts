import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FarmVeterinarianPreferenceResponseDto {
  @ApiProperty({ description: 'Unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Farm ID', example: '123e4567-e89b-12d3-a456-426614174001' })
  farmId: string;

  @ApiProperty({ description: 'Veterinarian ID', example: '123e4567-e89b-12d3-a456-426614174002' })
  veterinarianId: string;

  @ApiProperty({ description: 'Display order for sorting', example: 0 })
  displayOrder: number;

  @ApiProperty({ description: 'Whether this preference is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Version for optimistic locking', example: 1 })
  version: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp (soft delete)', nullable: true })
  deletedAt: Date | null;

  @ApiPropertyOptional({ description: 'Associated veterinarian details' })
  veterinarian?: object;

  @ApiPropertyOptional({ description: 'Associated farm details' })
  farm?: object;
}
