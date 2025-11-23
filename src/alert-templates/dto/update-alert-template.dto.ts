import { PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAlertTemplateDto } from './create-alert-template.dto';

export class UpdateAlertTemplateDto extends PartialType(CreateAlertTemplateDto) {
  @ApiPropertyOptional({ description: 'Version for optimistic locking' })
  @IsInt()
  @Min(1)
  @IsOptional()
  version?: number;
}
