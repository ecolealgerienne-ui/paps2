import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalProductDto, UpdateMedicalProductDto, QueryMedicalProductDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';
import { DataScope, Prisma } from '@prisma/client';

@Injectable()
export class MedicalProductsService {
  private readonly logger = new AppLogger(MedicalProductsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a local medical product for a farm
   * Local products have scope='local' and farmId set
   */
  async create(farmId: string, dto: CreateMedicalProductDto) {
    this.logger.debug(`Creating local medical product in farm ${farmId}`);

    try {
      const product = await this.prisma.medicalProduct.create({
        data: {
          ...dto,
          scope: DataScope.local,
          farmId,
        },
      });

      this.logger.audit('Medical product created', { medicalProductId: product.id, farmId, scope: 'local' });
      return product;
    } catch (error) {
      this.logger.error(`Failed to create medical product in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  /**
   * Find all medical products accessible to a farm
   * Returns global products + farm's local products
   * Supports filtering by scope (global, local, all)
   */
  async findAll(farmId: string, query: QueryMedicalProductDto) {
    const {
      search,
      scope = 'all',
      category,
      type,
      isActive,
      page = 1,
      limit = 50,
      sort = 'nameFr',
      order = 'asc',
    } = query;

    // Build scope filter
    let scopeFilter: Prisma.MedicalProductWhereInput;
    if (scope === 'global') {
      scopeFilter = { scope: DataScope.global };
    } else if (scope === 'local') {
      scopeFilter = { scope: DataScope.local, farmId };
    } else {
      // 'all' - return global + farm's local products
      scopeFilter = {
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
      };
    }

    // Build complete where clause
    const where: Prisma.MedicalProductWhereInput = {
      ...scopeFilter,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { nameFr: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { commercialName: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = category;
    }
    if (type) {
      where.type = type;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.medicalProduct.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      this.prisma.medicalProduct.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a medical product by ID
   * Returns global products or farm's local products
   */
  async findOne(farmId: string, id: string) {
    const product = await this.prisma.medicalProduct.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
      },
    });

    if (!product) {
      this.logger.warn('Medical product not found', { medicalProductId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.MEDICAL_PRODUCT_NOT_FOUND,
        `Medical product ${id} not found`,
        { medicalProductId: id, farmId },
      );
    }

    return product;
  }

  /**
   * Update a medical product
   * Only local products owned by the farm can be updated
   * Global products are read-only for farmers
   */
  async update(farmId: string, id: string, dto: UpdateMedicalProductDto) {
    this.logger.debug(`Updating medical product ${id}`);

    const existing = await this.prisma.medicalProduct.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Medical product not found', { medicalProductId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.MEDICAL_PRODUCT_NOT_FOUND,
        `Medical product ${id} not found`,
        { medicalProductId: id, farmId },
      );
    }

    // Check if this is a global product (read-only for farmers)
    if (existing.scope === DataScope.global) {
      this.logger.warn('Cannot update global medical product', { medicalProductId: id, farmId });
      throw new ForbiddenException('Global medical products cannot be modified');
    }

    // Check if this local product belongs to the farm
    if (existing.farmId !== farmId) {
      this.logger.warn('Medical product belongs to another farm', { medicalProductId: id, farmId, ownerFarmId: existing.farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.MEDICAL_PRODUCT_NOT_FOUND,
        `Medical product ${id} not found`,
        { medicalProductId: id, farmId },
      );
    }

    try {
      const updated = await this.prisma.medicalProduct.update({
        where: { id },
        data: {
          ...dto,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Medical product updated', { medicalProductId: id, farmId });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update medical product ${id}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete a medical product
   * Only local products owned by the farm can be deleted
   * Global products cannot be deleted by farmers
   */
  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting medical product ${id}`);

    const existing = await this.prisma.medicalProduct.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Medical product not found', { medicalProductId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.MEDICAL_PRODUCT_NOT_FOUND,
        `Medical product ${id} not found`,
        { medicalProductId: id, farmId },
      );
    }

    // Check if this is a global product (cannot be deleted by farmers)
    if (existing.scope === DataScope.global) {
      this.logger.warn('Cannot delete global medical product', { medicalProductId: id, farmId });
      throw new ForbiddenException('Global medical products cannot be deleted');
    }

    // Check if this local product belongs to the farm
    if (existing.farmId !== farmId) {
      this.logger.warn('Medical product belongs to another farm', { medicalProductId: id, farmId, ownerFarmId: existing.farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.MEDICAL_PRODUCT_NOT_FOUND,
        `Medical product ${id} not found`,
        { medicalProductId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.medicalProduct.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Medical product soft deleted', { medicalProductId: id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete medical product ${id}`, error.stack);
      throw error;
    }
  }
}
