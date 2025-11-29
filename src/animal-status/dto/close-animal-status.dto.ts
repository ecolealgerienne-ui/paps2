import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CloseAnimalStatusDto {
  @ApiProperty({
    description: 'Date de fin du statut',
    example: '2025-06-15',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Notes de clôture',
    example: 'Mise-bas réussie, 2 agneaux',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
