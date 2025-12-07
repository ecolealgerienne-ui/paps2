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
        // Create the movement with all fields from Prisma schema
        const movement = await tx.movement.create({
          data: {
            id: dto.id,
            farmId: dto.farmId || farmId,
            lotId: dto.lotId,
            movementType: dto.movementType,
            movementDate: new Date(dto.movementDate),
            reason: dto.reason,
            status: dto.status || 'ongoing',
            // Sale fields
            buyerName: dto.buyerName,
            buyerType: dto.buyerType,
            buyerContact: dto.buyerContact,
            buyerFarmId: dto.buyerFarmId,
            buyerQrSignature: dto.buyerQrSignature,
            salePrice: dto.salePrice,
            // Purchase fields
            sellerName: dto.sellerName,
            purchasePrice: dto.purchasePrice,
            // Transfer fields
            destinationFarmId: dto.destinationFarmId,
            originFarmId: dto.originFarmId,
            // Slaughter fields
            slaughterhouseName: dto.slaughterhouseName,
            slaughterhouseId: dto.slaughterhouseId,
            // Temporary movement fields
            isTemporary: dto.isTemporary || false,
            temporaryType: dto.temporaryType,
            expectedReturnDate: dto.expectedReturnDate ? new Date(dto.expectedReturnDate) : null,
            returnDate: dto.returnDate ? new Date(dto.returnDate) : null,
            returnNotes: dto.returnNotes,
            relatedMovementId: dto.relatedMovementId,
            // Other
            documentNumber: dto.documentNumber,
            notes: dto.notes,
            // CRITICAL: Use client timestamps if provided (offline-first)
            ...(dto.created_at && { createdAt: new Date(dto.created_at) }),
            ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
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

        // Return movement with relations (use tx, not this.prisma)
        return tx.movement.findUnique({
          where: { id: movement.id },
          include: {
            movementAnimals: {
              include: {
                animal: true,
              },
            },
          },
        });
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

  /**
   * Find all animals associated with a specific movement
   * Endpoint: GET /api/v1/farms/:farmId/movements/:movementId/animals
   */
  async findAnimalsByMovementId(farmId: string, movementId: string) {
    // Verify movement exists and belongs to farm
    const movement = await this.prisma.movement.findFirst({
      where: { id: movementId, farmId, deletedAt: null },
    });

    if (!movement) {
      this.logger.warn('Movement not found', { movementId, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.MOVEMENT_NOT_FOUND,
        `Movement ${movementId} not found`,
        { movementId, farmId },
      );
    }

    const movementAnimals = await this.prisma.movementAnimal.findMany({
      where: { movementId },
      include: {
        animal: {
          select: {
            id: true,
            visualId: true,
            currentEid: true,
            officialNumber: true,
            sex: true,
            birthDate: true,
            status: true,
            breed: {
              select: {
                id: true,
                nameFr: true,
                nameEn: true,
                species: {
                  select: {
                    id: true,
                    nameFr: true,
                    nameEn: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Extract animals from the junction table
    const animals = movementAnimals.map((ma) => ma.animal);

    this.logger.debug(`Found ${animals.length} animals for movement ${movementId}`);
    return animals;
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

    // If animalIds provided, verify all animals belong to farm
    if (dto.animalIds && dto.animalIds.length > 0) {
      const animals = await this.prisma.animal.findMany({
        where: {
          id: { in: dto.animalIds },
          farmId,
          deletedAt: null,
        },
      });

      if (animals.length !== dto.animalIds.length) {
        this.logger.warn('One or more animals not found for movement update', {
          farmId,
          expected: dto.animalIds.length,
          found: animals.length,
        });
        throw new EntityNotFoundException(
          ERROR_CODES.MOVEMENT_ANIMALS_NOT_FOUND,
          'One or more animals not found',
          { farmId, animalCount: dto.animalIds.length },
        );
      }
    }

    try {
      // Use transaction to ensure atomicity when updating movement + animals
      const result = await this.prisma.$transaction(async (tx) => {
        // Destructure to exclude BaseSyncEntityDto fields and animalIds
        const { farmId: dtoFarmId, created_at, updated_at, version, animalIds, ...movementData } = dto;

        // Build update data with all fields
        const updateData: any = {
          version: existing.version + 1,
        };

        // Movement basic fields
        if (movementData.movementType !== undefined) updateData.movementType = movementData.movementType;
        if (movementData.movementDate) updateData.movementDate = new Date(movementData.movementDate);
        if (movementData.lotId !== undefined) updateData.lotId = movementData.lotId;
        if (movementData.reason !== undefined) updateData.reason = movementData.reason;
        if (movementData.status !== undefined) updateData.status = movementData.status;

        // Sale fields
        if (movementData.buyerName !== undefined) updateData.buyerName = movementData.buyerName;
        if (movementData.buyerType !== undefined) updateData.buyerType = movementData.buyerType;
        if (movementData.buyerContact !== undefined) updateData.buyerContact = movementData.buyerContact;
        if (movementData.buyerFarmId !== undefined) updateData.buyerFarmId = movementData.buyerFarmId;
        if (movementData.buyerQrSignature !== undefined) updateData.buyerQrSignature = movementData.buyerQrSignature;
        if (movementData.salePrice !== undefined) updateData.salePrice = movementData.salePrice;

        // Purchase fields
        if (movementData.sellerName !== undefined) updateData.sellerName = movementData.sellerName;
        if (movementData.purchasePrice !== undefined) updateData.purchasePrice = movementData.purchasePrice;

        // Transfer fields
        if (movementData.destinationFarmId !== undefined) updateData.destinationFarmId = movementData.destinationFarmId;
        if (movementData.originFarmId !== undefined) updateData.originFarmId = movementData.originFarmId;

        // Slaughter fields
        if (movementData.slaughterhouseName !== undefined) updateData.slaughterhouseName = movementData.slaughterhouseName;
        if (movementData.slaughterhouseId !== undefined) updateData.slaughterhouseId = movementData.slaughterhouseId;

        // Temporary movement fields
        if (movementData.isTemporary !== undefined) updateData.isTemporary = movementData.isTemporary;
        if (movementData.temporaryType !== undefined) updateData.temporaryType = movementData.temporaryType;
        if (movementData.expectedReturnDate !== undefined) {
          updateData.expectedReturnDate = movementData.expectedReturnDate ? new Date(movementData.expectedReturnDate) : null;
        }
        if (movementData.returnDate !== undefined) {
          updateData.returnDate = movementData.returnDate ? new Date(movementData.returnDate) : null;
        }
        if (movementData.returnNotes !== undefined) updateData.returnNotes = movementData.returnNotes;
        if (movementData.relatedMovementId !== undefined) updateData.relatedMovementId = movementData.relatedMovementId;

        // Other fields
        if (movementData.documentNumber !== undefined) updateData.documentNumber = movementData.documentNumber;
        if (movementData.notes !== undefined) updateData.notes = movementData.notes;

        // CRITICAL: Use client timestamp if provided (offline-first)
        if (updated_at) updateData.updatedAt = new Date(updated_at);

        // Update the movement
        await tx.movement.update({
          where: { id },
          data: updateData,
        });

        // If animalIds provided, update the animal list atomically
        if (animalIds !== undefined) {
          // Delete existing associations
          await tx.movementAnimal.deleteMany({
            where: { movementId: id },
          });

          // Create new associations
          if (animalIds.length > 0) {
            await tx.movementAnimal.createMany({
              data: animalIds.map((animalId) => ({
                movementId: id,
                animalId,
              })),
            });
          }

          this.logger.debug(`Updated animal list for movement ${id}`, {
            animalCount: animalIds.length,
          });
        }

        // Return updated movement with relations
        return tx.movement.findUnique({
          where: { id },
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
      });

      this.logger.audit('Movement updated', {
        movementId: id,
        farmId,
        version: `${existing.version} → ${result?.version}`,
        animalsUpdated: dto.animalIds !== undefined,
      });

      return result;
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
