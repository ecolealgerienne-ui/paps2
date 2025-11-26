import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccineDto, UpdateVaccineDto, QueryVaccineDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';
import { DataScope, Prisma } from '@prisma/client';

/**
 * Service for managing Vaccines (Master Table Pattern)
 * Supports both global (admin) and local (farm-specific) vaccines
 */
@Injectable()
export class VaccinesService {
  private readonly logger = new AppLogger(VaccinesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a local vaccine for a farm
   * Local vaccines have scope='local' and farmId set
   */
  async create(farmId: string, dto: CreateVaccineDto) {
    this.logger.debug(`Creating local vaccine in farm ${farmId}`);

    try {
      const vaccine = await this.prisma.vaccine.create({
        data: {
          ...dto,
          scope: DataScope.local,
          farmId,
        },
      });

      this.logger.audit('Vaccine created', { vaccineId: vaccine.id, farmId, scope: 'local' });
      return vaccine;
    } catch (error) {
      this.logger.error(`Failed to create vaccine in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  /**
   * Find all vaccines accessible to a farm
   * Returns global vaccines + farm's local vaccines
   * Supports filtering by scope (global, local, all)
   */
  async findAll(farmId: string, query: QueryVaccineDto) {
    const {
      search,
      scope = 'all',
      targetDisease,
      isActive,
      page = 1,
      limit = 50,
      sort = 'nameFr',
      order = 'asc',
    } = query;

    // Build scope filter
    let scopeFilter: Prisma.VaccineWhereInput;
    if (scope === 'global') {
      scopeFilter = { scope: DataScope.global };
    } else if (scope === 'local') {
      scopeFilter = { scope: DataScope.local, farmId };
    } else {
      // 'all' - return global + farm's local vaccines
      scopeFilter = {
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
      };
    }

    // Build complete where clause
    const where: Prisma.VaccineWhereInput = {
      ...scopeFilter,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { nameFr: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { laboratoire: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (targetDisease) {
      where.targetDisease = targetDisease; // Enum value, exact match
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.vaccine.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      this.prisma.vaccine.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a vaccine by ID
   * Returns global vaccines or farm's local vaccines
   */
  async findOne(farmId: string, id: string) {
    const vaccine = await this.prisma.vaccine.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
      },
    });

    if (!vaccine) {
      this.logger.warn('Vaccine not found', { vaccineId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VACCINE_NOT_FOUND,
        `Vaccine ${id} not found`,
        { vaccineId: id, farmId },
      );
    }

    return vaccine;
  }

  /**
   * Update a vaccine
   * Only local vaccines owned by the farm can be updated
   * Global vaccines are read-only for farmers
   */
  async update(farmId: string, id: string, dto: UpdateVaccineDto) {
    this.logger.debug(`Updating vaccine ${id}`);

    const existing = await this.prisma.vaccine.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Vaccine not found', { vaccineId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VACCINE_NOT_FOUND,
        `Vaccine ${id} not found`,
        { vaccineId: id, farmId },
      );
    }

    // Check if this is a global vaccine (read-only for farmers)
    if (existing.scope === DataScope.global) {
      this.logger.warn('Cannot update global vaccine', { vaccineId: id, farmId });
      throw new ForbiddenException('Global vaccines cannot be modified');
    }

    // Check if this local vaccine belongs to the farm
    if (existing.farmId !== farmId) {
      this.logger.warn('Vaccine belongs to another farm', { vaccineId: id, farmId, ownerFarmId: existing.farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VACCINE_NOT_FOUND,
        `Vaccine ${id} not found`,
        { vaccineId: id, farmId },
      );
    }

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException(
        'Version conflict: the vaccine has been modified by another user',
      );
    }

    try {
      const { version, ...updateData } = dto;

      const updated = await this.prisma.vaccine.update({
        where: { id },
        data: {
          ...updateData,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Vaccine updated', { vaccineId: id, farmId });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update vaccine ${id}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete a vaccine
   * Only local vaccines owned by the farm can be deleted
   * Global vaccines cannot be deleted by farmers
   */
  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting vaccine ${id}`);

    const existing = await this.prisma.vaccine.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Vaccine not found', { vaccineId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VACCINE_NOT_FOUND,
        `Vaccine ${id} not found`,
        { vaccineId: id, farmId },
      );
    }

    // Check if this is a global vaccine (cannot be deleted by farmers)
    if (existing.scope === DataScope.global) {
      this.logger.warn('Cannot delete global vaccine', { vaccineId: id, farmId });
      throw new ForbiddenException('Global vaccines cannot be deleted');
    }

    // Check if this local vaccine belongs to the farm
    if (existing.farmId !== farmId) {
      this.logger.warn('Vaccine belongs to another farm', { vaccineId: id, farmId, ownerFarmId: existing.farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VACCINE_NOT_FOUND,
        `Vaccine ${id} not found`,
        { vaccineId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.vaccine.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Vaccine soft deleted', { vaccineId: id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete vaccine ${id}`, error.stack);
      throw error;
    }
  }
}
