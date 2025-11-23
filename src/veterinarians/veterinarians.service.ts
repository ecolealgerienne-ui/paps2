import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVeterinarianDto, UpdateVeterinarianDto, QueryVeterinarianDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class VeterinariansService {
  private readonly logger = new AppLogger(VeterinariansService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateVeterinarianDto) {
    this.logger.debug(`Creating veterinarian in farm ${farmId}`);

    try {
      const vet = await this.prisma.veterinarian.create({
        data: {
          ...dto,
          farmId,
        },
      });

      this.logger.audit('Veterinarian created', { veterinarianId: vet.id, farmId });
      return vet;
    } catch (error) {
      this.logger.error(`Failed to create veterinarian in farm ${farmId}`, error.stack);
      throw error;
    }
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
      this.logger.warn('Veterinarian not found', { veterinarianId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id, farmId },
      );
    }

    return vet;
  }

  async update(farmId: string, id: string, dto: UpdateVeterinarianDto) {
    this.logger.debug(`Updating veterinarian ${id}`);

    const existing = await this.prisma.veterinarian.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Veterinarian not found', { veterinarianId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id, farmId },
      );
    }

    try {
      const updated = await this.prisma.veterinarian.update({
        where: { id },
        data: {
          ...dto,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Veterinarian updated', { veterinarianId: id, farmId });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update veterinarian ${id}`, error.stack);
      throw error;
    }
  }

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting veterinarian ${id}`);

    const existing = await this.prisma.veterinarian.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Veterinarian not found', { veterinarianId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.veterinarian.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Veterinarian soft deleted', { veterinarianId: id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete veterinarian ${id}`, error.stack);
      throw error;
    }
  }

  // 🆕 PHASE_13: New methods

  async findByFarm(farmId: string) {
    this.logger.debug(`Finding veterinarians for farm ${farmId}`);
    // Uses composite index: idx_vets_farm_active
    return this.prisma.veterinarian.findMany({
      where: {
        farmId,
        isActive: true,
        deletedAt: null,
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async findDefault(farmId: string) {
    this.logger.debug(`Finding default veterinarian for farm ${farmId}`);
    // Uses composite index: idx_vets_farm_default
    const defaultVet = await this.prisma.veterinarian.findFirst({
      where: {
        farmId,
        isDefault: true,
        deletedAt: null,
      },
    });

    if (!defaultVet) {
      this.logger.warn('No default veterinarian found', { farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `No default veterinarian found for farm ${farmId}`,
        { farmId },
      );
    }

    return defaultVet;
  }

  async findByDepartment(department: string) {
    this.logger.debug(`Finding veterinarians in department ${department}`);
    // Uses composite index: idx_vets_dept_active
    return this.prisma.veterinarian.findMany({
      where: {
        department,
        isActive: true,
        deletedAt: null,
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async setDefault(farmId: string, id: string) {
    this.logger.debug(`Setting veterinarian ${id} as default for farm ${farmId}`);

    const vet = await this.prisma.veterinarian.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!vet) {
      this.logger.warn('Veterinarian not found', { veterinarianId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id, farmId },
      );
    }

    try {
      // First, unset all defaults for this farm
      await this.prisma.veterinarian.updateMany({
        where: {
          farmId,
          isDefault: true,
          deletedAt: null,
        },
        data: { isDefault: false },
      });

      // Then set the new default
      const updated = await this.prisma.veterinarian.update({
        where: { id },
        data: {
          isDefault: true,
          version: vet.version + 1,
        },
      });

      this.logger.audit('Default veterinarian set', { veterinarianId: id, farmId });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to set default veterinarian ${id}`, error.stack);
      throw error;
    }
  }
}
