import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto, UpdateMovementDto, QueryMovementDto } from './dto';
import { MovementType } from '../common/enums';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class MovementsService {
  private readonly logger = new AppLogger(MovementsService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateMovementDto) {
    this.logger.debug(`Creating movement in farm ${farmId}`, {
      type: dto.movementType,
      animalCount: dto.animalIds.length
    });

    // Verify all animals belong to farm
    const animals = await this.prisma.animal.findMany({
      where: {
        id: { in: dto.animalIds },
        farmId,
        deletedAt: null,
      },
    });

    if (animals.length !== dto.animalIds.length) {
      this.logger.warn('One or more animals not found for movement', {
        farmId,
        expected: dto.animalIds.length,
        found: animals.length
      });
      throw new EntityNotFoundException(
        ERROR_CODES.MOVEMENT_ANIMALS_NOT_FOUND,
        'One or more animals not found',
        { farmId, animalCount: dto.animalIds.length },
      );
    }

    try {
      // Create movement with transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create the movement
        const movement = await tx.movement.create({
          data: {
            id: dto.id,
            farmId,
            movementType: dto.movementType,
            movementDate: new Date(dto.movementDate),
            reason: dto.reason,
            buyerName: dto.buyerName,
            buyerType: dto.buyerType,
            buyerContact: dto.buyerContact,
            salePrice: dto.salePrice,
            sellerName: dto.sellerName,
            purchasePrice: dto.purchasePrice,
            destinationFarmId: dto.destinationFarmId,
            originFarmId: dto.originFarmId,
            temporaryType: dto.temporaryType,
            expectedReturnDate: dto.expectedReturnDate ? new Date(dto.expectedReturnDate) : null,
            documentNumber: dto.documentNumber,
            notes: dto.notes,
          },
        });

        // Create movement-animal associations
        await tx.movementAnimal.createMany({
          data: dto.animalIds.map(animalId => ({
            movementId: movement.id,
            animalId,
          })),
        });

        // Update animal status based on movement type
        const statusUpdate = this.getStatusUpdate(dto.movementType);
        if (statusUpdate) {
          await tx.animal.updateMany({
            where: { id: { in: dto.animalIds } },
            data: { status: statusUpdate },
          });
        }

        return this.findOne(farmId, movement.id);
      });

      this.logger.audit('Movement created', {
        movementId: dto.id,
        farmId,
        type: dto.movementType,
        animalCount: dto.animalIds.length
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to create movement in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  private getStatusUpdate(movementType: MovementType): string | null {
    switch (movementType) {
      case MovementType.SALE:
        return 'sold';
      case MovementType.DEATH:
        return 'dead';
      case MovementType.EXIT:
        return 'sold';
      default:
        return null;
    }
  }

  async findAll(farmId: string, query: QueryMovementDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.movementType) where.movementType = query.movementType;
    if (query.status) where.status = query.status;
    if (query.fromDate || query.toDate) {
      where.movementDate = {};
      if (query.fromDate) where.movementDate.gte = new Date(query.fromDate);
      if (query.toDate) where.movementDate.lte = new Date(query.toDate);
    }
    if (query.animalId) {
      where.movementAnimals = {
        some: { animalId: query.animalId },
      };
    }

    const page = query.page || 1;
    const limit = query.limit || 50;

    return this.prisma.movement.findMany({
      where,
      include: {
        movementAnimals: {
          include: {
            animal: {
              select: {
                id: true,
                visualId: true,
                currentEid: true,
                sex: true,
              },
            },
          },
        },
        _count: { select: { movementAnimals: true } },
      },
      orderBy: { movementDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(farmId: string, id: string) {
    const movement = await this.prisma.movement.findFirst({
      where: { id, farmId, deletedAt: null },
      include: {
        movementAnimals: {
          include: {
            animal: {
              select: {
                id: true,
                visualId: true,
                currentEid: true,
                sex: true,
                birthDate: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!movement) {
      this.logger.warn('Movement not found', { movementId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.MOVEMENT_NOT_FOUND,
        `Movement ${id} not found`,
        { movementId: id, farmId },
      );
    }

    return movement;
  }

  async update(farmId: string, id: string, dto: UpdateMovementDto) {
    this.logger.debug(`Updating movement ${id} (version ${dto.version})`);

    const existing = await this.prisma.movement.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Movement not found', { movementId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.MOVEMENT_NOT_FOUND,
        `Movement ${id} not found`,
        { movementId: id, farmId },
      );
    }

    // Version conflict check
    if (dto.version && existing.version > dto.version) {
      this.logger.warn('Version conflict detected', {
        movementId: id,
        serverVersion: existing.version,
        clientVersion: dto.version,
      });

      throw new EntityConflictException(
        ERROR_CODES.VERSION_CONFLICT,
        'Version conflict detected',
        {
          movementId: id,
          serverVersion: existing.version,
          clientVersion: dto.version,
        },
      );
    }

    try {
      const updateData: any = {
        ...dto,
        version: existing.version + 1,
      };

      if (dto.movementDate) updateData.movementDate = new Date(dto.movementDate);

      const updated = await this.prisma.movement.update({
        where: { id },
        data: updateData,
        include: {
          movementAnimals: {
            include: {
              animal: {
                select: {
                  id: true,
                  visualId: true,
                  currentEid: true,
                },
              },
            },
          },
        },
      });

      this.logger.audit('Movement updated', {
        movementId: id,
        farmId,
        version: `${existing.version} → ${updated.version}`,
      });

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update movement ${id}`, error.stack);
      throw error;
    }
  }

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting movement ${id}`);

    const existing = await this.prisma.movement.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Movement not found', { movementId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.MOVEMENT_NOT_FOUND,
        `Movement ${id} not found`,
        { movementId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.movement.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Movement soft deleted', { movementId: id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete movement ${id}`, error.stack);
      throw error;
    }
  }

  // Get movement statistics
  async getStatistics(farmId: string, fromDate?: string, toDate?: string) {
    this.logger.debug(`Calculating movement statistics for farm ${farmId}`);

    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (fromDate || toDate) {
      where.movementDate = {};
      if (fromDate) where.movementDate.gte = new Date(fromDate);
      if (toDate) where.movementDate.lte = new Date(toDate);
    }

    const movements = await this.prisma.movement.findMany({
      where,
      include: {
        _count: { select: { movementAnimals: true } },
      },
    });

    const stats = {
      totalMovements: movements.length,
      byType: {} as Record<string, { count: number; animalCount: number }>,
      totalSales: 0,
      totalPurchases: 0,
    };

    for (const m of movements) {
      if (!stats.byType[m.movementType]) {
        stats.byType[m.movementType] = { count: 0, animalCount: 0 };
      }
      stats.byType[m.movementType].count++;
      stats.byType[m.movementType].animalCount += m._count.movementAnimals;

      if (m.salePrice) stats.totalSales += m.salePrice;
      if (m.purchasePrice) stats.totalPurchases += m.purchasePrice;
    }

    return stats;
  }
}
