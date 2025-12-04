import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFarmVeterinarianPreferenceDto } from './create-farm-veterinarian-preference.dto';

export class UpdateFarmVeterinarianPreferenceDto extends PartialType(
  OmitType(CreateFarmVeterinarianPreferenceDto, ['veterinarianId'] as const)
) {
  @ApiPropertyOptional({ description: 'Version for optimistic locking', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;
}
