import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeightDto, UpdateWeightDto, QueryWeightDto, StatsQueryDto, RankingsQueryDto, TrendsQueryDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class WeightsService {
  private readonly logger = new AppLogger(WeightsService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateWeightDto) {
    this.logger.debug(`Creating weight for animal ${dto.animalId} in farm ${farmId}`);

    // Verify animal belongs to farm
    const animal = await this.prisma.animal.findFirst({
      where: { id: dto.animalId, farmId, deletedAt: null },
    });

    if (!animal) {
      this.logger.warn('Animal not found for weight', { animalId: dto.animalId, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.WEIGHT_ANIMAL_NOT_FOUND,
        `Animal ${dto.animalId} not found`,
        { animalId: dto.animalId, farmId },
      );
    }

    try {
      // Destructure to exclude BaseSyncEntityDto fields and handle them explicitly
      const { farmId: dtoFarmId, created_at, updated_at, ...weightData } = dto;

      const weight = await this.prisma.weight.create({
        data: {
          ...weightData,
          farmId: dtoFarmId || farmId,
          weightDate: new Date(dto.weightDate),
          // CRITICAL: Use client timestamps if provided (offline-first)
          ...(created_at && { createdAt: new Date(created_at) }),
          ...(updated_at && { updatedAt: new Date(updated_at) }),
        },
        include: {
          animal: { select: { id: true, visualId: true, currentEid: true, officialNumber: true } },
        },
      });

      this.logger.audit('Weight created', { weightId: weight.id, animalId: dto.animalId, farmId });
      return weight;
    } catch (error) {
      this.logger.error(`Failed to create weight for animal ${dto.animalId}`, error.stack);
      throw error;
    }
  }

  async findAll(farmId: string, query: QueryWeightDto) {
    const { animalId, source, fromDate, toDate, page, limit, sort, order } = query;

    const where: any = {
      farmId,
      deletedAt: null,
      ...(animalId && { animalId }),
      ...(source && { source }),
    };

    if (fromDate || toDate) {
      where.weightDate = {};
      if (fromDate) where.weightDate.gte = new Date(fromDate);
      if (toDate) where.weightDate.lte = new Date(toDate);
    }

    const [weights, total] = await Promise.all([
      this.prisma.weight.findMany({
        where,
        include: {
          animal: { select: { id: true, visualId: true, currentEid: true, officialNumber: true } },
        },
        orderBy: { [sort || 'weightDate']: order || 'desc' },
        skip: ((page || 1) - 1) * (limit || 50),
        take: limit || 50,
      }),
      this.prisma.weight.count({ where }),
    ]);

    // Calculate dailyGain for each weight
    const animalIds = [...new Set(weights.map(w => w.animalId))];

    // Fetch all weights for these animals to calculate gains
    const allAnimalWeights = await this.prisma.weight.findMany({
      where: {
        farmId,
        deletedAt: null,
        animalId: { in: animalIds },
      },
      orderBy: { weightDate: 'asc' },
      select: { id: true, animalId: true, weight: true, weightDate: true },
    });

    // Build a map of previous weights by animal
    const weightsByAnimal = new Map<string, { id: string; weight: number; date: Date }[]>();
    allAnimalWeights.forEach(w => {
      if (!weightsByAnimal.has(w.animalId)) {
        weightsByAnimal.set(w.animalId, []);
      }
      weightsByAnimal.get(w.animalId)!.push({ id: w.id, weight: w.weight, date: w.weightDate });
    });

    // Add dailyGain to each weight
    const weightsWithGain = weights.map(w => {
      const animalHistory = weightsByAnimal.get(w.animalId) || [];
      const currentIndex = animalHistory.findIndex(h => h.id === w.id);

      let dailyGain: number | null = null;
      if (currentIndex > 0) {
        const prev = animalHistory[currentIndex - 1];
        const daysDiff = Math.ceil(
          (w.weightDate.getTime() - prev.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff > 0) {
          dailyGain = Math.round(((w.weight - prev.weight) / daysDiff) * 1000) / 1000;
        }
      }

      return { ...w, dailyGain };
    });

    return {
      data: weightsWithGain,
      meta: {
        page: page || 1,
        limit: limit || 50,
        total,
        totalPages: Math.ceil(total / (limit || 50)),
      },
    };
  }

  async findOne(farmId: string, id: string) {
    const weight = await this.prisma.weight.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
      include: {
        animal: { select: { id: true, visualId: true, currentEid: true, officialNumber: true } },
      },
    });

    if (!weight) {
      this.logger.warn('Weight not found', { weightId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.WEIGHT_NOT_FOUND,
        `Weight ${id} not found`,
        { weightId: id, farmId },
      );
    }

    return weight;
  }

  async update(farmId: string, id: string, dto: UpdateWeightDto) {
    this.logger.debug(`Updating weight ${id} (version ${dto.version})`);

    const existing = await this.prisma.weight.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      this.logger.warn('Weight not found', { weightId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.WEIGHT_NOT_FOUND,
        `Weight ${id} not found`,
        { weightId: id, farmId },
      );
    }

    // Version conflict check
    if (dto.version && existing.version > dto.version) {
      this.logger.warn('Version conflict detected', {
        weightId: id,
        serverVersion: existing.version,
        clientVersion: dto.version,
      });

      throw new EntityConflictException(
        ERROR_CODES.VERSION_CONFLICT,
        'Version conflict detected',
        {
          weightId: id,
          serverVersion: existing.version,
          clientVersion: dto.version,
        },
      );
    }

    // If reassigning to different animal, verify it belongs to farm
    if (dto.animalId && dto.animalId !== existing.animalId) {
      const animal = await this.prisma.animal.findFirst({
        where: { id: dto.animalId, farmId, deletedAt: null },
      });
      if (!animal) {
        throw new EntityNotFoundException(
          ERROR_CODES.WEIGHT_ANIMAL_NOT_FOUND,
          `Animal ${dto.animalId} not found`,
          { animalId: dto.animalId, farmId },
        );
      }
    }

    try {
      // Destructure to exclude BaseSyncEntityDto fields and date fields for conversion
      const { farmId: dtoFarmId, created_at, updated_at, version, weightDate, ...weightData } = dto;

      const updated = await this.prisma.weight.update({
        where: { id },
        data: {
          ...weightData,
          ...(weightDate && { weightDate: new Date(weightDate) }),
          // CRITICAL: Use client timestamp if provided (offline-first)
          ...(updated_at && { updatedAt: new Date(updated_at) }),
          version: { increment: 1 },
        },
        include: {
          animal: { select: { id: true, visualId: true, currentEid: true, officialNumber: true } },
        },
      });

      this.logger.audit('Weight updated', {
        weightId: id,
        farmId,
        version: `${existing.version} → ${updated.version}`,
      });

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update weight ${id}`, error.stack);
      throw error;
    }
  }

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting weight ${id}`);

    const existing = await this.prisma.weight.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      this.logger.warn('Weight not found', { weightId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.WEIGHT_NOT_FOUND,
        `Weight ${id} not found`,
        { weightId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.weight.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: { increment: 1 },
        },
      });

      this.logger.audit('Weight soft deleted', { weightId: id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete weight ${id}`, error.stack);
      throw error;
    }
  }

  // Get weight history for an animal with gain calculation
  async getAnimalWeightHistory(farmId: string, animalId: string) {
    this.logger.debug(`Getting weight history for animal ${animalId}`);

    const weights = await this.prisma.weight.findMany({
      where: {
        animalId,
        farmId,
        deletedAt: null,
      },
      orderBy: { weightDate: 'asc' },
    });

    // Calculate daily gain between consecutive weights
    const history = weights.map((w, i) => {
      let dailyGain: number | null = null;
      if (i > 0) {
        const prevWeight = weights[i - 1];
        const daysDiff = Math.ceil(
          (w.weightDate.getTime() - prevWeight.weightDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff > 0) {
          dailyGain = (w.weight - prevWeight.weight) / daysDiff;
        }
      }
      return {
        ...w,
        dailyGain: dailyGain !== null ? Math.round(dailyGain * 1000) / 1000 : null, // kg/day
      };
    });

    return history;
  }

  // Get statistics for weights
  async getStats(farmId: string, query: StatsQueryDto) {
    this.logger.debug(`Getting weight stats for farm ${farmId}`);

    const baseWhere = { farmId, deletedAt: null };

    // Period for periodWeighings: use query dates or default to last 30 days
    const now = new Date();
    const periodStart = query.fromDate
      ? new Date(query.fromDate)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const periodEnd = query.toDate ? new Date(query.toDate) : now;

    // Fetch all weights for calculations
    const allWeights = await this.prisma.weight.findMany({
      where: baseWhere,
      orderBy: { weightDate: 'asc' },
    });

    // Basic counts
    const totalWeighings = allWeights.length;
    const uniqueAnimals = new Set(allWeights.map(w => w.animalId)).size;

    // Period weighings
    const periodWeighings = allWeights.filter(
      w => w.weightDate >= periodStart && w.weightDate <= periodEnd
    ).length;

    // By source - ensure all sources are represented
    const sourceMap: Record<string, number> = {
      manual: 0,
      scale: 0,
      estimated: 0,
      automatic: 0,
      weighbridge: 0,
    };
    allWeights.forEach(w => {
      if (sourceMap[w.source] !== undefined) {
        sourceMap[w.source]++;
      } else {
        sourceMap[w.source] = 1;
      }
    });

    // Weight aggregations
    let weightAvg = 0;
    let weightMin = 0;
    let weightMax = 0;
    let latestAvg = 0;

    if (totalWeighings > 0) {
      const weightValues = allWeights.map(w => w.weight);
      weightAvg = weightValues.reduce((a, b) => a + b, 0) / weightValues.length;
      weightMin = Math.min(...weightValues);
      weightMax = Math.max(...weightValues);

      // Latest average: group by animal, take last weight per animal, then average
      const latestByAnimal = new Map<string, number>();
      allWeights.forEach(w => {
        latestByAnimal.set(w.animalId, w.weight); // Last one wins (ordered by weightDate asc)
      });
      const latestWeights = Array.from(latestByAnimal.values());
      latestAvg = latestWeights.reduce((a, b) => a + b, 0) / latestWeights.length;
    }

    // Growth calculations: for animals with >= 2 weighings
    const animalWeights = new Map<string, { weight: number; date: Date }[]>();
    allWeights.forEach(w => {
      if (!animalWeights.has(w.animalId)) {
        animalWeights.set(w.animalId, []);
      }
      animalWeights.get(w.animalId)!.push({ weight: w.weight, date: w.weightDate });
    });

    const dailyGains: number[] = [];
    animalWeights.forEach((weights) => {
      if (weights.length >= 2) {
        const first = weights[0];
        const last = weights[weights.length - 1];
        const daysDiff = Math.ceil(
          (last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff > 0) {
          const dailyGain = (last.weight - first.weight) / daysDiff;
          dailyGains.push(dailyGain);
        }
      }
    });

    const growth = {
      avgDailyGain: dailyGains.length > 0
        ? Math.round((dailyGains.reduce((a, b) => a + b, 0) / dailyGains.length) * 1000) / 1000
        : 0,
      animalsWithGain: dailyGains.length,
      minDailyGain: dailyGains.length > 0
        ? Math.round(Math.min(...dailyGains) * 1000) / 1000
        : 0,
      maxDailyGain: dailyGains.length > 0
        ? Math.round(Math.max(...dailyGains) * 1000) / 1000
        : 0,
    };

    // Last weighing date
    const lastWeighingDate = allWeights.length > 0
      ? allWeights[allWeights.length - 1].weightDate
      : null;

    return {
      success: true,
      data: {
        totalWeighings,
        uniqueAnimals,
        periodWeighings,
        bySource: sourceMap,
        weights: {
          avg: Math.round(weightAvg * 10) / 10,
          min: Math.round(weightMin * 10) / 10,
          max: Math.round(weightMax * 10) / 10,
          latestAvg: Math.round(latestAvg * 10) / 10,
        },
        growth,
        lastWeighingDate,
      },
    };
  }

  /**
   * Get animal rankings by daily gain (ADG)
   * Endpoint: GET /api/v1/farms/:farmId/weights/rankings
   */
  async getRankings(farmId: string, query: RankingsQueryDto) {
    this.logger.debug(`Getting weight rankings for farm ${farmId}`, query);

    const limit = query.limit || 5;
    const periodDays = query.period === '7d' ? 7 : query.period === '90d' ? 90 : 30;

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - periodDays);

    // Build where clause
    const where: any = {
      farmId,
      deletedAt: null,
      weightDate: { gte: periodStart },
    };

    // If lotId provided, get animals in that lot
    let animalIdsInLot: string[] | null = null;
    if (query.lotId) {
      const lotAnimals = await this.prisma.lotAnimal.findMany({
        where: { lotId: query.lotId, leftAt: null },
        select: { animalId: true },
      });
      animalIdsInLot = lotAnimals.map(la => la.animalId);
      where.animalId = { in: animalIdsInLot };
    }

    // Get all weights in the period
    const weights = await this.prisma.weight.findMany({
      where,
      orderBy: { weightDate: 'asc' },
      include: {
        animal: {
          select: {
            id: true,
            visualId: true,
            currentEid: true,
            officialNumber: true,
            sex: true,
            birthDate: true,
          },
        },
      },
    });

    // Group by animal and calculate ADG
    const animalData = new Map<string, {
      animal: any;
      weights: { weight: number; date: Date }[];
      adg: number | null;
      latestWeight: number;
    }>();

    weights.forEach(w => {
      if (!animalData.has(w.animalId)) {
        animalData.set(w.animalId, {
          animal: w.animal,
          weights: [],
          adg: null,
          latestWeight: 0,
        });
      }
      animalData.get(w.animalId)!.weights.push({ weight: w.weight, date: w.weightDate });
    });

    // Calculate ADG for each animal
    const rankings: {
      animalId: string;
      animal: any;
      adg: number;
      latestWeight: number;
      weighingCount: number;
      status: 'excellent' | 'good' | 'warning' | 'critical';
    }[] = [];

    animalData.forEach((data, animalId) => {
      if (data.weights.length >= 2) {
        const first = data.weights[0];
        const last = data.weights[data.weights.length - 1];
        const daysDiff = Math.ceil(
          (last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff > 0) {
          const adg = Math.round(((last.weight - first.weight) / daysDiff) * 1000) / 1000;
          data.adg = adg;
          data.latestWeight = last.weight;

          // Determine status based on thresholds
          let status: 'excellent' | 'good' | 'warning' | 'critical';
          if (adg >= 1.0) status = 'excellent';
          else if (adg >= 0.8) status = 'good';
          else if (adg >= 0.6) status = 'warning';
          else status = 'critical';

          rankings.push({
            animalId,
            animal: data.animal,
            adg,
            latestWeight: Math.round(data.latestWeight * 10) / 10,
            weighingCount: data.weights.length,
            status,
          });
        }
      }
    });

    // Sort by ADG descending
    rankings.sort((a, b) => b.adg - a.adg);

    // Get top performers and underperformers
    const topPerformers = rankings.slice(0, limit);
    const underperformers = rankings
      .filter(r => r.status === 'critical' || r.status === 'warning')
      .slice(-limit)
      .reverse();

    // Thresholds for reference
    const thresholds = {
      excellent: 1.0,
      good: 0.8,
      warning: 0.6,
      critical: 0.5,
    };

    return {
      success: true,
      data: {
        period: query.period || '30d',
        periodStart,
        periodEnd: new Date(),
        totalAnimalsWithData: rankings.length,
        topPerformers,
        underperformers,
        thresholds,
      },
    };
  }

  /**
   * Get historical ADG trends for charting
   * Endpoint: GET /api/v1/farms/:farmId/weights/trends
   */
  async getTrends(farmId: string, query: TrendsQueryDto) {
    this.logger.debug(`Getting weight trends for farm ${farmId}`, query);

    const now = new Date();
    const period = query.period || '6months';
    const groupBy = query.groupBy || 'month';

    // Calculate period start date
    let periodStart: Date;
    if (period === '30d') {
      periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === '3months') {
      periodStart = new Date(now);
      periodStart.setMonth(periodStart.getMonth() - 3);
    } else if (period === '1year') {
      periodStart = new Date(now);
      periodStart.setFullYear(periodStart.getFullYear() - 1);
    } else {
      // 6months default
      periodStart = new Date(now);
      periodStart.setMonth(periodStart.getMonth() - 6);
    }

    // Build where clause for animals filter
    let animalIdsFilter: string[] | null = null;
    if (query.lotId) {
      const lotAnimals = await this.prisma.lotAnimal.findMany({
        where: { lotId: query.lotId, leftAt: null },
        select: { animalId: true },
      });
      animalIdsFilter = lotAnimals.map(la => la.animalId);
    }

    // Get ALL weights for these animals (need history for ADG calculation)
    const allWeightsWhere: any = {
      farmId,
      deletedAt: null,
    };
    if (animalIdsFilter) {
      allWeightsWhere.animalId = { in: animalIdsFilter };
    }

    const allWeights = await this.prisma.weight.findMany({
      where: allWeightsWhere,
      orderBy: { weightDate: 'asc' },
    });

    if (allWeights.length === 0) {
      return {
        success: true,
        data: {
          period,
          groupBy,
          startDate: periodStart.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
          dataPoints: [],
          summary: {
            overallAvgDailyGain: 0,
            trend: 'stable' as const,
            trendPercentage: 0,
          },
          benchmarks: {
            farmTarget: 0.8,
            nationalAverage: 0.75,
          },
        },
      };
    }

    // Group weights by animal and calculate ADG for each weight
    const weightsByAnimal = new Map<string, { weight: number; date: Date; adg: number | null }[]>();
    allWeights.forEach(w => {
      if (!weightsByAnimal.has(w.animalId)) {
        weightsByAnimal.set(w.animalId, []);
      }
      weightsByAnimal.get(w.animalId)!.push({ weight: w.weight, date: w.weightDate, adg: null });
    });

    // Calculate ADG for each weight (compared to previous weight of same animal)
    weightsByAnimal.forEach(animalWeights => {
      for (let i = 1; i < animalWeights.length; i++) {
        const prev = animalWeights[i - 1];
        const curr = animalWeights[i];
        const daysDiff = Math.ceil(
          (curr.date.getTime() - prev.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff > 0) {
          curr.adg = (curr.weight - prev.weight) / daysDiff;
        }
      }
    });

    // Helper to get period key
    const getPeriodKey = (date: Date): string => {
      if (groupBy === 'day') {
        return date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return d.toISOString().split('T')[0];
      } else {
        // month
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
    };

    // Group weights within the period by time period
    const dataPointsMap = new Map<string, {
      weights: number[];
      adgs: number[];
      animalIds: Set<string>;
      weighingsCount: number;
    }>();

    weightsByAnimal.forEach((animalWeights, animalId) => {
      animalWeights.forEach(w => {
        // Only include weights within the requested period
        if (w.date < periodStart) return;

        const key = getPeriodKey(w.date);

        if (!dataPointsMap.has(key)) {
          dataPointsMap.set(key, {
            weights: [],
            adgs: [],
            animalIds: new Set(),
            weighingsCount: 0,
          });
        }

        const point = dataPointsMap.get(key)!;
        point.weights.push(w.weight);
        if (w.adg !== null) {
          point.adgs.push(w.adg);
        }
        point.animalIds.add(animalId);
        point.weighingsCount++;
      });
    });

    // Calculate averages for each period
    const dataPoints = Array.from(dataPointsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, data]) => ({
        date: key,
        avgDailyGain: data.adgs.length > 0
          ? Math.round((data.adgs.reduce((a, b) => a + b, 0) / data.adgs.length) * 1000) / 1000
          : 0,
        animalCount: data.animalIds.size,
        weighingsCount: data.weighingsCount,
        avgWeight: Math.round((data.weights.reduce((a, b) => a + b, 0) / data.weights.length) * 10) / 10,
      }));

    // Calculate summary
    const allAdgs = dataPoints.map(dp => dp.avgDailyGain).filter(adg => adg > 0);
    const overallAvgDailyGain = allAdgs.length > 0
      ? Math.round((allAdgs.reduce((a, b) => a + b, 0) / allAdgs.length) * 1000) / 1000
      : 0;

    // Calculate trend (compare first and last periods with ADG data)
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let trendPercentage = 0;

    const validDataPoints = dataPoints.filter(dp => dp.avgDailyGain > 0);
    if (validDataPoints.length >= 2) {
      const firstAdg = validDataPoints[0].avgDailyGain;
      const lastAdg = validDataPoints[validDataPoints.length - 1].avgDailyGain;
      const change = lastAdg - firstAdg;
      trendPercentage = firstAdg > 0
        ? Math.round((change / firstAdg) * 100 * 10) / 10
        : 0;

      if (trendPercentage > 5) {
        trend = 'increasing';
      } else if (trendPercentage < -5) {
        trend = 'decreasing';
      } else {
        trend = 'stable';
      }
    }

    return {
      success: true,
      data: {
        period,
        groupBy,
        startDate: periodStart.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
        dataPoints,
        summary: {
          overallAvgDailyGain,
          trend,
          trendPercentage,
        },
        benchmarks: {
          farmTarget: 0.8,
          nationalAverage: 0.75,
        },
      },
    };
  }
}
