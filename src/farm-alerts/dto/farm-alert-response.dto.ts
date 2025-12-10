// src/farm-alerts/dto/farm-alert-response.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FarmAlertStatus, ReadPlatform } from '../types';
import type { FarmAlertMetadata } from '../types';

/**
 * Référence minimale vers un animal
 */
export class AnimalRefDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiPropertyOptional({ example: '982000123456789' })
  currentEid: string | null;

  @ApiPropertyOptional({ example: 'DZ-16-2025-00001' })
  officialNumber: string | null;

  @ApiPropertyOptional({ example: 'A001' })
  visualId: string | null;
}

/**
 * Référence minimale vers un lot
 */
export class LotRefDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Lot vaccination printemps' })
  name: string;
}

/**
 * Référence minimale vers un template d'alerte
 */
export class AlertTemplateRefDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'VACC_DUE' })
  code: string;

  @ApiProperty({ example: 'Vaccination à venir' })
  nameFr: string;

  @ApiProperty({ example: 'Vaccination Due' })
  nameEn: string;

  @ApiProperty({ example: 'التطعيم المستحق' })
  nameAr: string;

  @ApiProperty({ example: 'vaccination' })
  category: string;

  @ApiProperty({ example: 'high' })
  priority: string;
}

/**
 * DTO de réponse pour une alerte
 */
export class FarmAlertResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Farm ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  farmId: string;

  @ApiProperty({
    description: 'Alert template ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  alertTemplateId: string;

  @ApiPropertyOptional({
    description: 'Alert preference ID (if customized)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  alertPreferenceId: string | null;

  @ApiPropertyOptional({
    description: 'Related animal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  animalId: string | null;

  @ApiPropertyOptional({
    description: 'Related lot ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  lotId: string | null;

  @ApiPropertyOptional({
    description: 'Related treatment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  treatmentId: string | null;

  @ApiPropertyOptional({
    description: 'Related breeding ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  breedingId: string | null;

  @ApiPropertyOptional({
    description: 'Related document ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  documentId: string | null;

  @ApiProperty({
    description: 'Date when the alert was triggered',
    example: '2025-01-15T08:00:00.000Z',
  })
  triggeredAt: Date;

  @ApiPropertyOptional({
    description: 'Due date for the alert action',
    example: '2025-01-22T08:00:00.000Z',
    nullable: true,
  })
  dueDate: Date | null;

  @ApiPropertyOptional({
    description: 'Expiration date of the alert',
    example: '2025-02-15T08:00:00.000Z',
    nullable: true,
  })
  expiresAt: Date | null;

  @ApiProperty({
    description: 'Current status of the alert',
    enum: FarmAlertStatus,
    example: FarmAlertStatus.PENDING,
  })
  status: FarmAlertStatus;

  @ApiPropertyOptional({
    description: 'Date when the alert was read',
    example: '2025-01-16T10:30:00.000Z',
    nullable: true,
  })
  readAt: Date | null;

  @ApiPropertyOptional({
    description: 'Platform where the alert was read',
    enum: ReadPlatform,
    example: ReadPlatform.WEB,
    nullable: true,
  })
  readOn: ReadPlatform | null;

  @ApiPropertyOptional({
    description: 'Date when the alert was resolved',
    example: '2025-01-20T14:00:00.000Z',
    nullable: true,
  })
  resolvedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Date when the alert was dismissed',
    example: null,
    nullable: true,
  })
  dismissedAt: Date | null;

  @ApiProperty({
    description: 'Contextual metadata for the alert',
    example: { vaccineName: 'Enterotoxemia', daysUntilDue: 7 },
  })
  metadata: FarmAlertMetadata;

  @ApiProperty({
    description: 'Version number for optimistic locking',
    example: 1,
  })
  version: number;

  @ApiPropertyOptional({
    description: 'Soft delete timestamp',
    example: null,
    nullable: true,
  })
  deletedAt: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-15T08:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-15T08:00:00.000Z',
  })
  updatedAt: Date;

  // Relations (optionnelles, incluses selon le contexte)

  @ApiPropertyOptional({
    description: 'Alert template details',
    type: AlertTemplateRefDto,
  })
  alertTemplate?: AlertTemplateRefDto;

  @ApiPropertyOptional({
    description: 'Related animal details',
    type: AnimalRefDto,
  })
  animal?: AnimalRefDto;

  @ApiPropertyOptional({
    description: 'Related lot details',
    type: LotRefDto,
  })
  lot?: LotRefDto;
}

/**
 * DTO pour la réponse paginée
 */
export class PaginatedFarmAlertsResponseDto {
  @ApiProperty({
    description: 'List of alerts',
    type: [FarmAlertResponseDto],
  })
  data: FarmAlertResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
