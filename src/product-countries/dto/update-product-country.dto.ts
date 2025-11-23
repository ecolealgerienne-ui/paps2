import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateProductCountryDto } from './create-product-country.dto';

export class UpdateProductCountryDto extends PartialType(
  OmitType(CreateProductCountryDto, ['productId', 'countryCode'] as const)
) {}
