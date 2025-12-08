import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeightDto, UpdateWeightDto, QueryWeightDto, StatsQueryDto } from './dto';
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

    return {
      data: weights,
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
}
