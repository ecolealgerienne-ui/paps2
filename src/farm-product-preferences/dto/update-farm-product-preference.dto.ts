import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateFarmProductPreferenceDto } from './create-farm-product-preference.dto';

// Product cannot be changed after creation - only displayOrder and isActive can be updated
export class UpdateFarmProductPreferenceDto extends PartialType(
  OmitType(CreateFarmProductPreferenceDto, ['productId'] as const),
) {}
