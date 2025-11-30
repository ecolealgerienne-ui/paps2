import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ToggleActiveDto {
  @ApiProperty({
    description: 'New active status',
    example: false,
  })
  @IsBoolean()
  isActive: boolean;
}
