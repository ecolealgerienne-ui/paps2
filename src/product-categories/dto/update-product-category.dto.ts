import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateProductCategoryDto } from './create-product-category.dto';
import { IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating a product category
 *
 * Excludes:
 * - code: Cannot be changed (unique identifier)
 */
export class UpdateProductCategoryDto extends PartialType(
  OmitType(CreateProductCategoryDto, ['code'] as const),
) {
  @ApiPropertyOptional({
    description: 'Version for optimistic locking',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  version?: number;
}
