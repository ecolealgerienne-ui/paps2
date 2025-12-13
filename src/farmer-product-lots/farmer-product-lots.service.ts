import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFarmerProductLotDto,
  UpdateFarmerProductLotDto,
  QueryFarmerProductLotDto,
  AdjustStockDto,
  StockAdjustmentType,
} from './dto';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';
import { AppLogger } from '../common/utils/logger.service';

@Injectable()
export class FarmerProductLotsService {
  private readonly logger = new AppLogger(FarmerProductLotsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Vérifier que la config existe et appartient à la ferme
   */
  private async verifyConfig(farmId: string, configId: string) {
    const config = await this.prisma.farmProductPreference.findFirst({
      where: {
        id: configId,
        farmId,
      },
      include: {
        product: {
          select: { id: true, nameFr: true },
        },
      },
    });

    if (!config) {
      throw new EntityNotFoundException(
        ERROR_CODES.ENTITY_NOT_FOUND,
        `Product config with ID "${configId}" not found in farm "${farmId}"`,
        { configId, farmId },
      );
    }

    return config;
  }

  /**
   * Créer un nouveau lot de médicament pour une config produit
   */
  async create(farmId: string, configId: string, dto: CreateFarmerProductLotDto) {
    // Vérifier que la config existe et appartient à la ferme
    await this.verifyConfig(farmId, configId);

    // Vérifier l'unicité du numéro de lot officiel pour cette config
    const existingLot = await this.prisma.farmerProductLot.findFirst({
      where: {
        configId,
        officialLotNumber: dto.officialLotNumber,
        deletedAt: null,
      },
    });

    if (existingLot) {
      throw new EntityConflictException(
        ERROR_CODES.ENTITY_ALREADY_EXISTS,
        `A lot with official number "${dto.officialLotNumber}" already exists for this product config`,
        { configId, officialLotNumber: dto.officialLotNumber },
      );
    }

    // Valider que la date d'expiration est dans le futur (pour création)
    const expiryDate = new Date(dto.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      throw new BadRequestException(
        'Expiry date must be in the future for new lots',
      );
    }

    // Set currentStock to initialQuantity if provided
    const currentStock = dto.initialQuantity ?? null;

    const lot = await this.prisma.farmerProductLot.create({
      data: {
        configId,
        nickname: dto.nickname,
        officialLotNumber: dto.officialLotNumber,
        expiryDate: expiryDate,
        isActive: dto.isActive ?? true,
        // Stock management fields
        initialQuantity: dto.initialQuantity ?? null,
        currentStock,
        stockUnit: dto.stockUnit ?? null,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
        purchasePrice: dto.purchasePrice ?? null,
        supplier: dto.supplier ?? null,
      },
      include: {
        config: {
          include: {
            product: {
              select: { id: true, nameFr: true, commercialName: true },
            },
          },
        },
      },
    });

    this.logger.audit('Farmer product lot created', {
      lotId: lot.id,
      configId,
      farmId,
      officialLotNumber: dto.officialLotNumber,
      hasStockManagement: !!dto.initialQuantity,
    });

    return lot;
  }

  /**
   * Liste paginée des lots d'une config produit
   */
  async findAll(farmId: string, configId: string, query: QueryFarmerProductLotDto) {
    // Vérifier que la config existe et appartient à la ferme
    await this.verifyConfig(farmId, configId);

    const { isActive, excludeExpired, page = 1, limit = 50 } = query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
      configId,
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(excludeExpired && { expiryDate: { gte: today } }),
    };

    const [lots, total] = await Promise.all([
      this.prisma.farmerProductLot.findMany({
        where,
        orderBy: [{ isActive: 'desc' }, { expiryDate: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.farmerProductLot.count({ where }),
    ]);

    return {
      data: lots,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupérer uniquement les lots actifs et non périmés
   */
  async findActive(farmId: string, configId: string) {
    // Vérifier que la config existe et appartient à la ferme
    await this.verifyConfig(farmId, configId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.farmerProductLot.findMany({
      where: {
        configId,
        isActive: true,
        expiryDate: { gte: today },
        deletedAt: null,
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  /**
   * Récupérer un lot par ID
   */
  async findOne(farmId: string, configId: string, id: string) {
    // Vérifier que la config existe et appartient à la ferme
    await this.verifyConfig(farmId, configId);

    const lot = await this.prisma.farmerProductLot.findFirst({
      where: {
        id,
        configId,
        deletedAt: null,
      },
      include: {
        config: {
          include: {
            product: {
              select: { id: true, nameFr: true, commercialName: true },
            },
          },
        },
        treatments: {
          where: { deletedAt: null },
          take: 10,
          orderBy: { treatmentDate: 'desc' },
          select: {
            id: true,
            treatmentDate: true,
            animalId: true,
          },
        },
      },
    });

    if (!lot) {
      throw new EntityNotFoundException(
        ERROR_CODES.ENTITY_NOT_FOUND,
        `Lot with ID "${id}" not found`,
        { id, configId, farmId },
      );
    }

    return lot;
  }

  /**
   * Mettre à jour un lot
   */
  async update(farmId: string, configId: string, id: string, dto: UpdateFarmerProductLotDto) {
    // Vérifier que le lot existe
    const lot = await this.findOne(farmId, configId, id);

    // Si le numéro de lot officiel change, vérifier l'unicité
    if (dto.officialLotNumber && dto.officialLotNumber !== lot.officialLotNumber) {
      const existingLot = await this.prisma.farmerProductLot.findFirst({
        where: {
          configId,
          officialLotNumber: dto.officialLotNumber,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existingLot) {
        throw new EntityConflictException(
          ERROR_CODES.ENTITY_ALREADY_EXISTS,
          `A lot with official number "${dto.officialLotNumber}" already exists for this product config`,
          { configId, officialLotNumber: dto.officialLotNumber },
        );
      }
    }

    const updated = await this.prisma.farmerProductLot.update({
      where: { id },
      data: {
        ...(dto.nickname !== undefined && { nickname: dto.nickname }),
        ...(dto.officialLotNumber !== undefined && { officialLotNumber: dto.officialLotNumber }),
        ...(dto.expiryDate !== undefined && { expiryDate: new Date(dto.expiryDate) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        // Stock management fields
        ...(dto.initialQuantity !== undefined && { initialQuantity: dto.initialQuantity }),
        ...(dto.stockUnit !== undefined && { stockUnit: dto.stockUnit }),
        ...(dto.purchaseDate !== undefined && { purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null }),
        ...(dto.purchasePrice !== undefined && { purchasePrice: dto.purchasePrice }),
        ...(dto.supplier !== undefined && { supplier: dto.supplier }),
      },
      include: {
        config: {
          include: {
            product: {
              select: { id: true, nameFr: true, commercialName: true },
            },
          },
        },
      },
    });

    this.logger.audit('Farmer product lot updated', { lotId: id, farmId, configId });
    return updated;
  }

  /**
   * Activer un lot
   */
  async activate(farmId: string, configId: string, id: string) {
    // Vérifier que le lot existe
    await this.findOne(farmId, configId, id);

    return this.prisma.farmerProductLot.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Désactiver un lot
   */
  async deactivate(farmId: string, configId: string, id: string) {
    // Vérifier que le lot existe
    await this.findOne(farmId, configId, id);

    return this.prisma.farmerProductLot.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Supprimer un lot (soft delete)
   */
  async remove(farmId: string, configId: string, id: string) {
    // Vérifier que le lot existe
    await this.findOne(farmId, configId, id);

    return this.prisma.farmerProductLot.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Récupérer les lots proches de la péremption (pour alertes)
   * @param daysThreshold Nombre de jours avant péremption (default 7)
   */
  async findExpiringLots(farmId: string, daysThreshold: number = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thresholdDate = new Date(today);
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return this.prisma.farmerProductLot.findMany({
      where: {
        config: {
          farmId,
        },
        isActive: true,
        deletedAt: null,
        expiryDate: {
          gte: today,
          lte: thresholdDate,
        },
      },
      include: {
        config: {
          include: {
            product: {
              select: { id: true, nameFr: true, commercialName: true },
            },
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  /**
   * Récupérer les lots déjà périmés
   */
  async findExpiredLots(farmId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.farmerProductLot.findMany({
      where: {
        config: {
          farmId,
        },
        isActive: true,
        deletedAt: null,
        expiryDate: {
          lt: today,
        },
      },
      include: {
        config: {
          include: {
            product: {
              select: { id: true, nameFr: true, commercialName: true },
            },
          },
        },
      },
      orderBy: { expiryDate: 'desc' },
    });
  }

  /**
   * Ajuster le stock d'un lot (correction manuelle)
   * PUT /api/v1/farms/:farmId/product-configs/:configId/lots/:id/adjust-stock
   */
  async adjustStock(farmId: string, configId: string, id: string, dto: AdjustStockDto) {
    this.logger.debug(`Adjusting stock for lot ${id}`, dto);

    // Vérifier que le lot existe
    const lot = await this.findOne(farmId, configId, id);

    // Vérifier que le lot a un stock initialisé
    if (lot.currentStock === null && dto.type !== StockAdjustmentType.CORRECTION) {
      throw new BadRequestException(
        'Cannot adjust stock on a lot without stock management. Use "correction" type to initialize stock.',
      );
    }

    let newStock: number;
    const previousStock = lot.currentStock ?? 0;

    switch (dto.type) {
      case StockAdjustmentType.ADD:
        newStock = previousStock + dto.quantity;
        break;
      case StockAdjustmentType.REMOVE:
        newStock = previousStock - dto.quantity;
        if (newStock < 0) {
          throw new BadRequestException(
            `Cannot remove ${dto.quantity} from stock. Current stock is ${previousStock}.`,
          );
        }
        break;
      case StockAdjustmentType.CORRECTION:
        newStock = dto.quantity;
        break;
      default:
        throw new BadRequestException(`Invalid adjustment type: ${dto.type}`);
    }

    const updated = await this.prisma.farmerProductLot.update({
      where: { id },
      data: {
        currentStock: newStock,
        // If this is first stock initialization, also set initialQuantity
        ...(lot.initialQuantity === null && { initialQuantity: newStock }),
        version: lot.version + 1,
      },
      include: {
        config: {
          include: {
            product: {
              select: { id: true, nameFr: true, commercialName: true },
            },
          },
        },
      },
    });

    this.logger.audit('Stock adjusted', {
      lotId: id,
      farmId,
      configId,
      type: dto.type,
      quantity: dto.quantity,
      previousStock,
      newStock,
      reason: dto.reason,
    });

    return {
      success: true,
      data: {
        lot: updated,
        adjustment: {
          type: dto.type,
          quantity: dto.quantity,
          previousStock,
          newStock,
          reason: dto.reason,
        },
      },
    };
  }

  /**
   * Décrémenter le stock automatiquement (appelé lors de la création d'un traitement)
   * @internal
   */
  async decrementStock(lotId: string, quantity: number, treatmentId: string) {
    const lot = await this.prisma.farmerProductLot.findUnique({
      where: { id: lotId },
    });

    if (!lot || lot.currentStock === null) {
      // Stock management not enabled for this lot, skip
      return null;
    }

    const newStock = lot.currentStock - quantity;

    if (newStock < 0) {
      this.logger.debug(`Stock would go negative for lot ${lotId}, skipping decrement`);
      return null;
    }

    const updated = await this.prisma.farmerProductLot.update({
      where: { id: lotId },
      data: {
        currentStock: newStock,
        version: lot.version + 1,
      },
    });

    this.logger.audit('Stock auto-decremented', {
      lotId,
      treatmentId,
      quantity,
      previousStock: lot.currentStock,
      newStock,
    });

    return updated;
  }
}
