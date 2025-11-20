import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  IsArray,
  IsInt,
} from 'class-validator';
import { BaseSyncEntityDto } from '../../common/dto/base-sync-entity.dto';

/**
 * DTO for creating an Animal
 * Extends BaseSyncEntityDto to support offline-first architecture (farmId, created_at, updated_at)
 */
export class CreateAnimalDto extends BaseSyncEntityDto {
  @ApiProperty({ description: 'UUID généré par le client' })
  @IsUUID()
  id: string;

  @ApiPropertyOptional({ description: 'EID électronique (15 caractères max)' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  currentEid?: string;

  @ApiPropertyOptional({ description: 'Numéro officiel' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  officialNumber?: string;

  @ApiPropertyOptional({ description: 'Identifiant visuel' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  visualId?: string;

  @ApiProperty({ description: 'Date de naissance' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ enum: ['male', 'female'] })
  @IsEnum(['male', 'female'])
  sex: string;

  @ApiPropertyOptional({ description: 'ID de la mère' })
  @IsOptional()
  @IsUUID()
  motherId?: string;

  @ApiPropertyOptional({ description: "ID de l'espèce" })
  @IsOptional()
  @IsString()
  speciesId?: string;

  @ApiPropertyOptional({ description: 'ID de la race' })
  @IsOptional()
  @IsString()
  breedId?: string;

  @ApiPropertyOptional({ description: 'Notes (1000 caractères max)' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  // ===== Champs ajoutés selon API_SIGNATURES.md =====

  @ApiPropertyOptional({ description: 'Current location farm ID' })
  @IsOptional()
  @IsString()
  currentLocationFarmId?: string;

  @ApiPropertyOptional({
    description: 'EID history (array of EID changes)',
    type: 'array',
    example: [
      {
        id: 'uuid',
        oldEid: '250123456789012',
        newEid: '250987654321098',
        changedAt: '2024-01-15T10:00:00Z',
        reason: 'Lost chip',
        notes: 'Replaced during checkup'
      }
    ]
  })
  @IsOptional()
  @IsArray()
  eidHistory?: Array<{
    id: string;
    oldEid: string;
    newEid: string;
    changedAt: string;
    reason: string;
    notes?: string;
  }>;

  @ApiPropertyOptional({
    description: 'Validation timestamp (NULL = draft status, NOT NULL = validated)',
    example: '2024-01-20T14:30:00Z'
  })
  @IsOptional()
  @IsDateString()
  validatedAt?: string;

  @ApiPropertyOptional({
    enum: ['draft', 'alive', 'sold', 'dead', 'slaughtered', 'onTemporaryMovement'],
    description: 'Animal status lifecycle',
    default: 'draft'
  })
  @IsOptional()
  @IsEnum(['draft', 'alive', 'sold', 'dead', 'slaughtered', 'onTemporaryMovement'])
  status?: string;

  @ApiPropertyOptional({ description: 'Photo URL' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Age in days (calculated field)' })
  @IsOptional()
  @IsInt()
  days?: number;
}
