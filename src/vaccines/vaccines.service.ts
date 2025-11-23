import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccineDto, UpdateVaccineDto, QueryVaccineDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

/**
 * Service for managing Custom Vaccines (PHASE_10)
 */
@Injectable()
export class VaccinesService {
  private readonly logger = new AppLogger(VaccinesService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateVaccineDto) {
    this.logger.debug(`Creating custom vaccine in farm ${farmId}`);

    try {
      const vaccine = await this.prisma.customVaccine.create({
        data: {
          ...dto,
          farmId,
        },
      });

      this.logger.audit('Custom vaccine created', { vaccineId: vaccine.id, farmId });
      return vaccine;
    } catch (error) {
      this.logger.error(`Failed to create custom vaccine in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  async findAll(farmId: string, query: QueryVaccineDto) {
    const where: any = {
      farmId,
    };

    // Soft delete filter
    if (!query.includeDeleted) {
      where.deletedAt = null;
    }

    // Search filter
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    return this.prisma.customVaccine.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const vaccine = await this.prisma.customVaccine.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!vaccine) {
      this.logger.warn('Custom vaccine not found', { vaccineId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VACCINE_NOT_FOUND,
        `Custom vaccine ${id} not found`,
        { vaccineId: id, farmId },
      );
    }

    return vaccine;
  }

  async update(farmId: string, id: string, dto: UpdateVaccineDto) {
    this.logger.debug(`Updating custom vaccine ${id}`);

    const existing = await this.prisma.customVaccine.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Custom vaccine not found', { vaccineId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VACCINE_NOT_FOUND,
        `Custom vaccine ${id} not found`,
        { vaccineId: id, farmId },
      );
    }

    // Optimistic locking (PHASE_10)
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException(
        'Version conflict: the vaccine has been modified by another user',
      );
    }

    try {
      const { version, ...updateData } = dto;

      const updated = await this.prisma.customVaccine.update({
        where: { id },
        data: {
          ...updateData,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Custom vaccine updated', { vaccineId: id, farmId });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update custom vaccine ${id}`, error.stack);
      throw error;
    }
  }

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting custom vaccine ${id}`);

    const existing = await this.prisma.customVaccine.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Custom vaccine not found', { vaccineId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VACCINE_NOT_FOUND,
        `Custom vaccine ${id} not found`,
        { vaccineId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.customVaccine.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Custom vaccine soft deleted', { vaccineId: id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete custom vaccine ${id}`, error.stack);
      throw error;
    }
  }
}
