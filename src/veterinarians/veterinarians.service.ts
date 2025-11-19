import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVeterinarianDto, UpdateVeterinarianDto, QueryVeterinarianDto } from './dto';

@Injectable()
export class VeterinariansService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateVeterinarianDto) {
    return this.prisma.veterinarian.create({
      data: {
        ...dto,
        farmId,
      },
    });
  }

  async findAll(farmId: string, query: QueryVeterinarianDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return this.prisma.veterinarian.findMany({
      where,
      orderBy: { lastName: 'asc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const vet = await this.prisma.veterinarian.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!vet) {
      throw new NotFoundException(`Veterinarian ${id} not found`);
    }

    return vet;
  }

  async update(farmId: string, id: string, dto: UpdateVeterinarianDto) {
    const existing = await this.prisma.veterinarian.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Veterinarian ${id} not found`);
    }

    return this.prisma.veterinarian.update({
      where: { id },
      data: {
        ...dto,
        version: existing.version + 1,
      },
    });
  }

  async remove(farmId: string, id: string) {
    const existing = await this.prisma.veterinarian.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Veterinarian ${id} not found`);
    }

    // Soft delete
    return this.prisma.veterinarian.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }
}
