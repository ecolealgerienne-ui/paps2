import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class AddFarmSpeciesPreferenceDto {
  @ApiProperty({ description: 'Species ID to add', example: 'bovine' })
  @IsString()
  @IsNotEmpty()
  speciesId: string;
}
