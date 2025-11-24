import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateFarmProductPreferenceDto } from './create-farm-product-preference.dto';

export class UpdateFarmProductPreferenceDto extends PartialType(
  OmitType(CreateFarmProductPreferenceDto, ['globalProductId', 'customProductId'] as const)
) {}
