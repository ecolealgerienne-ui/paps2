import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VaccineTargetDisease } from './create-vaccine-global.dto';

/**
 * DTO de réponse pour un vaccin global
 */
export class VaccineGlobalResponseDto {
  @ApiProperty({
    description: 'Identifiant UUID du vaccin',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Code unique du vaccin',
    example: 'brucellose_b19',
  })
  code: string;

  @ApiProperty({
    description: 'Nom du vaccin en français',
    example: 'Brucellosis B19',
  })
  nameFr: string;

  @ApiProperty({
    description: 'Nom du vaccin en anglais',
    example: 'Brucellosis B19',
  })
  nameEn: string;

  @ApiProperty({
    description: 'Nom du vaccin en arabe',
    example: 'بروسيلا B19',
  })
  nameAr: string;

  @ApiPropertyOptional({
    description: 'Description détaillée du vaccin',
    example: 'Vaccin contre la brucellose pour bovins et ovins',
  })
  description?: string;

  @ApiProperty({
    description: 'Maladie ciblée par le vaccin',
    enum: VaccineTargetDisease,
    example: VaccineTargetDisease.BRUCELLOSIS,
  })
  targetDisease: VaccineTargetDisease;

  @ApiPropertyOptional({
    description: 'Nom du laboratoire fabricant',
    example: 'Ceva',
  })
  laboratoire?: string;

  @ApiPropertyOptional({
    description: "Numéro d'autorisation de mise sur le marché",
    example: 'FR/V/1234567',
  })
  numeroAMM?: string;

  @ApiPropertyOptional({
    description: 'Dosage recommandé',
    example: '2 ml par animal',
  })
  dosageRecommande?: string;

  @ApiPropertyOptional({
    description: "Durée d'immunité en jours",
    example: 365,
  })
  dureeImmunite?: number;

  @ApiProperty({
    description: 'Version (pour optimistic locking)',
    example: 1,
  })
  version: number;

  @ApiPropertyOptional({
    description: 'Date de suppression (soft delete)',
    example: null,
  })
  deletedAt?: Date;

  @ApiProperty({
    description: 'Date de création',
    example: '2025-11-23T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2025-11-23T12:00:00Z',
  })
  updatedAt: Date;
}
