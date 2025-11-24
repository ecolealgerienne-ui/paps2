import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { IsXorField } from '../../common/validators';

export class CreateFarmVaccinePreferenceDto {
  @ApiProperty({
    description: 'Farm ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  farmId: string;

  @ApiPropertyOptional({
    description: 'Global vaccine ID (XOR with customVaccineId - exactly one must be provided)',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @IsOptional()
  @IsUUID()
  globalVaccineId?: string;

  @ApiPropertyOptional({
    description: 'Custom vaccine ID (XOR with globalVaccineId - exactly one must be provided)',
    example: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  })
  @IsOptional()
  @IsUUID()
  @IsXorField(['globalVaccineId', 'customVaccineId'])
  customVaccineId?: string;

  @ApiPropertyOptional({
    description: 'Display order for sorting',
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
