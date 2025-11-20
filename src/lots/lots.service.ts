import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLotDto, UpdateLotDto, QueryLotDto, AddAnimalsToLotDto } from './dto';

@Injectable()
export class LotsService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateLotDto) {
    return this.prisma.lot.create({
      data: {
        ...dto,
        farmId,
      },
      include: {
        _count: { select: { lotAnimals: true } },
      },
    });
  }

  async findAll(farmId: string, query: QueryLotDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.type) where.type = query.type;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    return this.prisma.lot.findMany({
      where,
      include: {
        _count: { select: { lotAnimals: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const lot = await this.prisma.lot.findFirst({
      where: { id, farmId, deletedAt: null },
      include: {
        lotAnimals: {
          where: { leftAt: null },
          include: {
            animal: {
              select: {
                id: true,
                visualId: true,
                currentEid: true,
                sex: true,
                status: true,
                birthDate: true,
              },
            },
          },
        },
        _count: { select: { lotAnimals: true } },
      },
    });

    if (!lot) {
      throw new NotFoundException(`Lot ${id} not found`);
    }

    return lot;
  }

  async update(farmId: string, id: string, dto: UpdateLotDto) {
    const existing = await this.prisma.lot.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Lot ${id} not found`);
    }

    // Version conflict check
    if (dto.version && existing.version > dto.version) {
      throw new ConflictException({
        message: 'Version conflict',
        serverVersion: existing.version,
        serverData: existing,
      });
    }

    return this.prisma.lot.update({
      where: { id },
      data: {
        ...dto,
        version: existing.version + 1,
      },
      include: {
        _count: { select: { lotAnimals: true } },
      },
    });
  }

  async remove(farmId: string, id: string) {
    const existing = await this.prisma.lot.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Lot ${id} not found`);
    }

    // Soft delete
    return this.prisma.lot.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }

  async addAnimals(farmId: string, lotId: string, dto: AddAnimalsToLotDto) {
    const lot = await this.prisma.lot.findFirst({
      where: { id: lotId, farmId, deletedAt: null },
    });

    if (!lot) {
      throw new NotFoundException(`Lot ${lotId} not found`);
    }

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

    return this.findOne(farmId, lotId);
  }

  async removeAnimals(farmId: string, lotId: string, animalIds: string[]) {
    const lot = await this.prisma.lot.findFirst({
      where: { id: lotId, farmId, deletedAt: null },
    });

    if (!lot) {
      throw new NotFoundException(`Lot ${lotId} not found`);
    }

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

    return this.findOne(farmId, lotId);
  }

  async finalize(farmId: string, lotId: string) {
    const lot = await this.prisma.lot.findFirst({
      where: { id: lotId, farmId, deletedAt: null },
    });

    if (!lot) {
      throw new NotFoundException(`Lot ${lotId} not found`);
    }

    return this.prisma.lot.update({
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
  }
}
