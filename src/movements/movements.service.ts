import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto, UpdateMovementDto, QueryMovementDto } from './dto';
import { MovementType } from '../common/enums';

@Injectable()
export class MovementsService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateMovementDto) {
    // Verify all animals belong to farm
    const animals = await this.prisma.animal.findMany({
      where: {
        id: { in: dto.animalIds },
        farmId,
        deletedAt: null,
      },
    });

    if (animals.length !== dto.animalIds.length) {
      throw new BadRequestException('One or more animals not found');
    }

    // Create movement with transaction
    return this.prisma.$transaction(async (tx) => {
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
      throw new NotFoundException(`Movement ${id} not found`);
    }

    return movement;
  }

  async update(farmId: string, id: string, dto: UpdateMovementDto) {
    const existing = await this.prisma.movement.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Movement ${id} not found`);
    }

    if (dto.version && existing.version > dto.version) {
      throw new ConflictException({
        message: 'Version conflict',
        serverVersion: existing.version,
        serverData: existing,
      });
    }

    const updateData: any = {
      ...dto,
      version: existing.version + 1,
    };

    if (dto.movementDate) updateData.movementDate = new Date(dto.movementDate);

    return this.prisma.movement.update({
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
  }

  async remove(farmId: string, id: string) {
    const existing = await this.prisma.movement.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Movement ${id} not found`);
    }

    return this.prisma.movement.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }

  // Get movement statistics
  async getStatistics(farmId: string, fromDate?: string, toDate?: string) {
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
