import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, DataScope, ProductType } from '@prisma/client';
import { CreateProductDto, CreateGlobalProductDto, UpdateProductDto, QueryProductDto, ProductResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

export interface FindAllOptions {
  search?: string;
  scope?: 'global' | 'local' | 'all';
  type?: ProductType;
  isActive?: boolean;
  vaccinesOnly?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse {
  data: ProductResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Service for managing Products (PHASE_15 - Scope Pattern)
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
  async create(farmId: string, dto: CreateProductDto): Promise<ProductResponseDto> {
    this.logger.debug(`Creating local product in farm ${farmId}`);

    try {
      const product = await this.prisma.product.create({
        data: {
          ...(dto.id && { id: dto.id }),
          scope: DataScope.local,
          farmId,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn || null,
          nameAr: dto.nameAr || null,
          commercialName: dto.commercialName || null,
          description: dto.description || null,
          type: dto.type || null,
          atcVetCode: dto.atcVetCode || null,
          manufacturer: dto.manufacturer || null,
          form: dto.form || null,
          targetDisease: dto.targetDisease || null,
          immunityDurationDays: dto.immunityDurationDays || null,
          notes: dto.notes || null,
          isActive: dto.isActive ?? true,
          ...(dto.created_at && { createdAt: new Date(dto.created_at) }),
          ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
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
  async createGlobal(dto: CreateGlobalProductDto): Promise<ProductResponseDto> {
    this.logger.debug(`Creating global product with code ${dto.code}`);

    // Check if a soft-deleted product with this code exists
    const existingDeleted = await this.prisma.product.findUnique({
      where: { code: dto.code },
    });

    if (existingDeleted && existingDeleted.deletedAt) {
      this.logger.debug(`Restoring soft-deleted product with code ${dto.code}`);

      const restored = await this.prisma.product.update({
        where: { code: dto.code },
        data: {
          deletedAt: null,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn || null,
          nameAr: dto.nameAr || null,
          commercialName: dto.commercialName || null,
          description: dto.description || null,
          type: dto.type || null,
          atcVetCode: dto.atcVetCode || null,
          manufacturer: dto.manufacturer || null,
          form: dto.form || null,
          targetDisease: dto.targetDisease || null,
          immunityDurationDays: dto.immunityDurationDays || null,
          notes: dto.notes || null,
          isActive: dto.isActive ?? true,
          version: existingDeleted.version + 1,
        },
      });

      this.logger.audit('Product restored from soft delete', {
        productId: restored.id,
        code: dto.code,
        scope: 'global',
      });

      return restored;
    }

    try {
      const product = await this.prisma.product.create({
        data: {
          ...(dto.id && { id: dto.id }),
          scope: DataScope.global,
          farmId: null,
          code: dto.code,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn || null,
          nameAr: dto.nameAr || null,
          commercialName: dto.commercialName || null,
          description: dto.description || null,
          type: dto.type || null,
          atcVetCode: dto.atcVetCode || null,
          manufacturer: dto.manufacturer || null,
          form: dto.form || null,
          targetDisease: dto.targetDisease || null,
          immunityDurationDays: dto.immunityDurationDays || null,
          notes: dto.notes || null,
          isActive: dto.isActive ?? true,
          ...(dto.created_at && { createdAt: new Date(dto.created_at) }),
          ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
        },
      });

      this.logger.audit('Product created', { productId: product.id, code: dto.code, scope: 'global' });
      return product;
    } catch (error) {
      this.logger.error(`Failed to create global product ${dto.code}`, error.stack);
      throw error;
    }
  }

  /**
   * Find all products for a farm with filters, search, and pagination
   * Returns global products + farm's local products
   */
  async findAll(farmId: string, query: QueryProductDto): Promise<PaginatedResponse> {
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
    const where: Prisma.ProductWhereInput = { deletedAt: null };

    // Scope filtering
    if (scope === 'global') {
      where.scope = DataScope.global;
    } else if (scope === 'local') {
      where.scope = DataScope.local;
      where.farmId = farmId;
    } else {
      // 'all' - return global + farm's local products
      where.OR = [
        { scope: DataScope.global },
        { scope: DataScope.local, farmId },
      ];
    }

    // Other filters
    if (type) where.type = type;
    if (vaccinesOnly) where.type = ProductType.vaccine;
    if (isActive !== undefined) where.isActive = isActive;

    // Search in multiple fields
    if (search) {
      const searchCondition: Prisma.ProductWhereInput = {
        OR: [
          { nameFr: { contains: search, mode: 'insensitive' } },
          { nameEn: { contains: search, mode: 'insensitive' } },
          { commercialName: { contains: search, mode: 'insensitive' } },
        ],
      };

      // Combine search with existing filters
      if (where.OR) {
        // If we have scope OR, wrap everything in AND
        where.AND = [
          { OR: where.OR },
          searchCondition,
        ];
        delete where.OR;
      } else {
        // Otherwise, use the search OR directly
        where.OR = searchCondition.OR;
      }
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    this.logger.debug(`Found ${total} products for farm ${farmId} (page ${page}/${Math.ceil(total / limit)})`);

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
   * Find a single product by ID (scope-aware)
   * Returns global products or farm's local products
   */
  async findOne(farmId: string, id: string): Promise<ProductResponseDto> {
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
  async update(farmId: string, id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
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
      const updated = await this.prisma.product.update({
        where: { id },
        data: {
          nameFr: dto.nameFr !== undefined ? dto.nameFr : existing.nameFr,
          nameEn: dto.nameEn !== undefined ? dto.nameEn : existing.nameEn,
          nameAr: dto.nameAr !== undefined ? dto.nameAr : existing.nameAr,
          commercialName: dto.commercialName !== undefined ? dto.commercialName : existing.commercialName,
          description: dto.description !== undefined ? dto.description : existing.description,
          type: dto.type !== undefined ? dto.type : existing.type,
          atcVetCode: dto.atcVetCode !== undefined ? dto.atcVetCode : existing.atcVetCode,
          manufacturer: dto.manufacturer !== undefined ? dto.manufacturer : existing.manufacturer,
          form: dto.form !== undefined ? dto.form : existing.form,
          targetDisease: dto.targetDisease !== undefined ? dto.targetDisease : existing.targetDisease,
          immunityDurationDays: dto.immunityDurationDays !== undefined ? dto.immunityDurationDays : existing.immunityDurationDays,
          notes: dto.notes !== undefined ? dto.notes : existing.notes,
          isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
          version: existing.version + 1,
          ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
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
  async remove(farmId: string, id: string): Promise<ProductResponseDto> {
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

    // Check dependencies before deleting
    const lotsCount = await this.prisma.farmerProductLot.count({
      where: {
        deletedAt: null,
        config: {
          productId: id,
        },
      },
    });

    if (lotsCount > 0) {
      throw new ConflictException(
        `Cannot delete product: ${lotsCount} lot(s) depend on it`,
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

  /**
   * Restore a soft-deleted product (farm-scoped)
   * Only local products owned by the farm can be restored
   */
  async restore(farmId: string, id: string): Promise<ProductResponseDto> {
    this.logger.debug(`Restoring product ${id}`);

    const product = await this.prisma.product.findFirst({
      where: {
        id,
        scope: DataScope.local,
        farmId,
      },
    });

    if (!product) {
      throw new EntityNotFoundException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        `Product ${id} not found`,
        { productId: id, farmId },
      );
    }

    if (!product.deletedAt) {
      throw new ConflictException(`Product \"${product.nameFr}\" is not deleted`);
    }

    const restored = await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: null,
        version: product.version + 1,
      },
      include: {
        category: true,
        substance: true,
      },
    });

    this.logger.audit('Product restored', { productId: id, farmId });
    return restored;
  }

  // =============================================================================
  // Additional methods
  // =============================================================================

  /**
   * Find vaccines only (type = vaccine)
   */
  async findVaccines(farmId: string, query: QueryProductDto): Promise<PaginatedResponse> {
    return this.findAll(farmId, { ...query, vaccinesOnly: true });
  }

  /**
   * Find products by type
   */
  async findByType(farmId: string, type: ProductType): Promise<ProductResponseDto[]> {
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

  // =============================================================================
  // Global endpoints (no farm scope required)
  // =============================================================================

  /**
   * Find all global products (no farm scope required)
   * Returns only global products (scope='global')
   */
  async findAllGlobal(query: QueryProductDto): Promise<PaginatedResponse> {
    const {
      search,
      type,
      categoryId,
      isActive,
      vaccinesOnly,
      page = 1,
      limit = 50,
      sort = 'nameFr',
      order = 'asc',
    } = query;

    // Build where clause for global products only
    const where: Prisma.ProductWhereInput = {
      scope: DataScope.global,
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
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    this.logger.debug(`Found ${total} global products (page ${page}/${Math.ceil(total / limit)})`);

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
   * Find a global product by ID (no farm scope required)
   */
  async findOneGlobal(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        scope: DataScope.global,
        deletedAt: null,
      },
      include: {
        category: true,
        substance: true,
      },
    });

    if (!product) {
      this.logger.warn('Global product not found', { productId: id });
      throw new EntityNotFoundException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        `Product ${id} not found`,
        { productId: id },
      );
    }

    return product;
  }

  /**
   * Search global products by name (autocomplete, no farm scope required)
   */
  async searchGlobal(term: string, limit = 10) {
    return this.prisma.product.findMany({
      where: {
        scope: DataScope.global,
        deletedAt: null,
        isActive: true,
        OR: [
          { nameFr: { contains: term, mode: 'insensitive' } },
          { nameEn: { contains: term, mode: 'insensitive' } },
          { commercialName: { contains: term, mode: 'insensitive' } },
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

  /**
   * Restore a soft-deleted global product (admin only)
   */
  async restoreGlobal(id: string): Promise<ProductResponseDto> {
    this.logger.debug(`Restoring global product ${id}`);

    const product = await this.prisma.product.findFirst({
      where: {
        id,
        scope: DataScope.global,
      },
    });

    if (!product) {
      throw new EntityNotFoundException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        `Product ${id} not found`,
        { productId: id },
      );
    }

    if (!product.deletedAt) {
      throw new ConflictException(`Product \"${product.nameFr}\" is not deleted`);
    }

    const restored = await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: null,
        version: product.version + 1,
      },
      include: {
        category: true,
        substance: true,
      },
    });

    this.logger.audit('Global product restored', { productId: id, code: product.code });
    return restored;
  }
}
