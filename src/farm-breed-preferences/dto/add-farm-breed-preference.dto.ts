import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for adding a breed preference to a farm
 * PHASE_20: FarmBreedPreferences
 */
export class AddFarmBreedPreferenceDto {
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
}
