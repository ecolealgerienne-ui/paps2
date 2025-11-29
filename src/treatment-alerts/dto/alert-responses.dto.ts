import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Réponse pour la vérification de contre-indication (gestation)
 */
export class ContraindicationCheckDto {
  @ApiProperty({
    description: 'ID de l\'animal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  animalId: string;

  @ApiProperty({
    description: 'ID du produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @ApiProperty({
    description: 'Indique si une contre-indication existe',
    example: true,
  })
  hasContraindication: boolean;

  @ApiPropertyOptional({
    description: 'Type de contre-indication détectée',
    example: 'GESTATION',
  })
  contraindicationType?: string;

  @ApiPropertyOptional({
    description: 'Message d\'alerte',
    example: 'Animal en gestation - Produit contre-indiqué',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Date de début de la gestation',
  })
  gestationStartDate?: Date;
}

/**
 * Réponse pour la vérification des délais d'attente
 */
export class WithdrawalCheckDto {
  @ApiProperty({
    description: 'ID de l\'animal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  animalId: string;

  @ApiProperty({
    description: 'Indique si des délais d\'attente sont actifs',
    example: true,
  })
  hasActiveWithdrawal: boolean;

  @ApiProperty({
    description: 'Liste des délais d\'attente actifs',
    type: 'array',
  })
  activeWithdrawals: ActiveWithdrawalDto[];
}

export class ActiveWithdrawalDto {
  @ApiProperty({
    description: 'ID du traitement',
  })
  treatmentId: string;

  @ApiProperty({
    description: 'Date du traitement',
  })
  treatmentDate: Date;

  @ApiProperty({
    description: 'Nom du produit',
  })
  productName: string;

  @ApiPropertyOptional({
    description: 'Date de fin délai viande',
  })
  meatWithdrawalEndDate?: Date;

  @ApiPropertyOptional({
    description: 'Date de fin délai lait',
  })
  milkWithdrawalEndDate?: Date;

  @ApiProperty({
    description: 'Jours restants délai viande (0 si terminé)',
    example: 5,
  })
  meatDaysRemaining: number;

  @ApiProperty({
    description: 'Jours restants délai lait (0 si terminé)',
    example: 2,
  })
  milkDaysRemaining: number;
}

/**
 * Réponse pour les lots proches de la péremption
 */
export class ExpiringLotDto {
  @ApiProperty({
    description: 'ID du lot',
  })
  lotId: string;

  @ApiProperty({
    description: 'Surnom du lot',
    example: 'Lot Janvier 2025',
  })
  nickname: string;

  @ApiProperty({
    description: 'Numéro de lot officiel',
    example: 'C4567-9A',
  })
  officialLotNumber: string;

  @ApiProperty({
    description: 'Date de péremption',
  })
  expiryDate: Date;

  @ApiProperty({
    description: 'Jours restants avant péremption',
    example: 5,
  })
  daysUntilExpiry: number;

  @ApiProperty({
    description: 'Lot déjà périmé',
    example: false,
  })
  isExpired: boolean;

  @ApiProperty({
    description: 'Nom du produit',
  })
  productName: string;

  @ApiProperty({
    description: 'ID du produit',
  })
  productId: string;
}

export class ExpiringLotsResponseDto {
  @ApiProperty({
    description: 'Lots proches de la péremption (dans le seuil)',
    type: [ExpiringLotDto],
  })
  expiring: ExpiringLotDto[];

  @ApiProperty({
    description: 'Lots déjà périmés',
    type: [ExpiringLotDto],
  })
  expired: ExpiringLotDto[];

  @ApiProperty({
    description: 'Nombre total de lots en alerte',
  })
  totalAlerts: number;
}
