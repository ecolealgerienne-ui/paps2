import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CheckContraindicationDto {
  @ApiProperty({
    description: 'ID de l\'animal à vérifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  animalId: string;

  @ApiProperty({
    description: 'ID du produit à administrer',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;
}
