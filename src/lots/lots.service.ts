import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLotDto, UpdateLotDto, QueryLotDto, AddAnimalsToLotDto, LotStatsQueryDto } from './dto';
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

    return this.prisma.lot.findMany({
      where,
      include: {
        product: { select: { id: true, nameFr: true, nameEn: true } },
        _count: { select: { lotAnimals: { where: { leftAt: null } } } },
      },
      orderBy: { createdAt: 'desc' },
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
          const currentAnimalIds = new Set(currentLotAnimals.map(la => la.animalId));
          const newAnimalIds = new Set(animalIds);

          // Animals to add: in newAnimalIds but not in currentAnimalIds
          const toAdd = animalIds.filter(aid => !currentAnimalIds.has(aid));

          // Animals to remove: in currentAnimalIds but not in newAnimalIds
          const toRemove = [...currentAnimalIds].filter(aid => !newAnimalIds.has(aid));

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
   */
  async getStats(farmId: string, query: LotStatsQueryDto) {
    this.logger.debug(`Getting lot stats for farm ${farmId}`, query);

    const where: any = {
      farmId,
      deletedAt: null,
      isActive: query.isActive ?? true,
    };

    if (query.type) where.type = query.type;

    // Get lots with their animals
    const lots = await this.prisma.lot.findMany({
      where,
      include: {
        lotAnimals: {
          where: { leftAt: null },
          select: { animalId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get all animal IDs from all lots
    const allAnimalIds = lots.flatMap(lot => lot.lotAnimals.map(la => la.animalId));

    if (allAnimalIds.length === 0) {
      return {
        success: true,
        data: lots.map(lot => ({
          lotId: lot.id,
          lotName: lot.name,
          type: lot.type,
          animalCount: 0,
          weights: null,
          growth: null,
          prediction: null,
          lastWeighingDate: null,
        })),
      };
    }

    // Get all weights for these animals (last 30 days for ADG)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const weights = await this.prisma.weight.findMany({
      where: {
        farmId,
        deletedAt: null,
        animalId: { in: allAnimalIds },
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
    const lotStats = lots.map(lot => {
      const animalIds = lot.lotAnimals.map(la => la.animalId);
      const animalCount = animalIds.length;

      if (animalCount === 0) {
        return {
          lotId: lot.id,
          lotName: lot.name,
          type: lot.type,
          animalCount: 0,
          weights: null,
          growth: null,
          prediction: null,
          lastWeighingDate: null,
        };
      }

      // Get weights for this lot's animals
      const lotWeights: number[] = [];
      const lotLatestWeights: number[] = [];
      const dailyGains: number[] = [];
      let lastWeighingDate: Date | null = null;

      animalIds.forEach(animalId => {
        const animalWeights = weightsByAnimal.get(animalId) || [];
        if (animalWeights.length > 0) {
          // Latest weight for this animal
          const latest = animalWeights[animalWeights.length - 1];
          lotLatestWeights.push(latest.weight);
          lotWeights.push(...animalWeights.map(w => w.weight));

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
            }
          }
        }
      });

      // Calculate weight stats
      const weightsStats = lotLatestWeights.length > 0 ? {
        avg: Math.round((lotLatestWeights.reduce((a, b) => a + b, 0) / lotLatestWeights.length) * 10) / 10,
        min: Math.round(Math.min(...lotLatestWeights) * 10) / 10,
        max: Math.round(Math.max(...lotLatestWeights) * 10) / 10,
        targetWeight: null as number | null, // Could be set from lot metadata if available
      } : null;

      // Calculate growth stats
      const growthStats = dailyGains.length > 0 ? {
        avgDailyGain: Math.round((dailyGains.reduce((a, b) => a + b, 0) / dailyGains.length) * 1000) / 1000,
        minDailyGain: Math.round(Math.min(...dailyGains) * 1000) / 1000,
        maxDailyGain: Math.round(Math.max(...dailyGains) * 1000) / 1000,
        animalsWithGain: dailyGains.length,
      } : null;

      // Calculate prediction (if we have avg weight and ADG)
      let prediction = null;
      const targetWeight = 500; // Default target weight in kg - could be configurable
      if (weightsStats && growthStats && growthStats.avgDailyGain > 0) {
        const currentAvg = weightsStats.avg;
        if (currentAvg < targetWeight) {
          const daysToTarget = Math.ceil((targetWeight - currentAvg) / growthStats.avgDailyGain);
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + daysToTarget);
          prediction = {
            targetWeight,
            estimatedDaysToTarget: daysToTarget,
            estimatedTargetDate: targetDate,
          };
        }
      }

      return {
        lotId: lot.id,
        lotName: lot.name,
        type: lot.type,
        animalCount,
        weights: weightsStats,
        growth: growthStats,
        prediction,
        lastWeighingDate,
      };
    });

    return {
      success: true,
      data: lotStats,
    };
  }
}
