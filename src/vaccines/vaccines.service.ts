import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccineDto, UpdateVaccineDto, QueryVaccineDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class VaccinesService {
  private readonly logger = new AppLogger(VaccinesService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateVaccineDto) {
    this.logger.debug(`Creating vaccine in farm ${farmId}`);

    try {
      const vaccine = await this.prisma.vaccine.create({
        data: {
          ...dto,
          farmId,
        },
      });

      this.logger.audit('Vaccine created', { vaccineId: vaccine.id, farmId });
      return vaccine;
    } catch (error) {
      this.logger.error(`Failed to create vaccine in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  async findAll(farmId: string, query: QueryVaccineDto) {
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

    return this.prisma.vaccine.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const vaccine = await this.prisma.vaccine.findFirst({
      where: { id, farmId, deletedAt: null },
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

  async update(farmId: string, id: string, dto: UpdateVaccineDto) {
    this.logger.debug(`Updating vaccine ${id}`);

    const existing = await this.prisma.vaccine.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Vaccine not found', { vaccineId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VACCINE_NOT_FOUND,
        `Vaccine ${id} not found`,
        { vaccineId: id, farmId },
      );
    }

    try {
      const updated = await this.prisma.vaccine.update({
        where: { id },
        data: {
          ...dto,
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

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting vaccine ${id}`);

    const existing = await this.prisma.vaccine.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Vaccine not found', { vaccineId: id, farmId });
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
