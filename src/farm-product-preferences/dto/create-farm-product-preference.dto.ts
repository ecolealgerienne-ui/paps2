import { IsUUID, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsXorField } from '../../common/validators';

export class CreateFarmProductPreferenceDto {
  @ApiPropertyOptional({
    description: 'Global product ID (from global catalog). XOR with customProductId',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  globalProductId?: string;

  @ApiPropertyOptional({
    description: 'Custom product ID (farm-specific). XOR with globalProductId',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  @IsOptional()
  @IsXorField(['globalProductId', 'customProductId'])
  customProductId?: string;

  @ApiPropertyOptional({
    description: 'Display order for sorting',
    example: 1,
    default: 0
  })
  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Is this preference active',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
