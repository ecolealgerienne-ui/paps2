import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalProductDto, UpdateMedicalProductDto, QueryMedicalProductDto } from './dto';

@Injectable()
export class MedicalProductsService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateMedicalProductDto) {
    return this.prisma.medicalProduct.create({
      data: {
        ...dto,
        farmId,
      },
    });
  }

  async findAll(farmId: string, query: QueryMedicalProductDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return this.prisma.medicalProduct.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const product = await this.prisma.medicalProduct.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException(`Medical product ${id} not found`);
    }

    return product;
  }

  async update(farmId: string, id: string, dto: UpdateMedicalProductDto) {
    const existing = await this.prisma.medicalProduct.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Medical product ${id} not found`);
    }

    return this.prisma.medicalProduct.update({
      where: { id },
      data: {
        ...dto,
        version: existing.version + 1,
      },
    });
  }

  async remove(farmId: string, id: string) {
    const existing = await this.prisma.medicalProduct.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Medical product ${id} not found`);
    }

    // Soft delete
    return this.prisma.medicalProduct.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }
}
