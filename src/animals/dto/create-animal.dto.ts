import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAnimalDto {
  @ApiProperty({ description: 'UUID généré par le client' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'ID de la ferme' })
  @IsUUID()
  farmId: string;

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
}
