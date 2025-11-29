import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ContraindicationCheckDto,
  WithdrawalCheckDto,
  ActiveWithdrawalDto,
  ExpiringLotsResponseDto,
  ExpiringLotDto,
} from './dto';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class TreatmentAlertsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Vérifier si un animal a une contre-indication pour un produit
   * Actuellement vérifie uniquement la gestation, mais extensible
   */
  async checkContraindication(
    farmId: string,
    animalId: string,
    productId: string,
  ): Promise<ContraindicationCheckDto> {
    // Vérifier que l'animal existe et appartient à la ferme
    const animal = await this.prisma.animal.findFirst({
      where: {
        id: animalId,
        farmId,
        deletedAt: null,
      },
    });

    if (!animal) {
      throw new EntityNotFoundException(
        ERROR_CODES.ANIMAL_NOT_FOUND,
        `Animal with ID "${animalId}" not found in farm "${farmId}"`,
        { animalId, farmId },
      );
    }

    // Vérifier que le produit existe
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new EntityNotFoundException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        `Product with ID "${productId}" not found`,
        { productId },
      );
    }

    // Vérifier si l'animal a une gestation active
    const activeGestation = await this.prisma.animalStatusHistory.findFirst({
      where: {
        animalId,
        statusType: 'GESTATION',
        endDate: null,
        deletedAt: null,
      },
    });

    // TODO: À l'avenir, vérifier aussi le champ contraindicatedInGestation sur le produit
    // Pour l'instant, on signale simplement la gestation comme alerte non-bloquante
    if (activeGestation) {
      return {
        animalId,
        productId,
        hasContraindication: true,
        contraindicationType: 'GESTATION',
        message: `Animal en gestation depuis le ${activeGestation.startDate.toISOString().split('T')[0]} - Vérifiez la compatibilité du produit`,
        gestationStartDate: activeGestation.startDate,
      };
    }

    return {
      animalId,
      productId,
      hasContraindication: false,
    };
  }

  /**
   * Vérifier les délais d'attente actifs pour un animal
   */
  async checkWithdrawal(
    farmId: string,
    animalId: string,
  ): Promise<WithdrawalCheckDto> {
    // Vérifier que l'animal existe et appartient à la ferme
    const animal = await this.prisma.animal.findFirst({
      where: {
        id: animalId,
        farmId,
        deletedAt: null,
      },
    });

    if (!animal) {
      throw new EntityNotFoundException(
        ERROR_CODES.ANIMAL_NOT_FOUND,
        `Animal with ID "${animalId}" not found in farm "${farmId}"`,
        { animalId, farmId },
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Récupérer les traitements avec des délais d'attente encore actifs
    const treatments = await this.prisma.treatment.findMany({
      where: {
        animalId,
        farmId,
        deletedAt: null,
        OR: [
          { computedWithdrawalMeatDate: { gte: today } },
          { computedWithdrawalMilkDate: { gte: today } },
          { withdrawalEndDate: { gte: today } },
        ],
      },
      include: {
        product: {
          select: { nameFr: true, commercialName: true },
        },
      },
      orderBy: { treatmentDate: 'desc' },
    });

    const activeWithdrawals: ActiveWithdrawalDto[] = treatments.map((t) => {
      const meatEndDate = t.computedWithdrawalMeatDate;
      const milkEndDate = t.computedWithdrawalMilkDate;

      // Calcul des jours restants
      const meatDaysRemaining = meatEndDate
        ? Math.max(0, Math.ceil((meatEndDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)))
        : 0;

      const milkDaysRemaining = milkEndDate
        ? Math.max(0, Math.ceil((milkEndDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)))
        : 0;

      return {
        treatmentId: t.id,
        treatmentDate: t.treatmentDate,
        productName: t.product?.commercialName || t.product?.nameFr || t.productName,
        meatWithdrawalEndDate: meatEndDate || undefined,
        milkWithdrawalEndDate: milkEndDate || undefined,
        meatDaysRemaining,
        milkDaysRemaining,
      };
    });

    return {
      animalId,
      hasActiveWithdrawal: activeWithdrawals.length > 0,
      activeWithdrawals,
    };
  }

  /**
   * Récupérer les lots proches de la péremption et les lots déjà périmés
   */
  async getExpiringLots(
    farmId: string,
    daysThreshold: number = 30,
  ): Promise<ExpiringLotsResponseDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thresholdDate = new Date(today);
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    // Lots proches de la péremption (dans le seuil, mais pas encore périmés)
    const expiringLots = await this.prisma.farmerProductLot.findMany({
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

    // Lots déjà périmés (mais toujours actifs)
    const expiredLots = await this.prisma.farmerProductLot.findMany({
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

    const mapLotToDto = (lot: any, isExpired: boolean): ExpiringLotDto => {
      const daysUntilExpiry = Math.ceil(
        (lot.expiryDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
      );

      return {
        lotId: lot.id,
        nickname: lot.nickname,
        officialLotNumber: lot.officialLotNumber,
        expiryDate: lot.expiryDate,
        daysUntilExpiry: Math.max(0, daysUntilExpiry),
        isExpired,
        productName:
          lot.config.product?.commercialName ||
          lot.config.product?.nameFr ||
          'Produit inconnu',
        productId: lot.config.product?.id || lot.config.productId,
      };
    };

    const expiring = expiringLots.map((lot) => mapLotToDto(lot, false));
    const expired = expiredLots.map((lot) => mapLotToDto(lot, true));

    return {
      expiring,
      expired,
      totalAlerts: expiring.length + expired.length,
    };
  }
}
