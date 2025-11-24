import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for reordering a breed preference for a farm
 * PHASE_20: FarmBreedPreferences
 */
export class ReorderFarmBreedPreferenceDto {
  @ApiProperty({
    description: 'Farm ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @ApiProperty({
    description: 'Breed ID (UUID)',
    example: '987fcdeb-51a2-43f7-b890-123456789abc',
  })
  @IsString()
  @IsNotEmpty()
  breedId: string;

  @ApiProperty({
    description: 'New display order (0-based)',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  displayOrder: number;
}
