import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, CreateGlobalProductDto, UpdateProductDto, QueryProductDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';
import { DataScope, ProductType } from '../common/types/prisma-types';

// Type for Product where queries
type ProductWhereInput = {
  id?: string;
  scope?: DataScope;
  farmId?: string | null;
  type?: ProductType;
  categoryId?: string;
  deletedAt?: null | Date;
  isActive?: boolean;
  nameFr?: { contains: string; mode: 'insensitive' };
  nameEn?: { contains: string; mode: 'insensitive' };
  commercialName?: { contains: string; mode: 'insensitive' };
  OR?: ProductWhereInput[];
};

/**
 * Service for managing Products (Master Table Pattern)
 * Supports both global (admin) and local (farm-specific) products
 * Unified model replacing MedicalProduct + Vaccine
 */
@Injectable()
export class ProductsService {
  private readonly logger = new AppLogger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a local product for a farm
   * Local products have scope='local' and farmId set
   */
  async create(farmId: string, dto: CreateProductDto) {
    this.logger.debug(`Creating local product in farm ${farmId}`);

    try {
      const product = await this.prisma.product.create({
        data: {
          ...(dto.id && { id: dto.id }),
          scope: DataScope.local,
          farmId,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          commercialName: dto.commercialName,
          description: dto.description,
          type: dto.type,
          categoryId: dto.categoryId,
          substanceId: dto.substanceId,
          atcVetCode: dto.atcVetCode,
          manufacturer: dto.manufacturer,
          form: dto.form,
          targetDisease: dto.targetDisease,
          immunityDurationDays: dto.immunityDurationDays,
          notes: dto.notes,
          isActive: dto.isActive ?? true,
          ...(dto.created_at && { createdAt: new Date(dto.created_at) }),
          ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
        },
        include: {
          category: true,
          substance: true,
        },
      });

      this.logger.audit('Product created', { productId: product.id, farmId, scope: 'local' });
      return product;
    } catch (error) {
      this.logger.error(`Failed to create product in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a global product (admin only)
   * Global products have scope='global' and farmId=null
   */
  async createGlobal(dto: CreateGlobalProductDto) {
    this.logger.debug(`Creating global product with code ${dto.code}`);

    try {
      const product = await this.prisma.product.create({
        data: {
          ...(dto.id && { id: dto.id }),
          scope: DataScope.global,
          farmId: null,
          code: dto.code,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          commercialName: dto.commercialName,
          description: dto.description,
          type: dto.type,
          categoryId: dto.categoryId,
          substanceId: dto.substanceId,
          atcVetCode: dto.atcVetCode,
          manufacturer: dto.manufacturer,
          form: dto.form,
          targetDisease: dto.targetDisease,
          immunityDurationDays: dto.immunityDurationDays,
          notes: dto.notes,
          isActive: dto.isActive ?? true,
        },
        include: {
          category: true,
          substance: true,
        },
      });

      this.logger.audit('Global product created', { productId: product.id, code: dto.code });
      return product;
    } catch (error) {
      this.logger.error(`Failed to create global product ${dto.code}`, error.stack);
      throw error;
    }
  }

  /**
   * Find all products accessible to a farm
   * Returns global products + farm's local products
   */
  async findAll(farmId: string, query: QueryProductDto) {
    const {
      search,
      scope = 'all',
      type,
      categoryId,
      isActive,
      vaccinesOnly,
      page = 1,
      limit = 50,
      sort = 'nameFr',
      order = 'asc',
    } = query;

    // Build scope filter
    let scopeFilter: ProductWhereInput;
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
    const where: ProductWhereInput = {
      ...scopeFilter,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { nameFr: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { commercialName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) {
      where.type = type;
    }
    if (vaccinesOnly) {
      where.type = ProductType.vaccine;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: where as any,
        include: {
          category: true,
          substance: true,
          packagings: {
            where: { deletedAt: null },
            take: 5,
          },
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where: where as any }),
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
   * Find a product by ID
   * Returns global products or farm's local products
   */
  async findOne(farmId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
      },
      include: {
        category: true,
        substance: true,
        packagings: {
          where: { deletedAt: null },
          include: {
            concentrationUnit: true,
            volumeUnit: true,
            country: true,
          },
        },
        indications: {
          where: { deletedAt: null },
          include: {
            species: true,
            ageCategory: true,
            route: true,
          },
        },
      },
    });

    if (!product) {
      this.logger.warn('Product not found', { productId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        `Product ${id} not found`,
        { productId: id, farmId },
      );
    }

    return product;
  }

  /**
   * Update a product
   * Only local products owned by the farm can be updated
   * Global products are read-only for farmers
   */
  async update(farmId: string, id: string, dto: UpdateProductDto) {
    this.logger.debug(`Updating product ${id}`);

    const existing = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new EntityNotFoundException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        `Product ${id} not found`,
        { productId: id, farmId },
      );
    }

    // Check if this is a global product (read-only for farmers)
    if (existing.scope === DataScope.global) {
      this.logger.warn('Cannot update global product', { productId: id, farmId });
      throw new ForbiddenException('Global products cannot be modified');
    }

    // Check if this local product belongs to the farm
    if (existing.farmId !== farmId) {
      throw new EntityNotFoundException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        `Product ${id} not found`,
        { productId: id, farmId },
      );
    }

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException(
        'Version conflict: the product has been modified by another user',
      );
    }

    try {
      const { version, updated_at, ...updateData } = dto;

      const updated = await this.prisma.product.update({
        where: { id },
        data: {
          ...updateData,
          version: existing.version + 1,
          ...(updated_at && { updatedAt: new Date(updated_at) }),
        },
        include: {
          category: true,
          substance: true,
        },
      });

      this.logger.audit('Product updated', { productId: id, farmId });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update product ${id}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete a product
   * Only local products owned by the farm can be deleted
   */
  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting product ${id}`);

    const existing = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new EntityNotFoundException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        `Product ${id} not found`,
        { productId: id, farmId },
      );
    }

    if (existing.scope === DataScope.global) {
      throw new ForbiddenException('Global products cannot be deleted');
    }

    if (existing.farmId !== farmId) {
      throw new EntityNotFoundException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        `Product ${id} not found`,
        { productId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.product.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Product soft deleted', { productId: id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete product ${id}`, error.stack);
      throw error;
    }
  }

  // =============================================================================
  // Additional methods
  // =============================================================================

  /**
   * Find vaccines only (type = vaccine)
   */
  async findVaccines(farmId: string, query: QueryProductDto) {
    return this.findAll(farmId, { ...query, vaccinesOnly: true });
  }

  /**
   * Find products by type
   */
  async findByType(farmId: string, type: ProductType) {
    return this.prisma.product.findMany({
      where: {
        type,
        deletedAt: null,
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
      },
      include: {
        category: true,
        substance: true,
      },
      orderBy: { nameFr: 'asc' },
    });
  }

  /**
   * Search products by name (autocomplete)
   */
  async search(farmId: string, term: string, limit = 10) {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
        AND: [
          {
            OR: [
              { nameFr: { contains: term, mode: 'insensitive' } },
              { nameEn: { contains: term, mode: 'insensitive' } },
              { commercialName: { contains: term, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        nameFr: true,
        nameEn: true,
        commercialName: true,
        type: true,
        manufacturer: true,
      },
      take: limit,
      orderBy: { nameFr: 'asc' },
    });
  }
}
