import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateActiveSubstanceDto } from './create-active-substance.dto';
import { IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating an active substance
 *
 * Excludes:
 * - code: Cannot be changed (unique identifier)
 */
export class UpdateActiveSubstanceDto extends PartialType(
  OmitType(CreateActiveSubstanceDto, ['code'] as const),
) {
  @ApiPropertyOptional({
    description: 'Version for optimistic locking',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  version?: number;
}
