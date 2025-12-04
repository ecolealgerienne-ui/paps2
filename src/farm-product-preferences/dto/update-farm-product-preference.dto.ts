import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFarmProductPreferenceDto } from './create-farm-product-preference.dto';

// Product cannot be changed after creation - only displayOrder and isActive can be updated
export class UpdateFarmProductPreferenceDto extends PartialType(
  OmitType(CreateFarmProductPreferenceDto, ['productId'] as const),
) {
  @ApiPropertyOptional({ description: 'Version for optimistic locking', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;
}
