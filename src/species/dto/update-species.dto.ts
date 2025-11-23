import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSpeciesDto } from './create-species.dto';
import { IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSpeciesDto extends PartialType(
  OmitType(CreateSpeciesDto, ['id'] as const)
) {
  @ApiPropertyOptional({
    description: 'Version pour optimistic locking',
    example: 1
  })
  @IsInt()
  @IsOptional()
  version?: number;
}
