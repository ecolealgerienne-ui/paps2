import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateIf,
} from 'class-validator';

// Correspond à l'enum Prisma DoseUnitType
export enum DoseUnitType {
  ML_PER_KG = 'ML_PER_KG',
  ML_PER_HEAD = 'ML_PER_HEAD',
  MG_PER_KG = 'MG_PER_KG',
  G_PER_HEAD = 'G_PER_HEAD',
}

export class UpdateProductConfigDto {
  @ApiPropertyOptional({
    description: 'Dosage personnalisé (surcharge AMM/RCP)',
    example: 1.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  userDefinedDose?: number | null;

  @ApiPropertyOptional({
    enum: DoseUnitType,
    description: 'Unité du dosage personnalisé',
    example: DoseUnitType.ML_PER_KG,
  })
  @IsOptional()
  @ValidateIf((o) => o.userDefinedDose !== null && o.userDefinedDose !== undefined)
  @IsEnum(DoseUnitType)
  userDefinedDoseUnit?: DoseUnitType | null;

  @ApiPropertyOptional({
    description: 'Délai d\'attente viande personnalisé (en jours)',
    example: 14,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  userDefinedMeatWithdrawal?: number | null;

  @ApiPropertyOptional({
    description: 'Délai d\'attente lait personnalisé (en heures)',
    example: 72,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  userDefinedMilkWithdrawal?: number | null;
}
