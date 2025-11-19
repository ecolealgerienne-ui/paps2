import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBreedingDto, UpdateBreedingDto, QueryBreedingDto } from './dto';

@Injectable()
export class BreedingsService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateBreedingDto) {
    // Verify female belongs to farm
    const female = await this.prisma.animal.findFirst({
      where: { id: dto.femaleId, farmId, deletedAt: null },
    });

    if (!female) {
      throw new NotFoundException(`Female animal ${dto.femaleId} not found`);
    }

    if (female.sex !== 'female') {
      throw new BadRequestException('Animal must be female');
    }

    // Verify male if provided
    if (dto.maleId) {
      const male = await this.prisma.animal.findFirst({
        where: { id: dto.maleId, farmId, deletedAt: null },
      });

      if (!male) {
        throw new NotFoundException(`Male animal ${dto.maleId} not found`);
      }

      if (male.sex !== 'male') {
        throw new BadRequestException('Animal must be male');
      }
    }

    return this.prisma.breeding.create({
      data: {
        ...dto,
        breedingDate: new Date(dto.breedingDate),
        expectedDueDate: dto.expectedDueDate ? new Date(dto.expectedDueDate) : null,
      },
      include: {
        female: { select: { id: true, visualId: true, currentEid: true } },
        male: { select: { id: true, visualId: true, currentEid: true } },
      },
    });
  }

  async findAll(farmId: string, query: QueryBreedingDto) {
    const where: any = {
      female: { farmId },
      deletedAt: null,
    };

    if (query.femaleId) where.femaleId = query.femaleId;
    if (query.status) where.status = query.status;
    if (query.fromDate || query.toDate) {
      where.breedingDate = {};
      if (query.fromDate) where.breedingDate.gte = new Date(query.fromDate);
      if (query.toDate) where.breedingDate.lte = new Date(query.toDate);
    }

    return this.prisma.breeding.findMany({
      where,
      include: {
        female: { select: { id: true, visualId: true, currentEid: true } },
        male: { select: { id: true, visualId: true, currentEid: true } },
        offspring: { select: { id: true, visualId: true, currentEid: true } },
      },
      orderBy: { breedingDate: 'desc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const breeding = await this.prisma.breeding.findFirst({
      where: {
        id,
        female: { farmId },
        deletedAt: null,
      },
      include: {
        female: { select: { id: true, visualId: true, currentEid: true, birthDate: true } },
        male: { select: { id: true, visualId: true, currentEid: true } },
        offspring: { select: { id: true, visualId: true, currentEid: true, birthDate: true } },
      },
    });

    if (!breeding) {
      throw new NotFoundException(`Breeding ${id} not found`);
    }

    return breeding;
  }

  async update(farmId: string, id: string, dto: UpdateBreedingDto) {
    const existing = await this.prisma.breeding.findFirst({
      where: {
        id,
        female: { farmId },
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Breeding ${id} not found`);
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

    if (dto.breedingDate) updateData.breedingDate = new Date(dto.breedingDate);
    if (dto.expectedDueDate) updateData.expectedDueDate = new Date(dto.expectedDueDate);
    if (dto.actualDueDate) updateData.actualDueDate = new Date(dto.actualDueDate);

    return this.prisma.breeding.update({
      where: { id },
      data: updateData,
      include: {
        female: { select: { id: true, visualId: true, currentEid: true } },
        male: { select: { id: true, visualId: true, currentEid: true } },
        offspring: { select: { id: true, visualId: true, currentEid: true } },
      },
    });
  }

  async remove(farmId: string, id: string) {
    const existing = await this.prisma.breeding.findFirst({
      where: {
        id,
        female: { farmId },
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Breeding ${id} not found`);
    }

    return this.prisma.breeding.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }

  // Get upcoming due dates
  async getUpcomingDueDates(farmId: string, days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.breeding.findMany({
      where: {
        female: { farmId },
        deletedAt: null,
        status: { in: ['confirmed', 'in_progress'] },
        expectedDueDate: {
          gte: new Date(),
          lte: futureDate,
        },
      },
      include: {
        female: { select: { id: true, visualId: true, currentEid: true } },
      },
      orderBy: { expectedDueDate: 'asc' },
    });
  }
}
