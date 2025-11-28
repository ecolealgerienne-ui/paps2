import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductPackagingDto, UpdateProductPackagingDto, QueryProductPackagingDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

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
   */
  async create(dto: CreateProductPackagingDto) {
    this.logger.debug(`Creating packaging for product ${dto.productId} in country ${dto.countryCode}`);

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product ${dto.productId} not found`);
    }

    // Verify country exists
    const country = await this.prisma.country.findUnique({
      where: { code: dto.countryCode },
    });

    if (!country) {
      throw new NotFoundException(`Country ${dto.countryCode} not found`);
    }

    try {
      const packaging = await this.prisma.productPackaging.create({
        data: {
          ...(dto.id && { id: dto.id }),
          productId: dto.productId,
          countryCode: dto.countryCode,
          concentration: dto.concentration,
          concentrationUnitId: dto.concentrationUnitId,
          volume: dto.volume,
          volumeUnitId: dto.volumeUnitId,
          packagingLabel: dto.packagingLabel,
          gtinEan: dto.gtinEan,
          numeroAMM: dto.numeroAMM,
          isActive: dto.isActive ?? true,
          ...(dto.created_at && { createdAt: new Date(dto.created_at) }),
          ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
        },
        include: {
          product: {
            select: { id: true, nameFr: true, nameEn: true, type: true },
          },
          country: true,
          concentrationUnit: true,
          volumeUnit: true,
        },
      });

      this.logger.audit('Product packaging created', {
        packagingId: packaging.id,
        productId: dto.productId,
        countryCode: dto.countryCode,
      });

      return packaging;
    } catch (error) {
      this.logger.error(`Failed to create packaging for product ${dto.productId}`, error.stack);
      throw error;
    }
  }

  /**
   * Find all packagings with optional filters
   */
  async findAll(query: QueryProductPackagingDto) {
    const {
      productId,
      countryCode,
      gtinEan,
      isActive,
      page = 1,
      limit = 50,
    } = query;

    const where: any = {
      deletedAt: null,
    };

    if (productId) where.productId = productId;
    if (countryCode) where.countryCode = countryCode;
    if (gtinEan) where.gtinEan = gtinEan;
    if (isActive !== undefined) where.isActive = isActive;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.productPackaging.findMany({
        where,
        include: {
          product: {
            select: { id: true, nameFr: true, nameEn: true, type: true, manufacturer: true },
          },
          country: true,
          concentrationUnit: true,
          volumeUnit: true,
        },
        orderBy: [
          { product: { nameFr: 'asc' } },
          { countryCode: 'asc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.productPackaging.count({ where }),
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
   * Find packagings by product ID
   */
  async findByProduct(productId: string) {
    return this.prisma.productPackaging.findMany({
      where: {
        productId,
        deletedAt: null,
      },
      include: {
        country: true,
        concentrationUnit: true,
        volumeUnit: true,
      },
      orderBy: { countryCode: 'asc' },
    });
  }

  /**
   * Find packagings by country
   */
  async findByCountry(countryCode: string) {
    return this.prisma.productPackaging.findMany({
      where: {
        countryCode,
        deletedAt: null,
        isActive: true,
      },
      include: {
        product: {
          select: { id: true, nameFr: true, nameEn: true, type: true, manufacturer: true },
        },
        concentrationUnit: true,
        volumeUnit: true,
      },
      orderBy: { product: { nameFr: 'asc' } },
    });
  }

  /**
   * Find packaging by GTIN/EAN (barcode scan)
   */
  async findByGtin(gtinEan: string) {
    const packaging = await this.prisma.productPackaging.findFirst({
      where: {
        gtinEan,
        deletedAt: null,
      },
      include: {
        product: true,
        country: true,
        concentrationUnit: true,
        volumeUnit: true,
      },
    });

    if (!packaging) {
      throw new NotFoundException(`Packaging with GTIN ${gtinEan} not found`);
    }

    return packaging;
  }

  /**
   * Find a packaging by ID
   */
  async findOne(id: string) {
    const packaging = await this.prisma.productPackaging.findFirst({
      where: { id, deletedAt: null },
      include: {
        product: true,
        country: true,
        concentrationUnit: true,
        volumeUnit: true,
      },
    });

    if (!packaging) {
      throw new NotFoundException(`Packaging ${id} not found`);
    }

    return packaging;
  }

  /**
   * Update a packaging
   */
  async update(id: string, dto: UpdateProductPackagingDto) {
    this.logger.debug(`Updating packaging ${id}`);

    const existing = await this.prisma.productPackaging.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Packaging ${id} not found`);
    }

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException(
        'Version conflict: the packaging has been modified by another user',
      );
    }

    try {
      const { version, updated_at, ...updateData } = dto;

      const updated = await this.prisma.productPackaging.update({
        where: { id },
        data: {
          ...updateData,
          version: existing.version + 1,
          ...(updated_at && { updatedAt: new Date(updated_at) }),
        },
        include: {
          product: {
            select: { id: true, nameFr: true, nameEn: true, type: true },
          },
          country: true,
          concentrationUnit: true,
          volumeUnit: true,
        },
      });

      this.logger.audit('Product packaging updated', { packagingId: id });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update packaging ${id}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete a packaging
   */
  async remove(id: string) {
    this.logger.debug(`Soft deleting packaging ${id}`);

    const existing = await this.prisma.productPackaging.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Packaging ${id} not found`);
    }

    try {
      const deleted = await this.prisma.productPackaging.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Product packaging soft deleted', { packagingId: id });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete packaging ${id}`, error.stack);
      throw error;
    }
  }
}
