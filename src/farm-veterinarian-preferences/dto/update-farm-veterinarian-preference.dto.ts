import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateFarmVeterinarianPreferenceDto } from './create-farm-veterinarian-preference.dto';

export class UpdateFarmVeterinarianPreferenceDto extends PartialType(
  OmitType(CreateFarmVeterinarianPreferenceDto, ['veterinarianId'] as const)
) {}
