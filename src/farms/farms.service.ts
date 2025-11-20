import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmDto, UpdateFarmDto, QueryFarmDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class FarmsService {
  private readonly logger = new AppLogger(FarmsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFarmDto) {
    this.logger.debug(`Creating farm`, { name: dto.name, ownerId: dto.ownerId });

    try {
      const farm = await this.prisma.farm.create({
        data: {
          id: dto.id,
          name: dto.name,
          location: dto.location,
          ownerId: dto.ownerId,
          cheptelNumber: dto.cheptelNumber,
          groupId: dto.groupId,
          groupName: dto.groupName,
          isDefault: dto.isDefault ?? false,
        },
        include: {
          _count: {
            select: {
              animals: true,
              lots: true,
              veterinarians: true,
            },
          },
        },
      });

      this.logger.audit('Farm created', { farmId: farm.id, name: farm.name });
      return farm;
    } catch (error) {
      this.logger.error(`Failed to create farm`, error.stack);
      throw error;
    }
  }

  async findAll(query: QueryFarmDto) {
    const where: any = {};

    if (query.ownerId) where.ownerId = query.ownerId;
    if (query.groupId) where.groupId = query.groupId;
    if (query.isDefault !== undefined) where.isDefault = query.isDefault;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' as const } },
        { location: { contains: query.search, mode: 'insensitive' as const } },
      ];
    }

    return this.prisma.farm.findMany({
      where,
      include: {
        _count: {
          select: {
            animals: true,
            lots: true,
            veterinarians: true,
            medicalProducts: true,
            vaccines: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    this.logger.debug(`Finding farm ${id}`);

    const farm = await this.prisma.farm.findUnique({
      where: { id },
      include: {
        preferences: true,
        _count: {
          select: {
            animals: true,
            lots: true,
            movements: true,
            campaigns: true,
            treatments: true,
            vaccinations: true,
            breedings: true,
            weights: true,
            documents: true,
            veterinarians: true,
            medicalProducts: true,
            vaccines: true,
            alertConfigurations: true,
          },
        },
      },
    });

    if (!farm) {
      this.logger.warn('Farm not found', { farmId: id });
      throw new EntityNotFoundException(
        ERROR_CODES.ENTITY_NOT_FOUND,
        `Farm ${id} not found`,
        { farmId: id },
      );
    }

    return farm;
  }

  async update(id: string, dto: UpdateFarmDto) {
    this.logger.debug(`Updating farm ${id}`);

    // Verify farm exists
    await this.findOne(id);

    try {
      const updated = await this.prisma.farm.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.location !== undefined && { location: dto.location }),
          ...(dto.ownerId !== undefined && { ownerId: dto.ownerId }),
          ...(dto.cheptelNumber !== undefined && { cheptelNumber: dto.cheptelNumber }),
          ...(dto.groupId !== undefined && { groupId: dto.groupId }),
          ...(dto.groupName !== undefined && { groupName: dto.groupName }),
          ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        },
        include: {
          _count: {
            select: {
              animals: true,
              lots: true,
              veterinarians: true,
            },
          },
        },
      });

      this.logger.audit('Farm updated', { farmId: id, name: updated.name });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update farm ${id}`, error.stack);
      throw error;
    }
  }

  async remove(id: string) {
    this.logger.debug(`Deleting farm ${id}`);

    // Verify farm exists
    await this.findOne(id);

    try {
      const deleted = await this.prisma.farm.delete({
        where: { id },
      });

      this.logger.audit('Farm deleted', { farmId: id, name: deleted.name });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete farm ${id}`, error.stack);
      throw error;
    }
  }
}
