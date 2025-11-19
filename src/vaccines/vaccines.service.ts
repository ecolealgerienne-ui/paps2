import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccineDto, UpdateVaccineDto, QueryVaccineDto } from './dto';

@Injectable()
export class VaccinesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVaccineDto) {
    return this.prisma.vaccine.create({
      data: dto,
      include: { species: true },
    });
  }

  async findAll(query: QueryVaccineDto) {
    const where: any = {};

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

  async findOne(id: string) {
    const vaccine = await this.prisma.vaccine.findUnique({
      where: { id },
      include: { species: true },
    });

    if (!vaccine) {
      throw new NotFoundException(`Vaccine ${id} not found`);
    }

    return vaccine;
  }

  async update(id: string, dto: UpdateVaccineDto) {
    const existing = await this.prisma.vaccine.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Vaccine ${id} not found`);
    }

    return this.prisma.vaccine.update({
      where: { id },
      data: dto,
      include: { species: true },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.vaccine.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Vaccine ${id} not found`);
    }

    return this.prisma.vaccine.delete({
      where: { id },
    });
  }
}
