import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUnitDto } from './create-unit.dto';

/**
 * DTO for updating a unit
 *
 * Excludes:
 * - code: Cannot be changed (unique identifier)
 * - unitType: Cannot be changed (would break conversions)
 */
export class UpdateUnitDto extends PartialType(
  OmitType(CreateUnitDto, ['code', 'unitType'] as const),
) {}
