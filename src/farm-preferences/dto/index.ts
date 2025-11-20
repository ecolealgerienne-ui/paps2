import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFarmPreferencesDto {
  @ApiProperty({ description: 'Default veterinarian ID', required: false })
  @IsOptional()
  @IsString()
  defaultVeterinarianId?: string;

  @ApiProperty({ description: 'Default species ID', required: false })
  @IsOptional()
  @IsString()
  defaultSpeciesId?: string;

  @ApiProperty({ description: 'Default breed ID', required: false })
  @IsOptional()
  @IsString()
  defaultBreedId?: string;

  @ApiProperty({ description: 'Weight unit (kg, lb)', required: false })
  @IsOptional()
  @IsString()
  weightUnit?: string;

  @ApiProperty({ description: 'Currency code', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Language code', required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ description: 'Date format', required: false })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiProperty({ description: 'Enable notifications', required: false })
  @IsOptional()
  @IsBoolean()
  enableNotifications?: boolean;

  @ApiProperty({ description: 'Version for conflict detection', required: false })
  @IsOptional()
  version?: number;
}
