import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeightDto, UpdateWeightDto, QueryWeightDto } from './dto';
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
      const weight = await this.prisma.weight.create({
        data: {
          ...dto,
          farmId,
          weightDate: new Date(dto.weightDate),
        },
        include: {
          animal: { select: { id: true, visualId: true, currentEid: true } },
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
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.animalId) where.animalId = query.animalId;
    if (query.source) where.source = query.source;
    if (query.fromDate || query.toDate) {
      where.weightDate = {};
      if (query.fromDate) where.weightDate.gte = new Date(query.fromDate);
      if (query.toDate) where.weightDate.lte = new Date(query.toDate);
    }

    return this.prisma.weight.findMany({
      where,
      include: {
        animal: { select: { id: true, visualId: true, currentEid: true } },
      },
      orderBy: { weightDate: 'desc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const weight = await this.prisma.weight.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
      include: {
        animal: { select: { id: true, visualId: true, currentEid: true } },
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

    try {
      const updateData: any = {
        ...dto,
        version: existing.version + 1,
      };

      if (dto.weightDate) updateData.weightDate = new Date(dto.weightDate);

      const updated = await this.prisma.weight.update({
        where: { id },
        data: updateData,
        include: {
          animal: { select: { id: true, visualId: true, currentEid: true } },
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
          version: existing.version + 1,
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
}
