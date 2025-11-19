import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateAnimalDto } from './create-animal.dto';

export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {
  @ApiPropertyOptional({ description: 'Version pour gestion des conflits' })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}
