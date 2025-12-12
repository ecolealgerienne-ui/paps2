import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLotDto, UpdateLotDto, QueryLotDto, AddAnimalsToLotDto, LotStatsQueryDto, LotDetailStatsQueryDto, LotEventsQueryDto, TransferAnimalsDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class LotsService {
  private readonly logger = new AppLogger(LotsService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateLotDto) {
    this.logger.debug(`Creating lot in farm ${farmId}`, {
      name: dto.name,
      withAnimals: !!dto.animalIds?.length
    });

    // Destructure to exclude BaseSyncEntityDto fields and date fields that need conversion
    const { farmId: dtoFarmId, created_at, updated_at, animalIds, treatmentDate, withdrawalEndDate, completedAt, ...lotData } = dto;

    // If animalIds provided, verify all animals exist and belong to farm
    if (animalIds && animalIds.length > 0) {
      const animals = await this.prisma.animal.findMany({
        where: { id: { in: animalIds }, farmId, deletedAt: null },
      });

      if (animals.length !== animalIds.length) {
        this.logger.warn('One or more animals not found for lot', {
          farmId,
          expected: animalIds.length,
          found: animals.length
        });
        throw new EntityNotFoundException(
          ERROR_CODES.ANIMAL_NOT_FOUND,
          `One or more animals not found (expected ${animalIds.length}, found ${animals.length})`,
          { farmId, expectedCount: animalIds.length, foundCount: animals.length },
        );
      }
    }

    try {
      // Create lot with animals in a transaction
      const lot = await this.prisma.$transaction(async (tx) => {
        // Create the lot
        const newLot = await tx.lot.create({
          data: {
            ...lotData,
            farmId: dtoFarmId || farmId,
            // Convert date strings to Date objects
            ...(treatmentDate && { treatmentDate: new Date(treatmentDate) }),
            ...(withdrawalEndDate && { withdrawalEndDate: new Date(withdrawalEndDate) }),
            ...(completedAt && { completedAt: new Date(completedAt) }),
            // CRITICAL: Use client timestamps if provided (offline-first)
            ...(created_at && { createdAt: new Date(created_at) }),
            ...(updated_at && { updatedAt: new Date(updated_at) }),
          },
        });

        // Add animals to lot if provided
        if (animalIds && animalIds.length > 0) {
          await tx.lotAnimal.createMany({
            data: animalIds.map(animalId => ({
              lotId: newLot.id,
              animalId,
              farmId: dtoFarmId || farmId,
              joinedAt: new Date(),
            })),
          });
        }

        // Return lot with animal count and product relation
        return tx.lot.findUnique({
          where: { id: newLot.id },
          include: {
            product: { select: { id: true, nameFr: true, nameEn: true } },
            _count: { select: { lotAnimals: true } },
          },
        });
      });

      if (!lot) {
        throw new Error('Failed to create lot');
      }

      this.logger.audit('Lot created', {
        lotId: lot.id,
        farmId,
        name: lot.name,
        animalCount: animalIds?.length || 0
      });

      return lot;
    } catch (error) {
      this.logger.error(`Failed to create lot in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  async findAll(farmId: string, query: QueryLotDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.completed !== undefined) where.completed = query.completed;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const page = query.page || 1;
    const limit = query.limit || 25;

    // Execute count and findMany in parallel for better performance
    const [total, lots] = await Promise.all([
      this.prisma.lot.count({ where }),
      this.prisma.lot.findMany({
        where,
        include: {
          product: { select: { id: true, nameFr: true, nameEn: true } },
          _count: { select: { lotAnimals: { where: { leftAt: null } } } },
          ...(query.includeStats && {
            lotAnimals: {
              where: { leftAt: null },
              select: { animalId: true },
            },
          }),
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // If includeStats is true, calculate stats for each lot
    let data = lots;
    if (query.includeStats && lots.length > 0) {
      data = await this.enrichLotsWithStats(farmId, lots);
    }

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Enrich lots with performance statistics
   * @private
   */
  private async enrichLotsWithStats(farmId: string, lots: any[]) {
    // Get all animal IDs from all lots
    const allAnimalIds = lots.flatMap(lot =>
      (lot.lotAnimals || []).map((la: any) => la.animalId)
    );

    if (allAnimalIds.length === 0) {
      return lots.map(lot => {
        const { lotAnimals, ...lotData } = lot;
        return { ...lotData, stats: null };
      });
    }

    // Get latest weight for each animal (last 6 months for ADG calculation)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const weights = await this.prisma.weight.findMany({
      where: {
        farmId,
        deletedAt: null,
        animalId: { in: allAnimalIds },
        weightDate: { gte: sixMonthsAgo },
      },
      orderBy: { weightDate: 'asc' },
    });

    // Group weights by animal
    const weightsByAnimal = new Map<string, { weight: number; date: Date }[]>();
    weights.forEach(w => {
      if (!weightsByAnimal.has(w.animalId)) {
        weightsByAnimal.set(w.animalId, []);
      }
      weightsByAnimal.get(w.animalId)!.push({ weight: w.weight, date: w.weightDate });
    });

    // Calculate stats for each lot
    return lots.map(lot => {
      const animalIds = (lot.lotAnimals || []).map((la: any) => la.animalId);
      const { lotAnimals, ...lotData } = lot;

      if (animalIds.length === 0) {
        return { ...lotData, stats: null };
      }

      const lotLatestWeights: number[] = [];
      const dailyGains: number[] = [];

      animalIds.forEach((animalId: string) => {
        const animalWeights = weightsByAnimal.get(animalId) || [];
        if (animalWeights.length > 0) {
          // Latest weight
          const latest = animalWeights[animalWeights.length - 1];
          lotLatestWeights.push(latest.weight);

          // Calculate ADG if 2+ weights
          if (animalWeights.length >= 2) {
            const first = animalWeights[0];
            const last = animalWeights[animalWeights.length - 1];
            const daysDiff = Math.ceil(
              (last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysDiff > 0) {
              dailyGains.push((last.weight - first.weight) / daysDiff);
            }
          }
        }
      });

      // No weight data available
      if (lotLatestWeights.length === 0) {
        return { ...lotData, stats: null };
      }

      const avgWeight = Math.round((lotLatestWeights.reduce((a, b) => a + b, 0) / lotLatestWeights.length) * 10) / 10;
      const minWeight = Math.round(Math.min(...lotLatestWeights) * 10) / 10;
      const maxWeight = Math.round(Math.max(...lotLatestWeights) * 10) / 10;
      const targetWeight = lot.targetWeight || 500;
      const progress = Math.round((avgWeight / targetWeight) * 1000) / 10;

      let avgDailyGain = 0;
      let estimatedDaysToTarget: number | null = null;

      if (dailyGains.length > 0) {
        avgDailyGain = Math.round((dailyGains.reduce((a, b) => a + b, 0) / dailyGains.length) * 1000) / 1000;
        if (avgDailyGain > 0 && avgWeight < targetWeight) {
          estimatedDaysToTarget = Math.ceil((targetWeight - avgWeight) / avgDailyGain);
        }
      }

      return {
        ...lotData,
        stats: {
          avgWeight,
          avgDailyGain,
          minWeight,
          maxWeight,
          progress,
          estimatedDaysToTarget,
        },
      };
    });
  }

  async findOne(farmId: string, id: string) {
    this.logger.debug(`Finding lot ${id} in farm ${farmId}`);

    const lot = await this.prisma.lot.findFirst({
      where: { id, farmId, deletedAt: null },
      include: {
        product: { select: { id: true, nameFr: true, nameEn: true } },
        lotAnimals: {
          where: { leftAt: null },
          include: {
            animal: {
              select: {
                id: true,
                visualId: true,
                currentEid: true,
                officialNumber: true,
                sex: true,
                status: true,
                birthDate: true,
              },
            },
          },
        },
        _count: { select: { lotAnimals: { where: { leftAt: null } } } },
      },
    });

    if (!lot) {
      this.logger.warn('Lot not found', { lotId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.LOT_NOT_FOUND,
        `Lot ${id} not found`,
        { lotId: id, farmId },
      );
    }

    return lot;
  }

  /**
   * Find all animals in a specific lot
   * Endpoint: GET /api/v1/farms/:farmId/lots/:lotId/animals
   */
  async findAnimalsByLotId(farmId: string, lotId: string) {
    // Verify lot exists and belongs to farm
    const lot = await this.prisma.lot.findFirst({
      where: { id: lotId, farmId, deletedAt: null },
    });

    if (!lot) {
      this.logger.warn('Lot not found', { lotId, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.LOT_NOT_FOUND,
        `Lot ${lotId} not found`,
        { lotId, farmId },
      );
    }

    const lotAnimals = await this.prisma.lotAnimal.findMany({
      where: { lotId, leftAt: null },
      include: {
        animal: {
          select: {
            id: true,
            visualId: true,
            currentEid: true,
            officialNumber: true,
            sex: true,
            birthDate: true,
            status: true,
            breed: {
              select: {
                id: true,
                nameFr: true,
                nameEn: true,
                species: {
                  select: {
                    id: true,
                    nameFr: true,
                    nameEn: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Extract animals from the junction table
    const animals = lotAnimals.map((la) => ({
      ...la.animal,
      joinedAt: la.joinedAt,
    }));

    this.logger.debug(`Found ${animals.length} animals for lot ${lotId}`);
    return animals;
  }

  async update(farmId: string, id: string, dto: UpdateLotDto) {
    this.logger.debug(`Updating lot ${id} (version ${dto.version})`, {
      withAnimals: !!dto.animalIds?.length
    });

    const existing = await this.prisma.lot.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Lot not found', { lotId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.LOT_NOT_FOUND,
        `Lot ${id} not found`,
        { lotId: id, farmId },
      );
    }

    // Version conflict check
    if (dto.version && existing.version > dto.version) {
      this.logger.warn('Version conflict detected', {
        lotId: id,
        serverVersion: existing.version,
        clientVersion: dto.version,
      });

      throw new EntityConflictException(
        ERROR_CODES.VERSION_CONFLICT,
        'Version conflict detected',
        {
          lotId: id,
          serverVersion: existing.version,
          clientVersion: dto.version,
        },
      );
    }

    // Destructure to exclude BaseSyncEntityDto fields, animalIds, and date fields that need conversion
    const { farmId: dtoFarmId, created_at, updated_at, version, animalIds, treatmentDate, withdrawalEndDate, completedAt, ...lotData } = dto;

    // If animalIds provided, verify all animals exist and belong to farm
    if (animalIds && animalIds.length > 0) {
      const animals = await this.prisma.animal.findMany({
        where: { id: { in: animalIds }, farmId, deletedAt: null },
      });

      if (animals.length !== animalIds.length) {
        this.logger.warn('One or more animals not found for lot update', {
          farmId,
          lotId: id,
          expected: animalIds.length,
          found: animals.length
        });
        throw new EntityNotFoundException(
          ERROR_CODES.ANIMAL_NOT_FOUND,
          `One or more animals not found (expected ${animalIds.length}, found ${animals.length})`,
          { farmId, expectedCount: animalIds.length, foundCount: animals.length },
        );
      }
    }

    try {
      // Use transaction for atomic lot + animals update
      const updated = await this.prisma.$transaction(async (tx) => {
        // Update the lot
        const updatedLot = await tx.lot.update({
          where: { id },
          data: {
            ...lotData,
            version: existing.version + 1,
            // Convert date strings to Date objects
            ...(treatmentDate && { treatmentDate: new Date(treatmentDate) }),
            ...(withdrawalEndDate && { withdrawalEndDate: new Date(withdrawalEndDate) }),
            ...(completedAt && { completedAt: new Date(completedAt) }),
            // CRITICAL: Use client timestamp if provided (offline-first)
            ...(updated_at && { updatedAt: new Date(updated_at) }),
          },
        });

        // If animalIds provided, sync animals in lot (add new, remove missing)
        if (animalIds !== undefined) {
          // Get current animals in the lot
          const currentLotAnimals = await tx.lotAnimal.findMany({
            where: { lotId: id, leftAt: null },
            select: { animalId: true },
          });
          const currentAnimalIds = new Set<string>(currentLotAnimals.map(la => la.animalId));
          const newAnimalIds = new Set<string>(animalIds);

          // Animals to add: in newAnimalIds but not in currentAnimalIds
          const toAdd = animalIds.filter(aid => !currentAnimalIds.has(aid));

          // Animals to remove: in currentAnimalIds but not in newAnimalIds
          const toRemove = Array.from(currentAnimalIds).filter(aid => !newAnimalIds.has(aid));

          // Remove animals (mark as left)
          if (toRemove.length > 0) {
            await tx.lotAnimal.updateMany({
              where: { lotId: id, animalId: { in: toRemove }, leftAt: null },
              data: { leftAt: new Date() },
            });
          }

          // Add new animals
          if (toAdd.length > 0) {
            await tx.lotAnimal.createMany({
              data: toAdd.map(animalId => ({
                lotId: id,
                animalId,
                farmId,
                joinedAt: new Date(),
              })),
            });
          }
        }

        // Return lot with animal count and product relation
        return tx.lot.findUnique({
          where: { id },
          include: {
            product: { select: { id: true, nameFr: true, nameEn: true } },
            _count: { select: { lotAnimals: { where: { leftAt: null } } } },
          },
        });
      });

      this.logger.audit('Lot updated', {
        lotId: id,
        farmId,
        version: `${existing.version} → ${updated?.version}`,
        animalsUpdated: animalIds !== undefined
      });

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update lot ${id}`, error.stack);
      throw error;
    }
  }

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting lot ${id}`);

    const existing = await this.prisma.lot.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Lot not found', { lotId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.LOT_NOT_FOUND,
        `Lot ${id} not found`,
        { lotId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.lot.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Lot soft deleted', { lotId: id, farmId });

      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete lot ${id}`, error.stack);
      throw error;
    }
  }

  async addAnimals(farmId: string, lotId: string, dto: AddAnimalsToLotDto) {
    this.logger.debug(`Adding ${dto.animalIds.length} animals to lot ${lotId}`);

    const lot = await this.prisma.lot.findFirst({
      where: { id: lotId, farmId, deletedAt: null },
    });

    if (!lot) {
      this.logger.warn('Lot not found', { lotId, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.LOT_NOT_FOUND,
        `Lot ${lotId} not found`,
        { lotId, farmId },
      );
    }

    try {
      // Add animals to lot
      const creates = dto.animalIds.map(animalId => ({
        farmId,
        lotId,
        animalId,
        joinedAt: new Date(),
      }));

      await this.prisma.lotAnimal.createMany({
        data: creates,
        skipDuplicates: true,
      });

      this.logger.audit('Animals added to lot', {
        lotId,
        farmId,
        count: dto.animalIds.length,
      });

      return this.findOne(farmId, lotId);
    } catch (error) {
      this.logger.error(`Failed to add animals to lot ${lotId}`, error.stack);
      throw error;
    }
  }

  async removeAnimals(farmId: string, lotId: string, animalIds: string[]) {
    this.logger.debug(`Removing ${animalIds.length} animals from lot ${lotId}`);

    const lot = await this.prisma.lot.findFirst({
      where: { id: lotId, farmId, deletedAt: null },
    });

    if (!lot) {
      this.logger.warn('Lot not found', { lotId, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.LOT_NOT_FOUND,
        `Lot ${lotId} not found`,
        { lotId, farmId },
      );
    }

    try {
      // Mark animals as left
      await this.prisma.lotAnimal.updateMany({
        where: {
          lotId,
          animalId: { in: animalIds },
          leftAt: null,
        },
        data: {
          leftAt: new Date(),
        },
      });

      this.logger.audit('Animals removed from lot', {
        lotId,
        farmId,
        count: animalIds.length,
      });

      return this.findOne(farmId, lotId);
    } catch (error) {
      this.logger.error(`Failed to remove animals from lot ${lotId}`, error.stack);
      throw error;
    }
  }

  async finalize(farmId: string, lotId: string) {
    this.logger.debug(`Finalizing lot ${lotId}`);

    const lot = await this.prisma.lot.findFirst({
      where: { id: lotId, farmId, deletedAt: null },
    });

    if (!lot) {
      this.logger.warn('Lot not found', { lotId, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.LOT_NOT_FOUND,
        `Lot ${lotId} not found`,
        { lotId, farmId },
      );
    }

    try {
      const finalized = await this.prisma.lot.update({
        where: { id: lotId },
        data: {
          completed: true,
          status: 'closed',
          version: lot.version + 1,
        },
        include: {
          _count: { select: { lotAnimals: true } },
        },
      });

      this.logger.audit('Lot finalized', { lotId, farmId });

      return finalized;
    } catch (error) {
      this.logger.error(`Failed to finalize lot ${lotId}`, error.stack);
      throw error;
    }
  }

  /**
   * Get performance statistics for lots
   * Endpoint: GET /api/v1/farms/:farmId/lots/stats
   * P1.3: Added pagination support
   */
  async getStats(farmId: string, query: LotStatsQueryDto) {
    this.logger.debug(`Getting lot stats for farm ${farmId}`, query);

    // P1.3: Pagination params
    const page = query.page || 1;
    const limit = query.limit || 20;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const where: any = {
      farmId,
      deletedAt: null,
      isActive: query.isActive ?? true,
    };

    if (query.type) where.type = query.type;

    // Calculate period start date based on period parameter
    const now = new Date();
    let periodStart: Date;
    const period = query.period || '6months';

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

    // P1.3: Count total lots first for pagination meta
    const totalLots = await this.prisma.lot.count({ where });

    // P1.3: Get paginated lots with their animals
    // Note: For sortBy 'animalCount' or 'avgDailyGain', we'll sort after calculation
    const needsPostSort = sortBy === 'animalCount' || sortBy === 'avgDailyGain';

    const lots = await this.prisma.lot.findMany({
      where,
      include: {
        lotAnimals: {
          where: { leftAt: null },
          select: { animalId: true },
        },
      },
      orderBy: needsPostSort ? { createdAt: 'desc' } : { [sortBy]: sortOrder },
      // If we need post-sort, fetch all for sorting; otherwise paginate at DB level
      ...(needsPostSort ? {} : { skip: (page - 1) * limit, take: limit }),
    });

    // Get all animal IDs from all lots
    const allAnimalIds = lots.flatMap(lot => lot.lotAnimals.map(la => la.animalId));

    if (allAnimalIds.length === 0) {
      const emptyLots = lots.map(lot => ({
        lotId: lot.id,
        name: lot.name,
        type: lot.type,
        animalCount: 0,
        weights: null,
        growth: null,
        predictions: null,
        lastWeighingDate: null,
      }));

      return {
        success: true,
        data: {
          lots: emptyLots,
          summary: {
            totalLots: lots.length,
            totalAnimals: 0,
            overallAvgDailyGain: 0,
            period,
          },
        },
      };
    }

    // Get weights for these animals within the period
    const weights = await this.prisma.weight.findMany({
      where: {
        farmId,
        deletedAt: null,
        animalId: { in: allAnimalIds },
        weightDate: { gte: periodStart },
      },
      orderBy: { weightDate: 'asc' },
    });

    // Group weights by animal
    const weightsByAnimal = new Map<string, { weight: number; date: Date }[]>();
    weights.forEach(w => {
      if (!weightsByAnimal.has(w.animalId)) {
        weightsByAnimal.set(w.animalId, []);
      }
      weightsByAnimal.get(w.animalId)!.push({ weight: w.weight, date: w.weightDate });
    });

    // Calculate stats for each lot
    const allDailyGains: number[] = [];
    let totalAnimals = 0;

    const lotStats = lots.map(lot => {
      const animalIds = lot.lotAnimals.map(la => la.animalId);
      const animalCount = animalIds.length;
      totalAnimals += animalCount;

      if (animalCount === 0) {
        return {
          lotId: lot.id,
          name: lot.name,
          type: lot.type,
          animalCount: 0,
          weights: null,
          growth: null,
          predictions: null,
          lastWeighingDate: null,
        };
      }

      // Get weights for this lot's animals
      const lotLatestWeights: number[] = [];
      const dailyGains: number[] = [];
      let lastWeighingDate: Date | null = null;

      animalIds.forEach(animalId => {
        const animalWeights = weightsByAnimal.get(animalId) || [];
        if (animalWeights.length > 0) {
          // Latest weight for this animal
          const latest = animalWeights[animalWeights.length - 1];
          lotLatestWeights.push(latest.weight);

          // Update last weighing date
          if (!lastWeighingDate || latest.date > lastWeighingDate) {
            lastWeighingDate = latest.date;
          }

          // Calculate ADG if 2+ weights
          if (animalWeights.length >= 2) {
            const first = animalWeights[0];
            const last = animalWeights[animalWeights.length - 1];
            const daysDiff = Math.ceil(
              (last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysDiff > 0) {
              const adg = (last.weight - first.weight) / daysDiff;
              dailyGains.push(adg);
              allDailyGains.push(adg);
            }
          }
        }
      });

      // Calculate weight stats
      const targetWeight = 500; // Default target weight in kg
      const weightsStats = lotLatestWeights.length > 0 ? {
        avgWeight: Math.round((lotLatestWeights.reduce((a, b) => a + b, 0) / lotLatestWeights.length) * 10) / 10,
        minWeight: Math.round(Math.min(...lotLatestWeights) * 10) / 10,
        maxWeight: Math.round(Math.max(...lotLatestWeights) * 10) / 10,
        targetWeight,
      } : null;

      // Calculate growth stats with status
      let growthStats: {
        avgDailyGain: number;
        minDailyGain: number;
        maxDailyGain: number;
        status: 'excellent' | 'good' | 'warning' | 'critical';
      } | null = null;

      if (dailyGains.length > 0) {
        const avgAdg = Math.round((dailyGains.reduce((a, b) => a + b, 0) / dailyGains.length) * 1000) / 1000;
        let status: 'excellent' | 'good' | 'warning' | 'critical';
        if (avgAdg >= 1.0) status = 'excellent';
        else if (avgAdg >= 0.8) status = 'good';
        else if (avgAdg >= 0.6) status = 'warning';
        else status = 'critical';

        growthStats = {
          avgDailyGain: avgAdg,
          minDailyGain: Math.round(Math.min(...dailyGains) * 1000) / 1000,
          maxDailyGain: Math.round(Math.max(...dailyGains) * 1000) / 1000,
          status,
        };
      }

      // Calculate predictions (if we have avg weight and ADG)
      let predictions: {
        estimatedDaysToTarget: number;
        estimatedTargetDate: string;
      } | null = null;

      if (weightsStats && growthStats && growthStats.avgDailyGain > 0) {
        const currentAvg = weightsStats.avgWeight;
        if (currentAvg < targetWeight) {
          const daysToTarget = Math.ceil((targetWeight - currentAvg) / growthStats.avgDailyGain);
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + daysToTarget);
          predictions = {
            estimatedDaysToTarget: daysToTarget,
            estimatedTargetDate: targetDate.toISOString().split('T')[0],
          };
        }
      }

      // Format lastWeighingDate as string
      const formattedLastWeighingDate = lastWeighingDate
        ? (lastWeighingDate as Date).toISOString().split('T')[0]
        : null;

      return {
        lotId: lot.id,
        name: lot.name,
        type: lot.type,
        animalCount,
        weights: weightsStats,
        growth: growthStats,
        predictions,
        lastWeighingDate: formattedLastWeighingDate,
      };
    });

    // Calculate overall summary
    const overallAvgDailyGain = allDailyGains.length > 0
      ? Math.round((allDailyGains.reduce((a, b) => a + b, 0) / allDailyGains.length) * 1000) / 1000
      : 0;

    // P1.3: Apply post-sort if needed (for animalCount or avgDailyGain)
    let sortedLotStats = lotStats;
    if (needsPostSort) {
      sortedLotStats = [...lotStats].sort((a, b) => {
        let valueA: number;
        let valueB: number;

        if (sortBy === 'animalCount') {
          valueA = a.animalCount;
          valueB = b.animalCount;
        } else {
          // avgDailyGain
          valueA = a.growth?.avgDailyGain ?? 0;
          valueB = b.growth?.avgDailyGain ?? 0;
        }

        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      });

      // Apply pagination after sorting
      sortedLotStats = sortedLotStats.slice((page - 1) * limit, page * limit);
    }

    return {
      success: true,
      data: {
        lots: sortedLotStats,
        summary: {
          totalLots,
          totalAnimals,
          overallAvgDailyGain,
          period,
        },
      },
      // P1.3: Add pagination meta
      meta: {
        page,
        limit,
        total: totalLots,
        totalPages: Math.ceil(totalLots / limit),
      },
    };
  }

  /**
   * P2.1: Get detailed statistics for a single lot
   * Endpoint: GET /api/v1/farms/:farmId/lots/:lotId/stats
   */
  async getLotStats(farmId: string, lotId: string, query: LotDetailStatsQueryDto) {
    this.logger.debug(`Getting detailed stats for lot ${lotId} in farm ${farmId}`);

    // Verify lot exists
    const lot = await this.prisma.lot.findFirst({
      where: { id: lotId, farmId, deletedAt: null },
      include: {
        product: { select: { id: true, nameFr: true, nameEn: true } },
      },
    });

    if (!lot) {
      throw new EntityNotFoundException(
        ERROR_CODES.LOT_NOT_FOUND,
        `Lot ${lotId} not found`,
        { lotId, farmId },
      );
    }

    // Calculate period start
    const now = new Date();
    const period = query.period || '6months';
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

    // Get all animals in the lot
    const lotAnimals = await this.prisma.lotAnimal.findMany({
      where: { lotId, leftAt: null },
      include: {
        animal: {
          select: {
            id: true,
            status: true,
            sex: true,
            birthDate: true,
          },
        },
      },
    });

    const animalIds = lotAnimals.map(la => la.animalId);
    const animals = lotAnimals.map(la => la.animal);

    // Animals stats
    const byStatus: Record<string, number> = { alive: 0, sold: 0, dead: 0, slaughtered: 0, draft: 0 };
    const bySex: Record<string, number> = { male: 0, female: 0 };

    animals.forEach(a => {
      if (byStatus[a.status] !== undefined) byStatus[a.status]++;
      if (bySex[a.sex] !== undefined) bySex[a.sex]++;
    });

    // Get weights for these animals
    const weights = await this.prisma.weight.findMany({
      where: {
        farmId,
        deletedAt: null,
        animalId: { in: animalIds },
        weightDate: { gte: periodStart },
      },
      orderBy: { weightDate: 'asc' },
    });

    // Group weights by animal
    const weightsByAnimal = new Map<string, { weight: number; date: Date }[]>();
    weights.forEach(w => {
      if (!weightsByAnimal.has(w.animalId)) {
        weightsByAnimal.set(w.animalId, []);
      }
      weightsByAnimal.get(w.animalId)!.push({ weight: w.weight, date: w.weightDate });
    });

    // Calculate weight stats
    const latestWeights: number[] = [];
    const dailyGains: number[] = [];
    let lastWeighingDate: Date | null = null;

    // ADG distribution thresholds
    const adgDistribution = { excellent: 0, good: 0, warning: 0, critical: 0 };

    weightsByAnimal.forEach(animalWeights => {
      if (animalWeights.length > 0) {
        const latest = animalWeights[animalWeights.length - 1];
        latestWeights.push(latest.weight);

        if (!lastWeighingDate || latest.date > lastWeighingDate) {
          lastWeighingDate = latest.date;
        }

        // Calculate ADG
        if (animalWeights.length >= 2) {
          const first = animalWeights[0];
          const last = animalWeights[animalWeights.length - 1];
          const daysDiff = Math.ceil(
            (last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 1000 * 24)
          );
          if (daysDiff > 0) {
            const adg = (last.weight - first.weight) / daysDiff;
            dailyGains.push(adg);

            // Classify ADG
            if (adg >= 1.0) adgDistribution.excellent++;
            else if (adg >= 0.8) adgDistribution.good++;
            else if (adg >= 0.6) adgDistribution.warning++;
            else adgDistribution.critical++;
          }
        }
      }
    });

    // Calculate aggregates
    const targetWeight = 500; // Default target
    const formattedLastWeighingDate = lastWeighingDate ? lastWeighingDate.toISOString().split('T')[0] : null;
    const weightsStats = latestWeights.length > 0 ? {
      avgWeight: Math.round((latestWeights.reduce((a, b) => a + b, 0) / latestWeights.length) * 10) / 10,
      minWeight: Math.round(Math.min(...latestWeights) * 10) / 10,
      maxWeight: Math.round(Math.max(...latestWeights) * 10) / 10,
      totalWeightGain: 0, // Would need entry weights to calculate
      targetWeight,
      lastWeighingDate: formattedLastWeighingDate,
    } : null;

    // Growth stats
    let growthStats: {
      avgDailyGain: number;
      minDailyGain: number;
      maxDailyGain: number;
      status: 'excellent' | 'good' | 'warning' | 'critical';
      distribution: typeof adgDistribution;
    } | null = null;

    if (dailyGains.length > 0) {
      const avgAdg = Math.round((dailyGains.reduce((a, b) => a + b, 0) / dailyGains.length) * 1000) / 1000;
      let status: 'excellent' | 'good' | 'warning' | 'critical';
      if (avgAdg >= 1.0) status = 'excellent';
      else if (avgAdg >= 0.8) status = 'good';
      else if (avgAdg >= 0.6) status = 'warning';
      else status = 'critical';

      growthStats = {
        avgDailyGain: avgAdg,
        minDailyGain: Math.round(Math.min(...dailyGains) * 1000) / 1000,
        maxDailyGain: Math.round(Math.max(...dailyGains) * 1000) / 1000,
        status,
        distribution: adgDistribution,
      };
    }

    // Predictions
    let predictions: {
      estimatedDaysToTarget: number | null;
      estimatedTargetDate: string | null;
      readyForSaleCount: number;
      readyForSalePercent: number;
    } | null = null;

    if (weightsStats && growthStats && growthStats.avgDailyGain > 0) {
      const readyForSaleCount = latestWeights.filter(w => w >= targetWeight).length;
      const readyForSalePercent = Math.round((readyForSaleCount / latestWeights.length) * 100);

      let estimatedDaysToTarget: number | null = null;
      let estimatedTargetDate: string | null = null;

      if (weightsStats.avgWeight < targetWeight) {
        estimatedDaysToTarget = Math.ceil((targetWeight - weightsStats.avgWeight) / growthStats.avgDailyGain);
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + estimatedDaysToTarget);
        estimatedTargetDate = targetDate.toISOString().split('T')[0];
      }

      predictions = {
        estimatedDaysToTarget,
        estimatedTargetDate,
        readyForSaleCount,
        readyForSalePercent,
      };
    }

    // Financial (only for sale lots)
    let financial: { estimatedValue: number; pricePerKg: number; totalWeight: number } | null = null;
    if (lot.type === 'sale' && weightsStats && lot.priceTotal) {
      const totalWeight = Math.round(latestWeights.reduce((a, b) => a + b, 0) * 10) / 10;
      const pricePerKg = totalWeight > 0 ? Math.round((lot.priceTotal / totalWeight) * 100) / 100 : 0;
      financial = {
        estimatedValue: lot.priceTotal,
        pricePerKg,
        totalWeight,
      };
    }

    return {
      success: true,
      data: {
        lot: {
          id: lot.id,
          name: lot.name,
          type: lot.type,
          status: lot.status,
          createdAt: lot.createdAt.toISOString(),
          description: lot.description,
          product: lot.product,
        },
        animals: {
          total: animals.length,
          byStatus,
          bySex,
        },
        weights: weightsStats,
        growth: growthStats,
        predictions,
        ...(financial && { financial }),
      },
    };
  }

  /**
   * P2.2: Get timeline events for a lot
   * Endpoint: GET /api/v1/farms/:farmId/lots/:lotId/events
   * Aggregates events from multiple sources: lot_animals, weights, treatments, lot_history
   */
  async getLotEvents(farmId: string, lotId: string, query: LotEventsQueryDto) {
    this.logger.debug(`Getting events for lot ${lotId} in farm ${farmId}`);

    const page = query.page || 1;
    const limit = query.limit || 50;
    const types = query.types;

    // Verify lot exists
    const lot = await this.prisma.lot.findFirst({
      where: { id: lotId, farmId, deletedAt: null },
    });

    if (!lot) {
      throw new EntityNotFoundException(
        ERROR_CODES.LOT_NOT_FOUND,
        `Lot ${lotId} not found`,
        { lotId, farmId },
      );
    }

    // Collect events from different sources
    interface LotEvent {
      id: string;
      type: string;
      date: Date;
      details: Record<string, any>;
      createdBy?: { id: string; name: string } | null;
    }

    const events: LotEvent[] = [];

    // 1. Animal joined events from lot_animals
    if (!types || types.includes('animal_joined')) {
      const joinedAnimals = await this.prisma.lotAnimal.findMany({
        where: { lotId },
        include: {
          animal: {
            select: { id: true, officialNumber: true, visualId: true },
          },
        },
        orderBy: { joinedAt: 'desc' },
      });

      // Group by joinedAt date (same day = same event)
      const joinedByDate = new Map<string, typeof joinedAnimals>();
      joinedAnimals.forEach(la => {
        const dateKey = la.joinedAt.toISOString().split('T')[0];
        if (!joinedByDate.has(dateKey)) {
          joinedByDate.set(dateKey, []);
        }
        joinedByDate.get(dateKey)!.push(la);
      });

      joinedByDate.forEach((animals, dateKey) => {
        events.push({
          id: `joined-${dateKey}`,
          type: 'animal_joined',
          date: new Date(dateKey),
          details: {
            animals: animals.map(la => ({
              id: la.animal.id,
              officialNumber: la.animal.officialNumber || la.animal.visualId,
            })),
            count: animals.length,
          },
        });
      });
    }

    // 2. Animal left events from lot_animals
    if (!types || types.includes('animal_left')) {
      const leftAnimals = await this.prisma.lotAnimal.findMany({
        where: { lotId, leftAt: { not: null } },
        include: {
          animal: {
            select: { id: true, officialNumber: true, visualId: true, status: true },
          },
        },
        orderBy: { leftAt: 'desc' },
      });

      // Group by leftAt date
      const leftByDate = new Map<string, typeof leftAnimals>();
      leftAnimals.forEach(la => {
        if (la.leftAt) {
          const dateKey = la.leftAt.toISOString().split('T')[0];
          if (!leftByDate.has(dateKey)) {
            leftByDate.set(dateKey, []);
          }
          leftByDate.get(dateKey)!.push(la);
        }
      });

      leftByDate.forEach((animals, dateKey) => {
        events.push({
          id: `left-${dateKey}`,
          type: 'animal_left',
          date: new Date(dateKey),
          details: {
            animals: animals.map(la => ({
              id: la.animal.id,
              officialNumber: la.animal.officialNumber || la.animal.visualId,
              reason: la.animal.status, // sold, dead, transferred
            })),
            count: animals.length,
          },
        });
      });
    }

    // 3. Weighing events - grouped by date
    if (!types || types.includes('weighing')) {
      const animalIds = (await this.prisma.lotAnimal.findMany({
        where: { lotId },
        select: { animalId: true },
      })).map(la => la.animalId);

      if (animalIds.length > 0) {
        const weights = await this.prisma.weight.findMany({
          where: {
            farmId,
            deletedAt: null,
            animalId: { in: animalIds },
          },
          orderBy: { weightDate: 'desc' },
        });

        // Group by date
        const weightsByDate = new Map<string, typeof weights>();
        weights.forEach(w => {
          const dateKey = w.weightDate.toISOString().split('T')[0];
          if (!weightsByDate.has(dateKey)) {
            weightsByDate.set(dateKey, []);
          }
          weightsByDate.get(dateKey)!.push(w);
        });

        weightsByDate.forEach((dayWeights, dateKey) => {
          const avgWeight = Math.round((dayWeights.reduce((sum, w) => sum + w.weight, 0) / dayWeights.length) * 10) / 10;
          events.push({
            id: `weighing-${dateKey}`,
            type: 'weighing',
            date: new Date(dateKey),
            details: {
              animalCount: dayWeights.length,
              avgWeight,
            },
          });
        });
      }
    }

    // 4. Treatment events
    if (!types || types.includes('treatment')) {
      const treatments = await this.prisma.treatment.findMany({
        where: { lotId, deletedAt: null },
        orderBy: { treatmentDate: 'desc' },
        include: {
          product: { select: { nameFr: true, nameEn: true } },
        },
      });

      treatments.forEach(t => {
        events.push({
          id: t.id,
          type: 'treatment',
          date: t.treatmentDate,
          details: {
            productName: t.product?.nameFr || t.productName,
            treatmentType: t.type,
            veterinarian: t.veterinarianName,
          },
        });
      });
    }

    // 5. Status change and notes from lot_history
    if (!types || types.includes('status_change') || types.includes('note')) {
      const historyTypes: string[] = [];
      if (!types || types.includes('status_change')) historyTypes.push('status_change');
      if (!types || types.includes('note')) historyTypes.push('note');

      const history = await this.prisma.lotHistory.findMany({
        where: { lotId, type: { in: historyTypes } },
        orderBy: { createdAt: 'desc' },
      });

      history.forEach(h => {
        events.push({
          id: h.id,
          type: h.type,
          date: h.createdAt,
          details: {
            fromStatus: h.fromValue,
            toStatus: h.toValue,
            reason: h.reason,
          },
          createdBy: h.createdBy ? { id: h.createdBy, name: h.createdBy } : null,
        });
      });
    }

    // Sort all events by date descending
    events.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Apply pagination
    const total = events.length;
    const paginatedEvents = events.slice((page - 1) * limit, page * limit);

    // Format dates for response
    const formattedEvents = paginatedEvents.map(e => ({
      ...e,
      date: e.date.toISOString(),
    }));

    return {
      success: true,
      data: {
        events: formattedEvents,
      },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * P3: Transfer animals between lots
   * Endpoint: POST /api/v1/farms/:farmId/lots/transfer
   */
  async transferAnimals(farmId: string, dto: TransferAnimalsDto) {
    const { fromLotId, toLotId, animalIds, reason } = dto;

    this.logger.debug(`Transferring ${animalIds.length} animals from lot ${fromLotId} to lot ${toLotId}`);

    // Validation: fromLotId and toLotId must be different
    if (fromLotId === toLotId) {
      throw new EntityConflictException(
        ERROR_CODES.VERSION_CONFLICT,
        'Source and destination lots must be different',
        { fromLotId, toLotId },
      );
    }

    // Verify both lots exist and belong to farm
    const [fromLot, toLot] = await Promise.all([
      this.prisma.lot.findFirst({
        where: { id: fromLotId, farmId, deletedAt: null },
      }),
      this.prisma.lot.findFirst({
        where: { id: toLotId, farmId, deletedAt: null },
      }),
    ]);

    if (!fromLot) {
      throw new EntityNotFoundException(
        ERROR_CODES.LOT_NOT_FOUND,
        `Source lot ${fromLotId} not found`,
        { lotId: fromLotId, farmId },
      );
    }

    if (!toLot) {
      throw new EntityNotFoundException(
        ERROR_CODES.LOT_NOT_FOUND,
        `Destination lot ${toLotId} not found`,
        { lotId: toLotId, farmId },
      );
    }

    // Verify all animals are currently in the source lot
    const currentAnimalsInLot = await this.prisma.lotAnimal.findMany({
      where: {
        lotId: fromLotId,
        animalId: { in: animalIds },
        leftAt: null,
      },
      select: { animalId: true },
    });

    const animalsInLotSet = new Set(currentAnimalsInLot.map(la => la.animalId));
    const missingAnimals = animalIds.filter(id => !animalsInLotSet.has(id));

    if (missingAnimals.length > 0) {
      throw new EntityNotFoundException(
        ERROR_CODES.ANIMAL_NOT_FOUND,
        `Animals not found in source lot: ${missingAnimals.join(', ')}`,
        { missingAnimals, fromLotId },
      );
    }

    try {
      // Execute transfer in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        const now = new Date();

        // 1. Mark animals as left from source lot
        await tx.lotAnimal.updateMany({
          where: {
            lotId: fromLotId,
            animalId: { in: animalIds },
            leftAt: null,
          },
          data: { leftAt: now },
        });

        // 2. Add animals to destination lot
        await tx.lotAnimal.createMany({
          data: animalIds.map(animalId => ({
            farmId,
            lotId: toLotId,
            animalId,
            joinedAt: now,
          })),
        });

        // 3. Get updated counts
        const [fromLotCount, toLotCount] = await Promise.all([
          tx.lotAnimal.count({
            where: { lotId: fromLotId, leftAt: null },
          }),
          tx.lotAnimal.count({
            where: { lotId: toLotId, leftAt: null },
          }),
        ]);

        return {
          transferred: animalIds.length,
          fromLot: {
            id: fromLot.id,
            name: fromLot.name,
            remainingAnimals: fromLotCount,
          },
          toLot: {
            id: toLot.id,
            name: toLot.name,
            newAnimalCount: toLotCount,
          },
        };
      });

      this.logger.audit('Animals transferred between lots', {
        farmId,
        fromLotId,
        toLotId,
        count: animalIds.length,
        reason,
      });

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      this.logger.error(`Failed to transfer animals from lot ${fromLotId} to ${toLotId}`, error.stack);
      throw error;
    }
  }
}
