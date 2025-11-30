import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAgeCategoryDto } from './create-age-category.dto';

/**
 * DTO for updating an age category
 *
 * Excludes:
 * - code: Cannot be changed (part of unique constraint)
 * - speciesId: Cannot be changed (part of unique constraint)
 */
export class UpdateAgeCategoryDto extends PartialType(
  OmitType(CreateAgeCategoryDto, ['code', 'speciesId'] as const),
) {}
