import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFarmProductPreferenceDto,
  UpdateFarmProductPreferenceDto,
  UpdateProductConfigDto,
  FarmProductPreferenceResponseDto,
} from './dto';
import { DataScope } from '../common/types/prisma-types';
import { AppLogger } from '../common/utils/logger.service';

@Injectable()
export class FarmProductPreferencesService {
  private readonly logger = new AppLogger(FarmProductPreferencesService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateFarmProductPreferenceDto): Promise<FarmProductPreferenceResponseDto> {
    this.logger.debug(`Creating product preference for farm ${farmId}`);

    // Verify farm exists
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    // Verify product exists and is accessible to this farm
    const product = await this.prisma.product.findFirst({
      where: {
        id: dto.productId,
        deletedAt: null,
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID "${dto.productId}" not found or not accessible to this farm`,
      );
    }

    // Check for existing preference (including soft-deleted)
    const existing = await this.prisma.farmProductPreference.findUnique({
      where: {
        farmId_productId: { farmId, productId: dto.productId },
      },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Restore if soft-deleted
        const restored = await this.prisma.farmProductPreference.update({
          where: { id: existing.id },
          data: {
            deletedAt: null,
            displayOrder: dto.displayOrder ?? existing.displayOrder,
            isActive: dto.isActive ?? true,
            version: existing.version + 1,
          },
          include: {
            product: true,
            farm: { select: { id: true, name: true } },
          },
        });
        this.logger.audit('Product preference restored', { preferenceId: existing.id, farmId });
        return restored;
      }
      throw new ConflictException(`Product preference already exists for this farm`);
    }

    // Auto-increment displayOrder if not provided
    let displayOrder = dto.displayOrder;
    if (displayOrder === undefined) {
      const maxOrder = await this.prisma.farmProductPreference.findFirst({
        where: { farmId, deletedAt: null },
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });
      displayOrder = (maxOrder?.displayOrder ?? -1) + 1;
    }

    const preference = await this.prisma.farmProductPreference.create({
      data: {
        farmId,
        productId: dto.productId,
        displayOrder,
        isActive: dto.isActive ?? true,
      },
      include: {
        product: true,
        farm: { select: { id: true, name: true } },
      },
    });

    this.logger.audit('Product preference created', { preferenceId: preference.id, farmId });
    return preference;
  }

  async findByFarm(farmId: string, includeInactive = false): Promise<FarmProductPreferenceResponseDto[]> {
    this.logger.debug(`Finding product preferences for farm ${farmId}`);

    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    const where: any = { farmId, deletedAt: null };
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.prisma.farmProductPreference.findMany({
      where,
      include: {
        product: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<FarmProductPreferenceResponseDto> {
    const preference = await this.prisma.farmProductPreference.findFirst({
      where: { id, deletedAt: null },
      include: {
        product: true,
        farm: { select: { id: true, name: true } },
      },
    });

    if (!preference) {
      throw new NotFoundException(`Farm product preference with ID "${id}" not found`);
    }

    return preference;
  }

  async update(id: string, dto: UpdateFarmProductPreferenceDto): Promise<FarmProductPreferenceResponseDto> {
    this.logger.debug(`Updating product preference ${id}`);

    const existing = await this.prisma.farmProductPreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm product preference with ID "${id}" not found`);
    }

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict: the preference has been modified by another user');
    }

    const updated = await this.prisma.farmProductPreference.update({
      where: { id },
      data: {
        displayOrder: dto.displayOrder ?? existing.displayOrder,
        isActive: dto.isActive ?? existing.isActive,
        version: existing.version + 1,
      },
      include: {
        product: true,
        farm: { select: { id: true, name: true } },
      },
    });

    this.logger.audit('Product preference updated', { preferenceId: id });
    return updated;
  }

  async remove(id: string): Promise<FarmProductPreferenceResponseDto> {
    this.logger.debug(`Soft deleting product preference ${id}`);

    const existing = await this.prisma.farmProductPreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm product preference with ID "${id}" not found`);
    }

    const deleted = await this.prisma.farmProductPreference.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
      include: {
        product: true,
      },
    });

    this.logger.audit('Product preference soft deleted', { preferenceId: id });
    return deleted;
  }

  async toggleActive(id: string, isActive: boolean): Promise<FarmProductPreferenceResponseDto> {
    this.logger.debug(`Toggling active status for preference ${id} to ${isActive}`);

    const existing = await this.prisma.farmProductPreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm product preference with ID "${id}" not found`);
    }

    const updated = await this.prisma.farmProductPreference.update({
      where: { id },
      data: {
        isActive,
        version: existing.version + 1,
      },
      include: {
        product: true,
      },
    });

    this.logger.audit('Product preference toggled', { preferenceId: id, isActive });
    return updated;
  }

  async reorder(farmId: string, orderedIds: string[]): Promise<FarmProductPreferenceResponseDto[]> {
    this.logger.debug(`Reordering product preferences for farm ${farmId}`);

    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    // Verify all preferences belong to this farm and are not deleted
    const preferences = await this.prisma.farmProductPreference.findMany({
      where: {
        id: { in: orderedIds },
        farmId,
        deletedAt: null,
      },
    });

    if (preferences.length !== orderedIds.length) {
      throw new BadRequestException(
        'Some preference IDs are invalid or do not belong to this farm',
      );
    }

    // Update order in transaction
    const updates = orderedIds.map((id, index) =>
      this.prisma.farmProductPreference.update({
        where: { id },
        data: { displayOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);

    this.logger.audit('Product preferences reordered', { farmId, count: orderedIds.length });
    return this.findByFarm(farmId, true);
  }

  async restore(id: string): Promise<FarmProductPreferenceResponseDto> {
    this.logger.debug(`Restoring product preference ${id}`);

    const existing = await this.prisma.farmProductPreference.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Farm product preference with ID "${id}" not found`);
    }

    if (!existing.deletedAt) {
      throw new ConflictException('This preference is not deleted');
    }

    const restored = await this.prisma.farmProductPreference.update({
      where: { id },
      data: {
        deletedAt: null,
        version: existing.version + 1,
      },
      include: {
        product: true,
        farm: { select: { id: true, name: true } },
      },
    });

    this.logger.audit('Product preference restored', { preferenceId: id });
    return restored;
  }

  /**
   * Récupérer la configuration personnalisée d'une préférence produit
   * Inclut packaging, lots et les champs userDefined*
   */
  async getConfig(farmId: string, id: string): Promise<FarmProductPreferenceResponseDto> {
    const preference = await this.prisma.farmProductPreference.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
      include: {
        product: true,
        packaging: true,
        lots: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!preference) {
      throw new NotFoundException(
        `Farm product preference with ID "${id}" not found in farm "${farmId}"`,
      );
    }

    return preference;
  }

  /**
   * Mettre à jour la configuration personnalisée d'une préférence produit
   * Permet de surcharger les valeurs AMM/RCP avec des valeurs éleveur
   */
  async updateConfig(farmId: string, id: string, dto: UpdateProductConfigDto): Promise<FarmProductPreferenceResponseDto> {
    this.logger.debug(`Updating product config for preference ${id}`);

    const existing = await this.prisma.farmProductPreference.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Farm product preference with ID "${id}" not found in farm "${farmId}"`,
      );
    }

    // Validation: si dose défini, unité obligatoire
    if (
      dto.userDefinedDose !== null &&
      dto.userDefinedDose !== undefined &&
      !dto.userDefinedDoseUnit
    ) {
      throw new BadRequestException('Dose unit is required when dose is defined');
    }

    // Vérifier que le packaging appartient au même produit si fourni
    if (dto.packagingId) {
      const packaging = await this.prisma.productPackaging.findFirst({
        where: {
          id: dto.packagingId,
          productId: existing.productId,
          deletedAt: null,
        },
      });

      if (!packaging) {
        throw new NotFoundException(
          `Packaging with ID "${dto.packagingId}" not found for this product`,
        );
      }
    }

    const updated = await this.prisma.farmProductPreference.update({
      where: { id },
      data: {
        ...(dto.packagingId !== undefined && { packagingId: dto.packagingId }),
        ...(dto.userDefinedDose !== undefined && { userDefinedDose: dto.userDefinedDose }),
        ...(dto.userDefinedDoseUnit !== undefined && { userDefinedDoseUnit: dto.userDefinedDoseUnit as any }),
        ...(dto.userDefinedMeatWithdrawal !== undefined && { userDefinedMeatWithdrawal: dto.userDefinedMeatWithdrawal }),
        ...(dto.userDefinedMilkWithdrawal !== undefined && { userDefinedMilkWithdrawal: dto.userDefinedMilkWithdrawal }),
        version: existing.version + 1,
      },
      include: {
        product: true,
        packaging: true,
        lots: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    this.logger.audit('Product config updated', { preferenceId: id, farmId });
    return updated;
  }

  /**
   * Réinitialiser la configuration personnalisée (remet tous les userDefined* à NULL)
   * Réinitialise également packagingId à NULL
   */
  async resetConfig(farmId: string, id: string): Promise<FarmProductPreferenceResponseDto> {
    this.logger.debug(`Resetting product config for preference ${id}`);

    const existing = await this.prisma.farmProductPreference.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Farm product preference with ID "${id}" not found in farm "${farmId}"`,
      );
    }

    const updated = await this.prisma.farmProductPreference.update({
      where: { id },
      data: {
        packagingId: null,
        userDefinedDose: null,
        userDefinedDoseUnit: null,
        userDefinedMeatWithdrawal: null,
        userDefinedMilkWithdrawal: null,
        version: existing.version + 1,
      },
      include: {
        product: true,
        packaging: true,
      },
    });

    this.logger.audit('Product config reset', { preferenceId: id, farmId });
    return updated;
  }
}
