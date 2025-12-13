import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export enum StockAdjustmentType {
  ADD = 'add',           // Ajout de stock (réception)
  REMOVE = 'remove',     // Retrait de stock (utilisation manuelle)
  CORRECTION = 'correction', // Correction d'inventaire (set direct)
}

export class AdjustStockDto {
  @ApiProperty({
    description: "Type d'ajustement",
    enum: StockAdjustmentType,
    example: 'add',
  })
  @IsEnum(StockAdjustmentType)
  @IsNotEmpty()
  type: StockAdjustmentType;

  @ApiProperty({
    description: 'Quantité à ajouter/retirer ou nouvelle valeur pour correction',
    example: 10,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({
    description: "Raison de l'ajustement",
    example: 'Inventaire physique',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
