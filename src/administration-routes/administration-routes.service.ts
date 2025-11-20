import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdministrationRouteDto, UpdateAdministrationRouteDto } from './dto';

@Injectable()
export class AdministrationRoutesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAdministrationRouteDto) {
    // Check if ID already exists
    const existing = await this.prisma.administrationRoute.findUnique({
      where: { id: dto.id },
    });

    if (existing) {
      throw new ConflictException(`Administration route ${dto.id} already exists`);
    }

    return this.prisma.administrationRoute.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.administrationRoute.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const route = await this.prisma.administrationRoute.findUnique({
      where: { id },
    });

    if (!route) {
      throw new NotFoundException(`Administration route ${id} not found`);
    }

    return route;
  }

  async update(id: string, dto: UpdateAdministrationRouteDto) {
    const existing = await this.prisma.administrationRoute.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Administration route ${id} not found`);
    }

    return this.prisma.administrationRoute.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.administrationRoute.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Administration route ${id} not found`);
    }

    return this.prisma.administrationRoute.delete({
      where: { id },
    });
  }
}
