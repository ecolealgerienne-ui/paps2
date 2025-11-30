import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAdministrationRouteDto } from './create-administration-route.dto';

/**
 * DTO for updating an administration route
 *
 * Excludes:
 * - code: Cannot be changed (unique identifier)
 */
export class UpdateAdministrationRouteDto extends PartialType(
  OmitType(CreateAdministrationRouteDto, ['code'] as const),
) {}
