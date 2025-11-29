import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Correspond à l'enum Prisma AnimalStatusType
export enum AnimalStatusType {
  WEIGHT = 'WEIGHT',
  GESTATION = 'GESTATION',
  LACTATION = 'LACTATION',
  VET_CHECK = 'VET_CHECK',
}

export class CreateAnimalStatusDto {
  @ApiProperty({
    enum: AnimalStatusType,
    description: 'Type de statut physiologique',
    example: AnimalStatusType.GESTATION,
  })
  @IsEnum(AnimalStatusType)
  @IsNotEmpty()
  statusType: AnimalStatusType;

  @ApiProperty({
    description: 'Date de début du statut',
    example: '2025-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({
    description: 'Date de fin du statut (null = statut actif)',
    example: '2025-06-15',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Valeur du statut (poids en kg, stade gestation, etc.)',
    example: '45.5',
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({
    description: 'Notes additionnelles',
    example: 'Gestation confirmée par échographie',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
