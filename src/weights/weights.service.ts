import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeightDto, UpdateWeightDto, QueryWeightDto } from './dto';

@Injectable()
export class WeightsService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateWeightDto) {
    // Verify animal belongs to farm
    const animal = await this.prisma.animal.findFirst({
      where: { id: dto.animalId, farmId, deletedAt: null },
    });

    if (!animal) {
      throw new NotFoundException(`Animal ${dto.animalId} not found`);
    }

    return this.prisma.weight.create({
      data: {
        ...dto,
        weightDate: new Date(dto.weightDate),
      },
      include: {
        animal: { select: { id: true, visualId: true, currentEid: true } },
      },
    });
  }

  async findAll(farmId: string, query: QueryWeightDto) {
    const where: any = {
      animal: { farmId },
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
        animal: { farmId },
        deletedAt: null,
      },
      include: {
        animal: { select: { id: true, visualId: true, currentEid: true } },
      },
    });

    if (!weight) {
      throw new NotFoundException(`Weight ${id} not found`);
    }

    return weight;
  }

  async update(farmId: string, id: string, dto: UpdateWeightDto) {
    const existing = await this.prisma.weight.findFirst({
      where: {
        id,
        animal: { farmId },
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Weight ${id} not found`);
    }

    if (dto.version && existing.version > dto.version) {
      throw new ConflictException({
        message: 'Version conflict',
        serverVersion: existing.version,
        serverData: existing,
      });
    }

    const updateData: any = {
      ...dto,
      version: existing.version + 1,
    };

    if (dto.weightDate) updateData.weightDate = new Date(dto.weightDate);

    return this.prisma.weight.update({
      where: { id },
      data: updateData,
      include: {
        animal: { select: { id: true, visualId: true, currentEid: true } },
      },
    });
  }

  async remove(farmId: string, id: string) {
    const existing = await this.prisma.weight.findFirst({
      where: {
        id,
        animal: { farmId },
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Weight ${id} not found`);
    }

    return this.prisma.weight.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }

  // Get weight history for an animal with gain calculation
  async getAnimalWeightHistory(farmId: string, animalId: string) {
    const weights = await this.prisma.weight.findMany({
      where: {
        animalId,
        animal: { farmId },
        deletedAt: null,
      },
      orderBy: { weightDate: 'asc' },
    });

    // Calculate daily gain between consecutive weights
    const history = weights.map((w, i) => {
      let dailyGain = null;
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
        dailyGain: dailyGain ? Math.round(dailyGain * 1000) / 1000 : null, // kg/day
      };
    });

    return history;
  }
}
