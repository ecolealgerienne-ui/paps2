import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalProductDto, UpdateMedicalProductDto, QueryMedicalProductDto } from './dto';

@Injectable()
export class MedicalProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMedicalProductDto) {
    return this.prisma.medicalProduct.create({
      data: dto,
    });
  }

  async findAll(query: QueryMedicalProductDto) {
    const where: any = {};

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

  async findOne(id: string) {
    const product = await this.prisma.medicalProduct.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Medical product ${id} not found`);
    }

    return product;
  }

  async update(id: string, dto: UpdateMedicalProductDto) {
    const existing = await this.prisma.medicalProduct.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Medical product ${id} not found`);
    }

    return this.prisma.medicalProduct.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.medicalProduct.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Medical product ${id} not found`);
    }

    return this.prisma.medicalProduct.delete({
      where: { id },
    });
  }
}
