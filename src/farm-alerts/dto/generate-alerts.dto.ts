// src/farm-alerts/dto/generate-alerts.dto.ts

import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO pour le résultat de génération d'alertes
 */
export class GenerateAlertsResultDto {
  @ApiProperty({
    description: 'Number of new alerts created',
    example: 5,
  })
  created: number;

  @ApiProperty({
    description: 'Number of obsolete alerts resolved',
    example: 2,
  })
  resolved: number;

  @ApiProperty({
    description: 'Number of existing alerts unchanged',
    example: 10,
  })
  unchanged: number;

  @ApiProperty({
    description: 'IDs of newly created alerts',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  createdIds: string[];

  @ApiProperty({
    description: 'IDs of resolved alerts',
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  resolvedIds: string[];
}
