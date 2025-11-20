import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBreedingDto, UpdateBreedingDto, QueryBreedingDto } from './dto';

@Injectable()
export class BreedingsService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateBreedingDto) {
    // Verify mother belongs to farm
    const mother = await this.prisma.animal.findFirst({
      where: { id: dto.motherId, farmId, deletedAt: null },
    });

    if (!mother) {
      throw new NotFoundException(`Mother animal ${dto.motherId} not found`);
    }

    if (mother.sex !== 'female') {
      throw new BadRequestException('Animal must be female');
    }

    // Verify father if provided
    if (dto.fatherId) {
      const father = await this.prisma.animal.findFirst({
        where: { id: dto.fatherId, farmId, deletedAt: null },
      });

      if (!father) {
        throw new NotFoundException(`Father animal ${dto.fatherId} not found`);
      }

      if (father.sex !== 'male') {
        throw new BadRequestException('Animal must be male');
      }
    }

    return this.prisma.breeding.create({
      data: {
        ...dto,
        farmId,
        breedingDate: new Date(dto.breedingDate),
        expectedBirthDate: new Date(dto.expectedBirthDate),
      },
      include: {
        mother: { select: { id: true, visualId: true, currentEid: true } },
        father: { select: { id: true, visualId: true, currentEid: true } },
      },
    });
  }

  async findAll(farmId: string, query: QueryBreedingDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.motherId) where.motherId = query.motherId;
    if (query.fatherId) where.fatherId = query.fatherId;
    if (query.status) where.status = query.status;
    if (query.fromDate || query.toDate) {
      where.breedingDate = {};
      if (query.fromDate) where.breedingDate.gte = new Date(query.fromDate);
      if (query.toDate) where.breedingDate.lte = new Date(query.toDate);
    }

    return this.prisma.breeding.findMany({
      where,
      include: {
        mother: { select: { id: true, visualId: true, currentEid: true } },
        father: { select: { id: true, visualId: true, currentEid: true } },
      },
      orderBy: { breedingDate: 'desc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const breeding = await this.prisma.breeding.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
      include: {
        mother: { select: { id: true, visualId: true, currentEid: true, birthDate: true } },
        father: { select: { id: true, visualId: true, currentEid: true } },
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
        farmId,
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
    if (dto.expectedBirthDate) updateData.expectedBirthDate = new Date(dto.expectedBirthDate);
    if (dto.actualBirthDate) updateData.actualBirthDate = new Date(dto.actualBirthDate);

    return this.prisma.breeding.update({
      where: { id },
      data: updateData,
      include: {
        mother: { select: { id: true, visualId: true, currentEid: true } },
        father: { select: { id: true, visualId: true, currentEid: true } },
      },
    });
  }

  async remove(farmId: string, id: string) {
    const existing = await this.prisma.breeding.findFirst({
      where: {
        id,
        farmId,
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

  // Get upcoming birth dates
  async getUpcomingBirthDates(farmId: string, days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.breeding.findMany({
      where: {
        farmId,
        deletedAt: null,
        status: { in: ['confirmed', 'in_progress'] },
        expectedBirthDate: {
          gte: new Date(),
          lte: futureDate,
        },
      },
      include: {
        mother: { select: { id: true, visualId: true, currentEid: true } },
      },
      orderBy: { expectedBirthDate: 'asc' },
    });
  }
}
