import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductPackagingDto, UpdateProductPackagingDto, ProductPackagingResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

export interface FindAllOptions {
  page?: number;
  limit?: number;
  productId?: string;
  countryCode?: string;
  gtinEan?: string;
  isActive?: boolean;
  search?: string;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse {
  data: ProductPackagingResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Service for managing Product Packagings
 * Packagings are country-specific variations of products
 * (concentration, volume, GTIN, AMM authorization)
 */
@Injectable()
export class ProductPackagingsService {
  private readonly logger = new AppLogger(ProductPackagingsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a product packaging
   * @param dto - Packaging creation data
   * @returns Created packaging
   */
  async create(dto: CreateProductPackagingDto): Promise<ProductPackagingResponseDto> {
    this.logger.debug(`Creating packaging for product ${dto.productId} in country ${dto.countryCode}`);

    const packaging = await this.prisma.productPackaging.create({
      data: {
        productId: dto.productId,
        countryCode: dto.countryCode,
        concentration: dto.concentration,
        concentrationUnitId: dto.concentrationUnitId,
        volume: dto.volume || null,
        volumeUnitId: dto.volumeUnitId || null,
        packagingLabel: dto.packagingLabel,
        gtinEan: dto.gtinEan || null,
        numeroAMM: dto.numeroAMM || null,
        isActive: dto.isActive ?? true,
        ...(dto.created_at && { createdAt: new Date(dto.created_at) }),
        ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
      },
    });

    this.logger.audit('Product packaging created', {
      packagingId: packaging.id,
      productId: dto.productId,
      countryCode: dto.countryCode,
    });

    return packaging;
  }

  /**
   * Find all packagings with pagination, filters, search, and sorting
   * @param options - Query options
   * @returns Paginated packagings list
   */
  async findAll(options: FindAllOptions = {}): Promise<PaginatedResponse> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 50));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductPackagingWhereInput = { deletedAt: null };

    if (options.productId) where.productId = options.productId;
    if (options.countryCode) where.countryCode = options.countryCode;
    if (options.gtinEan) where.gtinEan = options.gtinEan;
    if (options.isActive !== undefined) where.isActive = options.isActive;

    // Search in packagingLabel, gtinEan, numeroAMM
    if (options.search) {
      const searchTerm = options.search;
      where.OR = [
        { packagingLabel: { contains: searchTerm, mode: 'insensitive' } },
        { gtinEan: { contains: searchTerm, mode: 'insensitive' } },
        { numeroAMM: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.buildOrderBy(options.orderBy, options.order);

    const [total, data] = await Promise.all([
      this.prisma.productPackaging.count({ where }),
      this.prisma.productPackaging.findMany({ where, orderBy, skip, take: limit }),
    ]);

    this.logger.debug(`Found ${total} packagings (page ${page}/${Math.ceil(total / limit)})`);

    return {
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  private buildOrderBy(
    field?: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ): Prisma.ProductPackagingOrderByWithRelationInput[] {
    const allowedFields = ['packagingLabel', 'countryCode', 'concentration', 'gtinEan', 'createdAt'];

    if (field && allowedFields.includes(field)) {
      return [{ [field]: order.toLowerCase() as Prisma.SortOrder }];
    }

    // Default: sort by packagingLabel
    return [{ packagingLabel: 'asc' }];
  }

  /**
   * Find packagings by product ID
   * @param productId - Product ID
   * @returns List of packagings for the product
   */
  async findByProduct(productId: string): Promise<ProductPackagingResponseDto[]> {
    return this.prisma.productPackaging.findMany({
      where: {
        productId,
        deletedAt: null,
      },
      orderBy: { countryCode: 'asc' },
    });
  }

  /**
   * Find packagings by country
   * @param countryCode - Country code
   * @returns List of active packagings in the country
   */
  async findByCountry(countryCode: string): Promise<ProductPackagingResponseDto[]> {
    return this.prisma.productPackaging.findMany({
      where: {
        countryCode,
        deletedAt: null,
        isActive: true,
      },
      orderBy: { packagingLabel: 'asc' },
    });
  }

  /**
   * Find packaging by GTIN/EAN (barcode scan)
   * @param gtinEan - GTIN/EAN barcode
   * @returns Packaging or throws NotFoundException
   */
  async findByGtin(gtinEan: string): Promise<ProductPackagingResponseDto> {
    const packaging = await this.prisma.productPackaging.findFirst({
      where: {
        gtinEan,
        deletedAt: null,
      },
    });

    if (!packaging) {
      this.logger.warn(`Packaging not found by GTIN: ${gtinEan}`);
      throw new NotFoundException(`Packaging with GTIN \"${gtinEan}\" not found`);
    }

    return packaging;
  }

  /**
   * Find a packaging by ID
   * @param id - Packaging ID
   * @returns Packaging or throws NotFoundException
   */
  async findOne(id: string): Promise<ProductPackagingResponseDto> {
    const packaging = await this.prisma.productPackaging.findFirst({
      where: { id, deletedAt: null },
    });

    if (!packaging) {
      this.logger.warn(`Packaging not found: ${id}`);
      throw new NotFoundException(`Packaging with ID \"${id}\" not found`);
    }

    return packaging;
  }

  /**
   * Update a packaging (with optimistic locking)
   * @param id - Packaging ID
   * @param dto - Update data
   * @returns Updated packaging
   */
  async update(id: string, dto: UpdateProductPackagingDto): Promise<ProductPackagingResponseDto> {
    this.logger.debug(`Updating packaging ${id}`);

    const existing = await this.findOne(id);

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException(
        `Version conflict: expected ${dto.version}, found ${existing.version}`,
      );
    }

    const packaging = await this.prisma.productPackaging.update({
      where: { id },
      data: {
        concentration: dto.concentration !== undefined ? dto.concentration : existing.concentration,
        concentrationUnitId: dto.concentrationUnitId !== undefined ? dto.concentrationUnitId : existing.concentrationUnitId,
        volume: dto.volume !== undefined ? dto.volume : existing.volume,
        volumeUnitId: dto.volumeUnitId !== undefined ? dto.volumeUnitId : existing.volumeUnitId,
        packagingLabel: dto.packagingLabel !== undefined ? dto.packagingLabel : existing.packagingLabel,
        gtinEan: dto.gtinEan !== undefined ? dto.gtinEan : existing.gtinEan,
        numeroAMM: dto.numeroAMM !== undefined ? dto.numeroAMM : existing.numeroAMM,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
        version: existing.version + 1,
        ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
      },
    });

    this.logger.audit('Product packaging updated', { packagingId: id, newVersion: packaging.version });
    return packaging;
  }

  /**
   * Soft delete a packaging
   * @param id - Packaging ID
   * @returns Soft-deleted packaging
   */
  async remove(id: string): Promise<ProductPackagingResponseDto> {
    this.logger.debug(`Soft deleting packaging ${id}`);

    const existing = await this.findOne(id);

    const packaging = await this.prisma.productPackaging.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });

    this.logger.audit('Product packaging soft deleted', { packagingId: id });
    return packaging;
  }

  /**
   * Restore a soft-deleted packaging
   * @param id - Packaging ID
   * @returns Restored packaging
   */
  async restore(id: string): Promise<ProductPackagingResponseDto> {
    this.logger.debug(`Restoring packaging ${id}`);

    const packaging = await this.prisma.productPackaging.findUnique({
      where: { id },
    });

    if (!packaging) {
      this.logger.warn(`Packaging not found for restore: ${id}`);
      throw new NotFoundException(`Packaging with ID \"${id}\" not found`);
    }

    if (!packaging.deletedAt) {
      throw new ConflictException(`Packaging \"${packaging.packagingLabel}\" is not deleted`);
    }

    const restored = await this.prisma.productPackaging.update({
      where: { id },
      data: {
        deletedAt: null,
        version: packaging.version + 1,
      },
    });

    this.logger.audit('Product packaging restored', { packagingId: id });
    return restored;
  }
}
