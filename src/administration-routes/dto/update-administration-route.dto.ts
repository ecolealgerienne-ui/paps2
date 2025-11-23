import { PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAdministrationRouteDto } from './create-administration-route.dto';

export class UpdateAdministrationRouteDto extends PartialType(CreateAdministrationRouteDto) {
  @ApiProperty({
    description: 'Version for optimistic locking',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  version?: number;
}
