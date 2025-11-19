import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVeterinarianDto, UpdateVeterinarianDto, QueryVeterinarianDto } from './dto';

@Injectable()
export class VeterinariansService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVeterinarianDto) {
    return this.prisma.veterinarian.create({
      data: dto,
    });
  }

  async findAll(query: QueryVeterinarianDto) {
    const where: any = {};

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return this.prisma.veterinarian.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const vet = await this.prisma.veterinarian.findUnique({
      where: { id },
    });

    if (!vet) {
      throw new NotFoundException(`Veterinarian ${id} not found`);
    }

    return vet;
  }

  async update(id: string, dto: UpdateVeterinarianDto) {
    const existing = await this.prisma.veterinarian.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Veterinarian ${id} not found`);
    }

    return this.prisma.veterinarian.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.veterinarian.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Veterinarian ${id} not found`);
    }

    return this.prisma.veterinarian.delete({
      where: { id },
    });
  }
}
