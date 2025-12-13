import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
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

  // Stock management fields (optional)
  @ApiPropertyOptional({
    description: 'Quantité initiale du lot',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialQuantity?: number;

  @ApiPropertyOptional({
    description: 'Unité de stock',
    example: 'ml',
    enum: ['ml', 'doses', 'comprimés', 'sachets', 'flacons'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  stockUnit?: string;

  @ApiPropertyOptional({
    description: "Date d'achat du lot",
    example: '2025-01-15',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    description: "Prix d'achat (en euros)",
    example: 45.50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({
    description: 'Nom du fournisseur',
    example: 'Vétoquinol',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  supplier?: string;
}
