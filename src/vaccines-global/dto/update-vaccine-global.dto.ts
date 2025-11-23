import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateVaccineGlobalDto } from './create-vaccine-global.dto';

/**
 * DTO pour la mise à jour d'un vaccin global
 * Tous les champs sont optionnels sauf le code qui ne peut pas être modifié
 */
export class UpdateVaccineGlobalDto extends PartialType(
  OmitType(CreateVaccineGlobalDto, ['code'] as const),
) {}
