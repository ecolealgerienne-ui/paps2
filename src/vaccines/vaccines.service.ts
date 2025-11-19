import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccineDto, UpdateVaccineDto, QueryVaccineDto } from './dto';

@Injectable()
export class VaccinesService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateVaccineDto) {
    return this.prisma.vaccine.create({
      data: {
        ...dto,
        farmId,
      },
      include: { species: true },
    });
  }

  async findAll(farmId: string, query: QueryVaccineDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.speciesId) {
      where.speciesId = query.speciesId;
    }
    if (query.disease) {
      where.disease = { contains: query.disease, mode: 'insensitive' };
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return this.prisma.vaccine.findMany({
      where,
      include: { species: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const vaccine = await this.prisma.vaccine.findFirst({
      where: { id, farmId, deletedAt: null },
      include: { species: true },
    });

    if (!vaccine) {
      throw new NotFoundException(`Vaccine ${id} not found`);
    }

    return vaccine;
  }

  async update(farmId: string, id: string, dto: UpdateVaccineDto) {
    const existing = await this.prisma.vaccine.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Vaccine ${id} not found`);
    }

    return this.prisma.vaccine.update({
      where: { id },
      data: {
        ...dto,
        version: existing.version + 1,
      },
      include: { species: true },
    });
  }

  async remove(farmId: string, id: string) {
    const existing = await this.prisma.vaccine.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Vaccine ${id} not found`);
    }

    // Soft delete
    return this.prisma.vaccine.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
      include: { species: true },
    });
  }
}
