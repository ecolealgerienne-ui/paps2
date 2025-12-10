// src/farm-alerts/farm-alerts.service.ts

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';
import {
  FarmAlertStatus,
  ReadPlatform,
  FarmAlertFilterOptions,
  FarmAlertSummary,
} from './types';
import {
  FarmAlertResponseDto,
  PaginatedFarmAlertsResponseDto,
  FarmAlertSummaryDto,
  UnreadCountDto,
  BulkUpdateResultDto,
} from './dto';

/**
 * Service pour la gestion des alertes générées
 */
@Injectable()
export class FarmAlertsService {
  private readonly logger = new AppLogger(FarmAlertsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère la liste paginée des alertes pour une ferme
   */
  async findAll(
    farmId: string,
    options: FarmAlertFilterOptions = {},
  ): Promise<PaginatedFarmAlertsResponseDto> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    // Construction du filtre WHERE
    const where: Prisma.FarmAlertWhereInput = {
      farmId,
      deletedAt: null,
    };

    if (options.status) {
      where.status = options.status;
    }

    if (options.animalId) {
      where.animalId = options.animalId;
    }

    if (options.lotId) {
      where.lotId = options.lotId;
    }

    if (options.category || options.priority) {
      where.alertTemplate = {
        ...(options.category && { category: options.category as any }),
        ...(options.priority && { priority: options.priority as any }),
      };
    }

    if (options.fromDate || options.toDate) {
      where.triggeredAt = {
        ...(options.fromDate && { gte: new Date(options.fromDate) }),
        ...(options.toDate && { lte: new Date(options.toDate) }),
      };
    }

    // Construction du tri
    const orderByField = options.orderBy || 'triggeredAt';
    const orderDirection = options.order || 'desc';

    let orderBy: Prisma.FarmAlertOrderByWithRelationInput;
    if (orderByField === 'priority') {
      // Tri par priorité via la relation alertTemplate
      orderBy = {
        alertTemplate: { priority: orderDirection },
      };
    } else {
      orderBy = { [orderByField]: orderDirection };
    }

    // Exécution des requêtes en parallèle
    const [total, data] = await Promise.all([
      this.prisma.farmAlert.count({ where }),
      this.prisma.farmAlert.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          alertTemplate: {
            select: {
              id: true,
              code: true,
              nameFr: true,
              nameEn: true,
              nameAr: true,
              category: true,
              priority: true,
            },
          },
          animal: {
            select: {
              id: true,
              currentEid: true,
              officialNumber: true,
              visualId: true,
            },
          },
          lot: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    this.logger.debug(`Found ${data.length} alerts for farm ${farmId}`, {
      total,
      page,
      limit,
    });

    return {
      data: data as unknown as FarmAlertResponseDto[],
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère une alerte par son ID
   */
  async findOne(farmId: string, alertId: string): Promise<FarmAlertResponseDto> {
    const alert = await this.prisma.farmAlert.findFirst({
      where: {
        id: alertId,
        farmId,
        deletedAt: null,
      },
      include: {
        alertTemplate: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            category: true,
            priority: true,
            descriptionFr: true,
            descriptionEn: true,
            descriptionAr: true,
          },
        },
        animal: {
          select: {
            id: true,
            currentEid: true,
            officialNumber: true,
            visualId: true,
          },
        },
        lot: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!alert) {
      throw new EntityNotFoundException(
        ERROR_CODES.FARM_ALERT_NOT_FOUND,
        `Alert with ID ${alertId} not found`,
        { alertId, farmId },
      );
    }

    return alert as unknown as FarmAlertResponseDto;
  }

  /**
   * Met à jour le statut d'une alerte
   */
  async updateStatus(
    farmId: string,
    alertId: string,
    status: FarmAlertStatus,
    readOn?: ReadPlatform,
  ): Promise<FarmAlertResponseDto> {
    // Vérifier que l'alerte existe
    const existing = await this.prisma.farmAlert.findFirst({
      where: {
        id: alertId,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new EntityNotFoundException(
        ERROR_CODES.FARM_ALERT_NOT_FOUND,
        `Alert with ID ${alertId} not found`,
        { alertId, farmId },
      );
    }

    // Préparer les données de mise à jour
    const updateData: Prisma.FarmAlertUpdateInput = {
      status,
      version: { increment: 1 },
    };

    // Ajouter les timestamps selon le statut
    const now = new Date();
    if (status === FarmAlertStatus.READ && existing.status === FarmAlertStatus.PENDING) {
      updateData.readAt = now;
      updateData.readOn = readOn;
    } else if (status === FarmAlertStatus.DISMISSED) {
      updateData.dismissedAt = now;
    } else if (status === FarmAlertStatus.RESOLVED) {
      updateData.resolvedAt = now;
    }

    const updated = await this.prisma.farmAlert.update({
      where: { id: alertId },
      data: updateData,
      include: {
        alertTemplate: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            category: true,
            priority: true,
          },
        },
      },
    });

    this.logger.audit('Alert status updated', {
      alertId,
      farmId,
      oldStatus: existing.status,
      newStatus: status,
    });

    return updated as unknown as FarmAlertResponseDto;
  }

  /**
   * Marque toutes les alertes pending comme lues
   */
  async markAllAsRead(
    farmId: string,
    readOn: ReadPlatform,
    category?: string,
    priority?: string,
  ): Promise<BulkUpdateResultDto> {
    const now = new Date();

    // Construction du filtre
    const where: Prisma.FarmAlertWhereInput = {
      farmId,
      status: FarmAlertStatus.PENDING,
      deletedAt: null,
    };

    if (category || priority) {
      where.alertTemplate = {
        ...(category && { category: category as any }),
        ...(priority && { priority: priority as any }),
      };
    }

    const result = await this.prisma.farmAlert.updateMany({
      where,
      data: {
        status: FarmAlertStatus.READ,
        readAt: now,
        readOn,
      },
    });

    this.logger.audit('All alerts marked as read', {
      farmId,
      count: result.count,
      category,
      priority,
    });

    return {
      updated: result.count,
      failed: 0,
    };
  }

  /**
   * Mise à jour en masse des alertes
   */
  async bulkUpdate(
    farmId: string,
    alertIds: string[],
    status: FarmAlertStatus,
    readOn?: ReadPlatform,
  ): Promise<BulkUpdateResultDto> {
    const now = new Date();

    // Préparer les données de mise à jour
    const updateData: Prisma.FarmAlertUpdateManyMutationInput = {
      status,
    };

    if (status === FarmAlertStatus.READ) {
      updateData.readAt = now;
      updateData.readOn = readOn;
    } else if (status === FarmAlertStatus.DISMISSED) {
      updateData.dismissedAt = now;
    } else if (status === FarmAlertStatus.RESOLVED) {
      updateData.resolvedAt = now;
    }

    const result = await this.prisma.farmAlert.updateMany({
      where: {
        id: { in: alertIds },
        farmId,
        deletedAt: null,
      },
      data: updateData,
    });

    const failed = alertIds.length - result.count;

    this.logger.audit('Bulk alert update', {
      farmId,
      requested: alertIds.length,
      updated: result.count,
      failed,
      status,
    });

    return {
      updated: result.count,
      failed,
      ...(failed > 0 && { failedIds: [] }), // On ne peut pas facilement identifier les IDs échoués avec updateMany
    };
  }

  /**
   * Récupère le résumé des alertes pour une ferme
   */
  async getSummary(farmId: string): Promise<FarmAlertSummaryDto> {
    // Compter par statut
    const statusCounts = await this.prisma.farmAlert.groupBy({
      by: ['status'],
      where: {
        farmId,
        deletedAt: null,
      },
      _count: true,
    });

    // Compter par catégorie (via alertTemplate)
    const categoryCounts = await this.prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
      SELECT at.category, COUNT(fa.id) as count
      FROM farm_alerts fa
      JOIN alert_templates at ON fa.alert_template_id = at.id
      WHERE fa.farm_id = ${farmId}
        AND fa.deleted_at IS NULL
        AND fa.status != 'resolved'
      GROUP BY at.category
    `;

    // Compter par priorité (via alertTemplate)
    const priorityCounts = await this.prisma.$queryRaw<Array<{ priority: string; count: bigint }>>`
      SELECT at.priority, COUNT(fa.id) as count
      FROM farm_alerts fa
      JOIN alert_templates at ON fa.alert_template_id = at.id
      WHERE fa.farm_id = ${farmId}
        AND fa.deleted_at IS NULL
        AND fa.status != 'resolved'
      GROUP BY at.priority
    `;

    // Transformer les résultats
    const byStatus = {
      pending: 0,
      read: 0,
      dismissed: 0,
      resolved: 0,
    };

    for (const row of statusCounts) {
      byStatus[row.status as keyof typeof byStatus] = row._count;
    }

    const byCategory: Record<string, number> = {};
    for (const row of categoryCounts) {
      byCategory[row.category] = Number(row.count);
    }

    const byPriority: Record<string, number> = {};
    for (const row of priorityCounts) {
      byPriority[row.priority] = Number(row.count);
    }

    const total = byStatus.pending + byStatus.read + byStatus.dismissed;

    return {
      byStatus,
      byCategory,
      byPriority,
      total,
      unreadCount: byStatus.pending,
    };
  }

  /**
   * Récupère uniquement le compteur d'alertes non lues (endpoint léger)
   */
  async getUnreadCount(farmId: string): Promise<UnreadCountDto> {
    const count = await this.prisma.farmAlert.count({
      where: {
        farmId,
        status: FarmAlertStatus.PENDING,
        deletedAt: null,
      },
    });

    return { count };
  }

  /**
   * Soft delete une alerte
   */
  async remove(farmId: string, alertId: string): Promise<void> {
    const existing = await this.prisma.farmAlert.findFirst({
      where: {
        id: alertId,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new EntityNotFoundException(
        ERROR_CODES.FARM_ALERT_NOT_FOUND,
        `Alert with ID ${alertId} not found`,
        { alertId, farmId },
      );
    }

    await this.prisma.farmAlert.update({
      where: { id: alertId },
      data: {
        deletedAt: new Date(),
        version: { increment: 1 },
      },
    });

    this.logger.audit('Alert soft deleted', { alertId, farmId });
  }
}
