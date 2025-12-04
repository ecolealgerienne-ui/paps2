import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateFarmVeterinarianPreferenceDto {
  @ApiProperty({
    description: 'ID of the veterinarian',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  veterinarianId: string;

  @ApiProperty({
    description: 'Display order for sorting preferences',
    example: 0,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({
    description: 'Whether this preference is active',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Whether this is the default veterinarian for the farm',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
