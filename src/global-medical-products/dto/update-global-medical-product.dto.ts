import { PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateGlobalMedicalProductDto } from './create-global-medical-product.dto';

export class UpdateGlobalMedicalProductDto extends PartialType(CreateGlobalMedicalProductDto) {
  @ApiProperty({
    description: 'Version for optimistic locking',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  version?: number;
}
