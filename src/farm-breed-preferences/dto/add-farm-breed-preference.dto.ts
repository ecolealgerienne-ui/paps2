import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for adding a breed preference to a farm
 * PHASE_20: FarmBreedPreferences
 * Note: farmId is obtained from URL path parameter, not from body
 */
export class AddFarmBreedPreferenceDto {
  @ApiProperty({
    description: 'Breed ID (UUID)',
    example: '987fcdeb-51a2-43f7-b890-123456789abc',
  })
  @IsString()
  @IsNotEmpty()
  breedId: string;
}
