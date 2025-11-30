import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductCategoryDto, UpdateProductCategoryDto } from './dto';
import { ProductCategoryResponseDto } from './dto/product-category-response.dto';
import { AppLogger } from '../common/utils/logger.service';

export interface FindAllOptions {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse {
  data: ProductCategoryResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Service for managing product categories reference data
 * PHASE_02: Added pagination, restore, search, dependency check, proper typing
 */
@Injectable()
export class ProductCategoriesService {
  private readonly logger = new AppLogger(ProductCategoriesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new product category
   * @param dto - Category creation data
   * @returns Created category
   */
  async create(dto: CreateProductCategoryDto): Promise<ProductCategoryResponseDto> {
    this.logger.debug(`Creating product category with code ${dto.code}`);

    const existing = await this.prisma.productCategory.findUnique({
      where: { code: dto.code },
    });

    if (existing && !existing.deletedAt) {
      this.logger.warn(`Duplicate code attempt: ${dto.code}`);
      throw new ConflictException(`Product category with code "${dto.code}" already exists`);
    }

    if (existing && existing.deletedAt) {
      this.logger.debug(`Restoring soft-deleted category: ${dto.code}`);
      const restored = await this.prisma.productCategory.update({
        where: { id: existing.id },
        data: {
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          description: dto.description || null,
          displayOrder: dto.displayOrder ?? 0,
          isActive: dto.isActive ?? true,
          deletedAt: null,
          version: existing.version + 1,
        },
      });
      this.logger.audit('Product category restored', { categoryId: restored.id, code: dto.code });
      return restored;
    }

    const category = await this.prisma.productCategory.create({
      data: {
        code: dto.code,
        nameFr: dto.nameFr,
        nameEn: dto.nameEn,
        nameAr: dto.nameAr,
        description: dto.description || null,
        displayOrder: dto.displayOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });

    this.logger.audit('Product category created', { categoryId: category.id, code: dto.code });
    return category;
  }

  /**
   * Get all product categories with pagination, search, and sorting
   * @param options - Query options
   * @returns Paginated categories list
   */
  async findAll(options: FindAllOptions = {}): Promise<PaginatedResponse> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductCategoryWhereInput = { deletedAt: null };

    if (options.isActive !== undefined) where.isActive = options.isActive;

    // Search in 4 fields
    if (options.search) {
      const searchTerm = options.search;
      where.OR = [
        { code: { contains: searchTerm, mode: 'insensitive' } },
        { nameFr: { contains: searchTerm, mode: 'insensitive' } },
        { nameEn: { contains: searchTerm, mode: 'insensitive' } },
        { nameAr: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.buildOrderBy(options.orderBy, options.order);

    const [total, data] = await Promise.all([
      this.prisma.productCategory.count({ where }),
      this.prisma.productCategory.findMany({ where, orderBy, skip, take: limit }),
    ]);

    this.logger.debug(`Found ${total} product categories (page ${page}/${Math.ceil(total / limit)})`);

    return {
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  private buildOrderBy(
    field?: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ): Prisma.ProductCategoryOrderByWithRelationInput[] {
    const allowedFields = ['nameFr', 'nameEn', 'code', 'displayOrder', 'createdAt'];

    if (field && allowedFields.includes(field)) {
      return [{ [field]: order.toLowerCase() as Prisma.SortOrder }];
    }

    // Default: sort by displayOrder, then nameFr
    return [{ displayOrder: 'asc' }, { nameFr: 'asc' }];
  }

  /**
   * Get a single product category by ID
   * @param id - Category ID
   * @returns Category or throws NotFoundException
   */
  async findOne(id: string): Promise<ProductCategoryResponseDto> {
    const category = await this.prisma.productCategory.findFirst({
      where: { id, deletedAt: null },
    });

    if (!category) {
      this.logger.warn(`Product category not found: ${id}`);
      throw new NotFoundException(`Product category with ID "${id}" not found`);
    }

    return category;
  }

  /**
   * Get a category by code
   * @param code - Category code
   * @returns Category or throws NotFoundException
   */
  async findByCode(code: string): Promise<ProductCategoryResponseDto> {
    const category = await this.prisma.productCategory.findFirst({
      where: { code, deletedAt: null },
    });

    if (!category) {
      this.logger.warn(`Product category not found by code: ${code}`);
      throw new NotFoundException(`Product category with code "${code}" not found`);
    }

    return category;
  }

  /**
   * Update a product category (with optimistic locking)
   * @param id - Category ID
   * @param dto - Update data
   * @returns Updated category
   */
  async update(id: string, dto: UpdateProductCategoryDto): Promise<ProductCategoryResponseDto> {
    this.logger.debug(`Updating product category ${id}`);

    const existing = await this.findOne(id);

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException(
        `Version conflict: expected ${dto.version}, found ${existing.version}`,
      );
    }

    const category = await this.prisma.productCategory.update({
      where: { id },
      data: {
        nameFr: dto.nameFr !== undefined ? dto.nameFr : existing.nameFr,
        nameEn: dto.nameEn !== undefined ? dto.nameEn : existing.nameEn,
        nameAr: dto.nameAr !== undefined ? dto.nameAr : existing.nameAr,
        description: dto.description !== undefined ? dto.description : existing.description,
        displayOrder: dto.displayOrder !== undefined ? dto.displayOrder : existing.displayOrder,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
        version: existing.version + 1,
      },
    });

    this.logger.audit('Product category updated', { categoryId: id, newVersion: category.version });
    return category;
  }

  /**
   * Soft delete a product category
   * @param id - Category ID
   * @returns Soft-deleted category
   */
  async remove(id: string): Promise<ProductCategoryResponseDto> {
    this.logger.debug(`Soft deleting product category ${id}`);

    const existing = await this.findOne(id);

    // Check if used by active products
    const usageCount = await this.prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete product category "${existing.code}": ${usageCount} active products depend on it`,
      );
    }

    const category = await this.prisma.productCategory.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });

    this.logger.audit('Product category soft deleted', { categoryId: id });
    return category;
  }

  /**
   * Restore a soft-deleted product category
   * @param id - Category ID
   * @returns Restored category
   */
  async restore(id: string): Promise<ProductCategoryResponseDto> {
    this.logger.debug(`Restoring product category ${id}`);

    const category = await this.prisma.productCategory.findUnique({
      where: { id },
    });

    if (!category) {
      this.logger.warn(`Product category not found for restore: ${id}`);
      throw new NotFoundException(`Product category with ID "${id}" not found`);
    }

    if (!category.deletedAt) {
      throw new ConflictException(`Product category "${category.code}" is not deleted`);
    }

    const restored = await this.prisma.productCategory.update({
      where: { id },
      data: {
        deletedAt: null,
        version: category.version + 1,
      },
    });

    this.logger.audit('Product category restored', { categoryId: id });
    return restored;
  }
}
