import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

/**
 * DTO for toggling active status
 */
export class ToggleActiveDto {
  @ApiProperty({
    description: 'New active status',
    example: false,
  })
  @IsBoolean()
  isActive: boolean;
}
