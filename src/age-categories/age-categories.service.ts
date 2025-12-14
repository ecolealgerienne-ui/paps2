import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateAgeCategoryDto, UpdateAgeCategoryDto, AgeCategoryResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

/**
 * Options for findAll pagination, filtering, search, and sorting
 */
export interface FindAllOptions {
  page?: number;
  limit?: number;
  speciesId?: string;
  isActive?: boolean;
  search?: string;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

/**
 * Paginated response with metadata
 */
export interface PaginatedResponse {
  data: AgeCategoryResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class AgeCategoriesService {
  private readonly logger = new AppLogger(AgeCategoriesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAgeCategoryDto): Promise<AgeCategoryResponseDto> {
    this.logger.debug(`Creating age category ${dto.code} for species ${dto.speciesId}`);

    // Verify species exists
    const species = await this.prisma.species.findUnique({
      where: { id: dto.speciesId },
    });

    if (!species) {
      throw new NotFoundException(`Species with ID "${dto.speciesId}" not found`);
    }

    // Check for duplicate code within species
    const existing = await this.prisma.ageCategory.findFirst({
      where: {
        speciesId: dto.speciesId,
        code: dto.code.toUpperCase(),
        deletedAt: null
      },
    });

    if (existing) {
      throw new ConflictException(
        `Age category with code "${dto.code}" already exists for this species`
      );
    }

    try {
      const category = await this.prisma.ageCategory.create({
        data: {
          code: dto.code.toUpperCase(),
          speciesId: dto.speciesId,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          description: dto.description,
          ageMinDays: dto.ageMinDays,
          ageMaxDays: dto.ageMaxDays,
          displayOrder: dto.displayOrder ?? 0,
          isDefault: dto.isDefault ?? false,
          isActive: dto.isActive ?? true,
        },
      });

      this.logger.audit('Age category created', {
        categoryId: category.id,
        code: category.code,
        speciesId: dto.speciesId
      });
      return category;
    } catch (error) {
      this.logger.error(`Failed to create age category ${dto.code}`, error.stack);
      throw error;
    }
  }

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResponse> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    // Build WHERE clause
    const where: Prisma.AgeCategoryWhereInput = {
      deletedAt: null,
    };

    if (options.speciesId) {
      where.speciesId = options.speciesId;
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    // Search in names and code
    if (options.search) {
      const searchTerm = options.search;
      where.OR = [
        { nameFr: { contains: searchTerm, mode: 'insensitive' } },
        { nameEn: { contains: searchTerm, mode: 'insensitive' } },
        { nameAr: { contains: searchTerm, mode: 'insensitive' } },
        { code: { contains: searchTerm.toUpperCase(), mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Build ORDER BY clause
    const orderBy = this.buildOrderBy(options.orderBy, options.order);

    // Execute queries
    const [total, data] = await Promise.all([
      this.prisma.ageCategory.count({ where }),
      this.prisma.ageCategory.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
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
   * Build orderBy clause with whitelisted fields
   */
  private buildOrderBy(
    field?: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ): Prisma.AgeCategoryOrderByWithRelationInput {
    const allowedFields = ['nameFr', 'nameEn', 'code', 'ageMinDays', 'displayOrder', 'createdAt'];

    if (field && allowedFields.includes(field)) {
      return { [field]: order.toLowerCase() as Prisma.SortOrder };
    }

    // Default: sort by displayOrder ASC
    return { displayOrder: 'asc' };
  }

  async findBySpecies(speciesId: string): Promise<AgeCategoryResponseDto[]> {
    // Verify species exists
    const species = await this.prisma.species.findUnique({
      where: { id: speciesId },
    });

    if (!species) {
      throw new NotFoundException(`Species with ID "${speciesId}" not found`);
    }

    return this.prisma.ageCategory.findMany({
      where: {
        speciesId,
        deletedAt: null,
        isActive: true,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string): Promise<AgeCategoryResponseDto> {
    const category = await this.prisma.ageCategory.findFirst({
      where: { id, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException(`Age category with ID "${id}" not found`);
    }

    return category;
  }

  /**
   * Find the appropriate age category for an animal based on age
   */
  async findForAnimalAge(
    speciesId: string,
    ageInDays: number
  ): Promise<AgeCategoryResponseDto | null> {
    const category = await this.prisma.ageCategory.findFirst({
      where: {
        speciesId,
        ageMinDays: { lte: ageInDays },
        OR: [
          { ageMaxDays: null },
          { ageMaxDays: { gte: ageInDays } },
        ],
        deletedAt: null,
        isActive: true,
      },
      orderBy: { displayOrder: 'asc' },
    });

    if (!category) {
      // Return default category if no match
      return this.prisma.ageCategory.findFirst({
        where: {
          speciesId,
          isDefault: true,
          deletedAt: null,
          isActive: true,
        },
      });
    }

    return category;
  }

  async update(id: string, dto: UpdateAgeCategoryDto): Promise<AgeCategoryResponseDto> {
    this.logger.debug(`Updating age category ${id}`);

    const existing = await this.prisma.ageCategory.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Age category with ID "${id}" not found`);
    }

    try {
      const updated = await this.prisma.ageCategory.update({
        where: { id },
        data: {
          ...dto,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Age category updated', { categoryId: id });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update age category ${id}`, error.stack);
      throw error;
    }
  }

  async toggleActive(id: string, isActive: boolean): Promise<AgeCategoryResponseDto> {
    this.logger.debug(`Toggling age category ${id} active status to ${isActive}`);

    const existing = await this.prisma.ageCategory.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Age category with ID "${id}" not found`);
    }

    const updated = await this.prisma.ageCategory.update({
      where: { id },
      data: {
        isActive,
        version: existing.version + 1,
      },
    });

    this.logger.audit('Age category active status toggled', { categoryId: id, isActive });
    return updated;
  }

  async remove(id: string): Promise<void> {
    this.logger.debug(`Soft deleting age category ${id}`);

    const existing = await this.prisma.ageCategory.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Age category with ID "${id}" not found`);
    }

    // No dependency checks needed for MVP (therapeuticIndication table removed)

    try {
      await this.prisma.ageCategory.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Age category soft deleted', { categoryId: id });
    } catch (error) {
      this.logger.error(`Failed to delete age category ${id}`, error.stack);
      throw error;
    }
  }
}
