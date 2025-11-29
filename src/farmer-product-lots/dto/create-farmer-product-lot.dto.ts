import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFarmerProductLotDto {
  @ApiProperty({
    description: 'Surnom du lot (ex: "Lot 1", "Flacon Janvier")',
    example: 'Lot Janvier 2025',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nickname: string;

  @ApiProperty({
    description: 'Numéro de lot officiel du fabricant',
    example: 'C4567-9A',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  officialLotNumber: string;

  @ApiProperty({
    description: 'Date de péremption du lot',
    example: '2026-06-15',
  })
  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiPropertyOptional({
    description: 'Lot actif ou non',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
