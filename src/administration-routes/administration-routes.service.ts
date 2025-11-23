import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdministrationRouteDto } from './dto/create-administration-route.dto';
import { UpdateAdministrationRouteDto } from './dto/update-administration-route.dto';

@Injectable()
export class AdministrationRoutesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAdministrationRouteDto) {
    // Vérifier code unique
    const existing = await this.prisma.administrationRoute.findUnique({
      where: { code: dto.code },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Administration route with code "${dto.code}" already exists`);
    }

    // Si soft-deleted, restaurer
    if (existing && existing.deletedAt) {
      return this.prisma.administrationRoute.update({
        where: { id: existing.id },
        data: {
          ...dto,
          deletedAt: null,
          version: existing.version + 1,
        },
      });
    }

    return this.prisma.administrationRoute.create({ data: dto });
  }

  async findAll(includeDeleted = false) {
    return this.prisma.administrationRoute.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const route = await this.prisma.administrationRoute.findUnique({
      where: { id },
    });

    if (!route || route.deletedAt) {
      throw new NotFoundException(`Administration route with id "${id}" not found`);
    }

    return route;
  }

  async findByCode(code: string) {
    const route = await this.prisma.administrationRoute.findUnique({
      where: { code },
    });

    if (!route || route.deletedAt) {
      throw new NotFoundException(`Administration route with code "${code}" not found`);
    }

    return route;
  }

  async update(id: string, dto: UpdateAdministrationRouteDto) {
    const existing = await this.findOne(id);

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict: the resource has been modified by another user');
    }

    return this.prisma.administrationRoute.update({
      where: { id },
      data: {
        ...dto,
        version: existing.version + 1,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);

    // Vérifier utilisation dans treatments
    const usageCount = await this.prisma.treatment.count({
      where: { routeId: id, deletedAt: null },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete: ${usageCount} active treatment(s) use this route`
      );
    }

    return this.prisma.administrationRoute.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }

  async restore(id: string) {
    const route = await this.prisma.administrationRoute.findUnique({
      where: { id },
    });

    if (!route) {
      throw new NotFoundException('Administration route not found');
    }

    if (!route.deletedAt) {
      throw new ConflictException('Administration route is not deleted');
    }

    return this.prisma.administrationRoute.update({
      where: { id },
      data: {
        deletedAt: null,
        version: route.version + 1,
      },
    });
  }
}
