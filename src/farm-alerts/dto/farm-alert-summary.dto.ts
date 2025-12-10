// src/farm-alerts/dto/farm-alert-summary.dto.ts

import { ApiProperty } from '@nestjs/swagger';

/**
 * Compteurs par statut
 */
export class StatusCountsDto {
  @ApiProperty({ example: 15 })
  pending: number;

  @ApiProperty({ example: 42 })
  read: number;

  @ApiProperty({ example: 5 })
  dismissed: number;

  @ApiProperty({ example: 28 })
  resolved: number;
}

/**
 * DTO pour le résumé des alertes
 */
export class FarmAlertSummaryDto {
  @ApiProperty({
    description: 'Counts by status',
    type: StatusCountsDto,
  })
  byStatus: StatusCountsDto;

  @ApiProperty({
    description: 'Counts by category (from AlertTemplate)',
    example: { vaccination: 10, treatment: 5, nutrition: 3 },
  })
  byCategory: Record<string, number>;

  @ApiProperty({
    description: 'Counts by priority (from AlertTemplate)',
    example: { urgent: 2, high: 8, medium: 12, low: 5 },
  })
  byPriority: Record<string, number>;

  @ApiProperty({
    description: 'Total number of alerts (excluding resolved)',
    example: 62,
  })
  total: number;

  @ApiProperty({
    description: 'Number of unread alerts (pending status)',
    example: 15,
  })
  unreadCount: number;
}

/**
 * DTO pour le compteur d'alertes non lues (endpoint léger)
 */
export class UnreadCountDto {
  @ApiProperty({
    description: 'Number of unread alerts',
    example: 15,
  })
  count: number;
}
