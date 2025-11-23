import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCountryDto } from './create-country.dto';

export class UpdateCountryDto extends PartialType(
  OmitType(CreateCountryDto, ['code'] as const)
) {}
