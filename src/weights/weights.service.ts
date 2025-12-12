import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeightDto, UpdateWeightDto, QueryWeightDto, StatsQueryDto, RankingsQueryDto, TrendsQueryDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';
import { AlertEngineService } from '../farm-alerts/alert-engine/alert-engine.service';

@Injectable()
export class WeightsService {
  private readonly logger = new AppLogger(WeightsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AlertEngineService))
    private alertEngineService: AlertEngineService,
  ) {}

  /**
   * Trigger alert regeneration after weight changes (non-blocking)
   */
  private triggerAlertRegeneration(farmId: string): void {
    this.alertEngineService.invalidateAndRegenerate(farmId).catch((err) => {
      this.logger.error(`Alert regeneration failed for farm ${farmId}`, err.stack);
    });
  }

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

      // Trigger alert regeneration
      this.triggerAlertRegeneration(farmId);

      return weight;
    } catch (error) {
      this.logger.error(`Failed to create weight for animal ${dto.animalId}`, error.stack);
      throw error;
    }
  }

  async findAll(farmId: string, query: QueryWeightDto) {
    const { animalId, lotId, animalStatus, source, fromDate, toDate, page, limit, sort, order } = query;

    const where: any = {
      farmId,
      deletedAt: null,
      ...(animalId && { animalId }),
      ...(source && { source }),
    };

    // P1.2: Filter by lot ID - get animals currently in the lot
    if (lotId) {
      const lotAnimals = await this.prisma.lotAnimal.findMany({
        where: { lotId, leftAt: null },
        select: { animalId: true },
      });
      const animalIdsInLot = lotAnimals.map(la => la.animalId);

      if (animalIdsInLot.length === 0) {
        // No animals in this lot, return empty result
        return {
          data: [],
          meta: {
            page: page || 1,
            limit: limit || 50,
            total: 0,
            totalPages: 0,
          },
        };
      }

      // If animalId is also specified, intersect with lotId filter
      if (animalId) {
        if (!animalIdsInLot.includes(animalId)) {
          return {
            data: [],
            meta: {
              page: page || 1,
              limit: limit || 50,
              total: 0,
              totalPages: 0,
            },
          };
        }
        // animalId is already in where, keep it
      } else {
        where.animalId = { in: animalIdsInLot };
      }
    }

    // Filter by animal status (if not 'all' or undefined)
    if (animalStatus && animalStatus !== 'all') {
      where.animal = { status: animalStatus };
    }

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

      // Trigger alert regeneration
      this.triggerAlertRegeneration(farmId);

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

      // Trigger alert regeneration
      this.triggerAlertRegeneration(farmId);

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

    const baseWhere: any = { farmId, deletedAt: null };

    // Filter by animal status (if not 'all' or undefined)
    if (query.animalStatus && query.animalStatus !== 'all') {
      baseWhere.animal = { status: query.animalStatus };
    }

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

    // Map period string to days
    const periodDaysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '180d': 180,
      '365d': 365,
      '730d': 730,
    };
    const periodDays = periodDaysMap[query.period || '30d'] || 30;

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

    // Get lot info for all animals
    const animalIds = [...new Set(weights.map(w => w.animalId))];
    const lotAnimals = await this.prisma.lotAnimal.findMany({
      where: {
        animalId: { in: animalIds },
        leftAt: null,
      },
      include: {
        lot: { select: { id: true, name: true } },
      },
    });

    const animalLotMap = new Map<string, string>();
    lotAnimals.forEach(la => {
      animalLotMap.set(la.animalId, la.lot.name);
    });

    // Group by animal and calculate ADG
    const animalData = new Map<string, {
      animal: any;
      weights: { weight: number; date: Date }[];
      adg: number | null;
      latestWeight: number;
      firstWeight: number;
    }>();

    weights.forEach(w => {
      if (!animalData.has(w.animalId)) {
        animalData.set(w.animalId, {
          animal: w.animal,
          weights: [],
          adg: null,
          latestWeight: 0,
          firstWeight: 0,
        });
      }
      animalData.get(w.animalId)!.weights.push({ weight: w.weight, date: w.weightDate });
    });

    // Calculate ADG for each animal
    const rankings: {
      animalId: string;
      visualId: string;
      officialNumber: string | null;
      avgDailyGain: number;
      weightGain: number;
      weighingsCount: number;
      currentWeight: number;
      lotName: string | null;
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
          const weightGain = Math.round((last.weight - first.weight) * 10) / 10;

          rankings.push({
            animalId,
            visualId: data.animal.visualId || '',
            officialNumber: data.animal.officialNumber,
            avgDailyGain: adg,
            weightGain,
            weighingsCount: data.weights.length,
            currentWeight: Math.round(last.weight * 10) / 10,
            lotName: animalLotMap.get(animalId) || null,
          });
        }
      }
    });

    // Sort by ADG descending for top
    rankings.sort((a, b) => b.avgDailyGain - a.avgDailyGain);

    // Get top performers
    const top = rankings.slice(0, limit);

    // Get bottom performers (sorted by ADG ascending)
    const bottom = [...rankings]
      .sort((a, b) => a.avgDailyGain - b.avgDailyGain)
      .slice(0, limit);

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
        calculatedAt: new Date().toISOString(),
        top,
        bottom,
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
    } else if (period === '12months') {
      periodStart = new Date(now);
      periodStart.setFullYear(periodStart.getFullYear() - 1);
    } else if (period === '24months') {
      periodStart = new Date(now);
      periodStart.setFullYear(periodStart.getFullYear() - 2);
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

    // Group weights by animal
    const weightsByAnimal = new Map<string, { weight: number; date: Date; adg: number | null }[]>();
    allWeights.forEach(w => {
      if (!weightsByAnimal.has(w.animalId)) {
        weightsByAnimal.set(w.animalId, []);
      }
      weightsByAnimal.get(w.animalId)!.push({ weight: w.weight, date: w.weightDate, adg: null });
    });

    // IMPORTANT: Sort each animal's weights by date to ensure correct order
    weightsByAnimal.forEach(animalWeights => {
      animalWeights.sort((a, b) => a.date.getTime() - b.date.getTime());
    });

    // Calculate ADG for each weight (compared to previous weight of same animal)
    // Only consider consecutive weighings within a reasonable timeframe (max 90 days)
    const MAX_DAYS_FOR_ADG = 90;
    const MIN_REALISTIC_ADG = -1.5; // kg/day - can't lose more than 1.5kg/day
    const MAX_REALISTIC_ADG = 3.0;  // kg/day - can't gain more than 3kg/day

    weightsByAnimal.forEach(animalWeights => {
      for (let i = 1; i < animalWeights.length; i++) {
        const prev = animalWeights[i - 1];
        const curr = animalWeights[i];
        const daysDiff = Math.ceil(
          (curr.date.getTime() - prev.date.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only calculate ADG for reasonable time periods
        if (daysDiff > 0 && daysDiff <= MAX_DAYS_FOR_ADG) {
          const adg = (curr.weight - prev.weight) / daysDiff;
          // Only keep realistic ADG values
          if (adg >= MIN_REALISTIC_ADG && adg <= MAX_REALISTIC_ADG) {
            curr.adg = adg;
          }
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

    // Calculate summary - include all non-zero ADG values (even negative ones are valid)
    const allAdgs = dataPoints.map(dp => dp.avgDailyGain).filter(adg => adg !== 0);
    const overallAvgDailyGain = allAdgs.length > 0
      ? Math.round((allAdgs.reduce((a, b) => a + b, 0) / allAdgs.length) * 1000) / 1000
      : 0;

    // Calculate trend (compare first and last periods with ADG data)
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let trendPercentage = 0;

    const validDataPoints = dataPoints.filter(dp => dp.avgDailyGain !== 0);
    if (validDataPoints.length >= 2) {
      const firstAdg = validDataPoints[0].avgDailyGain;
      const lastAdg = validDataPoints[validDataPoints.length - 1].avgDailyGain;
      const change = lastAdg - firstAdg;

      // Calculate percentage change (handle negative base values)
      if (Math.abs(firstAdg) > 0.001) {
        trendPercentage = Math.round((change / Math.abs(firstAdg)) * 100 * 10) / 10;
      }

      // Determine trend based on absolute change and percentage
      if (change > 0.05 && trendPercentage > 5) {
        trend = 'increasing';
      } else if (change < -0.05 && trendPercentage < -5) {
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
