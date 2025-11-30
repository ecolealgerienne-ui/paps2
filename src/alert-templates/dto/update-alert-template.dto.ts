import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAlertTemplateDto } from './create-alert-template.dto';

/**
 * DTO for updating an alert template
 *
 * Excludes:
 * - code: Cannot be changed (unique identifier)
 */
export class UpdateAlertTemplateDto extends PartialType(
  OmitType(CreateAlertTemplateDto, ['code'] as const),
) {}
