import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PharmacyStatsQueryDto, PharmacyAlertsQueryDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class PharmacyService {
  private readonly logger = new AppLogger(PharmacyService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate period start date based on period string
   */
  private getPeriodStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '3months':
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      case '6months':
        return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      case '12months':
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Get pharmacy statistics for a farm
   * GET /api/v1/farms/:farmId/pharmacy/stats
   */
  async getStats(farmId: string, query: PharmacyStatsQueryDto) {
    this.logger.debug(`Getting pharmacy stats for farm ${farmId}`, query);

    // Verify farm exists
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new EntityNotFoundException(
        ERROR_CODES.ENTITY_NOT_FOUND,
        `Farm with ID "${farmId}" not found`,
        { farmId },
      );
    }

    const period = query.period || '30d';
    const periodStart = this.getPeriodStartDate(period);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Threshold for expiring soon (30 days)
    const expiryThreshold = new Date(today);
    expiryThreshold.setDate(expiryThreshold.getDate() + 30);

    // Run all queries in parallel for performance
    const [
      totalProducts,
      activeLots,
      expiringLots,
      expiredLots,
      treatmentsInPeriod,
      vaccinationsInPeriod,
      recentTreatments,
    ] = await Promise.all([
      // Total products selected by farmer
      this.prisma.farmProductPreference.count({
        where: {
          farmId,
          deletedAt: null,
          isActive: true,
        },
      }),

      // Active lots (not expired, not deleted)
      this.prisma.farmerProductLot.count({
        where: {
          config: { farmId },
          isActive: true,
          deletedAt: null,
          expiryDate: { gte: today },
        },
      }),

      // Lots expiring within 30 days
      this.prisma.farmerProductLot.count({
        where: {
          config: { farmId },
          isActive: true,
          deletedAt: null,
          expiryDate: {
            gte: today,
            lte: expiryThreshold,
          },
        },
      }),

      // Already expired lots (still active)
      this.prisma.farmerProductLot.count({
        where: {
          config: { farmId },
          isActive: true,
          deletedAt: null,
          expiryDate: { lt: today },
        },
      }),

      // Treatments in period
      this.prisma.treatment.count({
        where: {
          farmId,
          deletedAt: null,
          type: 'treatment',
          treatmentDate: { gte: periodStart },
        },
      }),

      // Vaccinations in period
      this.prisma.treatment.count({
        where: {
          farmId,
          deletedAt: null,
          type: 'vaccination',
          treatmentDate: { gte: periodStart },
        },
      }),

      // Recent treatments with product info (for top products)
      this.prisma.treatment.groupBy({
        by: ['productId'],
        where: {
          farmId,
          deletedAt: null,
          productId: { not: null },
          treatmentDate: { gte: periodStart },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    // Get product names for top products
    let topProducts: { productId: string; productName: string; count: number }[] = [];
    if (recentTreatments.length > 0) {
      const productIds = recentTreatments.map(t => t.productId).filter(Boolean) as string[];
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, nameFr: true, commercialName: true },
      });

      const productMap = new Map(products.map(p => [p.id, p.commercialName || p.nameFr]));
      topProducts = recentTreatments.map(t => ({
        productId: t.productId!,
        productName: productMap.get(t.productId!) || 'Unknown',
        count: t._count.id,
      }));
    }

    this.logger.audit('Pharmacy stats retrieved', { farmId, period });

    return {
      success: true,
      data: {
        summary: {
          totalProducts,
          activeLots,
          expiringLots,
          expiredLots,
        },
        activity: {
          treatmentsInPeriod,
          vaccinationsInPeriod,
          totalInPeriod: treatmentsInPeriod + vaccinationsInPeriod,
        },
        topProducts,
        period,
        periodStart: periodStart.toISOString().split('T')[0],
      },
    };
  }

  /**
   * Get pharmacy alerts (expiring and expired lots)
   * GET /api/v1/farms/:farmId/pharmacy/alerts
   */
  async getAlerts(farmId: string, query: PharmacyAlertsQueryDto) {
    this.logger.debug(`Getting pharmacy alerts for farm ${farmId}`, query);

    // Verify farm exists
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new EntityNotFoundException(
        ERROR_CODES.ENTITY_NOT_FOUND,
        `Farm with ID "${farmId}" not found`,
        { farmId },
      );
    }

    const daysThreshold = query.daysThreshold || 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thresholdDate = new Date(today);
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    // Run queries in parallel
    const [expiringSoon, expired] = await Promise.all([
      // Lots expiring within threshold
      this.prisma.farmerProductLot.findMany({
        where: {
          config: { farmId },
          isActive: true,
          deletedAt: null,
          expiryDate: {
            gte: today,
            lte: thresholdDate,
          },
        },
        include: {
          config: {
            include: {
              product: {
                select: {
                  id: true,
                  nameFr: true,
                  commercialName: true,
                },
              },
            },
          },
        },
        orderBy: { expiryDate: 'asc' },
      }),

      // Already expired lots
      this.prisma.farmerProductLot.findMany({
        where: {
          config: { farmId },
          isActive: true,
          deletedAt: null,
          expiryDate: { lt: today },
        },
        include: {
          config: {
            include: {
              product: {
                select: {
                  id: true,
                  nameFr: true,
                  commercialName: true,
                },
              },
            },
          },
        },
        orderBy: { expiryDate: 'desc' },
      }),
    ]);

    // Transform to response format
    const formatLot = (lot: any) => ({
      id: lot.id,
      nickname: lot.nickname,
      officialLotNumber: lot.officialLotNumber,
      expiryDate: lot.expiryDate.toISOString().split('T')[0],
      daysUntilExpiry: Math.ceil(
        (lot.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      ),
      product: {
        id: lot.config.product.id,
        name: lot.config.product.commercialName || lot.config.product.nameFr,
      },
      configId: lot.config.id,
    });

    this.logger.audit('Pharmacy alerts retrieved', {
      farmId,
      daysThreshold,
      expiringSoonCount: expiringSoon.length,
      expiredCount: expired.length,
    });

    return {
      success: true,
      data: {
        expiringSoon: expiringSoon.map(formatLot),
        expired: expired.map(formatLot),
        summary: {
          expiringSoonCount: expiringSoon.length,
          expiredCount: expired.length,
          totalAlerts: expiringSoon.length + expired.length,
        },
        daysThreshold,
      },
    };
  }
}
