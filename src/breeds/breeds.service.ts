import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateBreedDto, UpdateBreedDto, BreedResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

export interface FindAllOptions {
  page?: number;
  limit?: number;
  speciesId?: string;
  isActive?: boolean;
  search?: string;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse {
  data: BreedResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Service for managing breeds reference data
 * PHASE_03: Migrated to /api/v1 with pagination, search, and restore
 */
@Injectable()
export class BreedsService {
  private readonly logger = new AppLogger(BreedsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new breed
   * @param dto - Breed creation data
   * @returns Created breed
   */
  async create(dto: CreateBreedDto): Promise<BreedResponseDto> {
    this.logger.debug(`Creating breed with code ${dto.code}`);

    const existing = await this.prisma.breed.findUnique({
      where: { code: dto.code },
    });

    if (existing && !existing.deletedAt) {
      this.logger.warn(`Duplicate code attempt: ${dto.code}`);
      throw new ConflictException(`Breed with code \"${dto.code}\" already exists`);
    }

    if (existing && existing.deletedAt) {
      this.logger.debug(`Restoring soft-deleted breed: ${dto.code}`);
      const restored = await this.prisma.breed.update({
        where: { id: existing.id },
        data: {
          speciesId: dto.speciesId,
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
      this.logger.audit('Breed restored', { breedId: restored.id, code: dto.code });
      return restored;
    }

    const breed = await this.prisma.breed.create({
      data: {
        code: dto.code,
        speciesId: dto.speciesId,
        nameFr: dto.nameFr,
        nameEn: dto.nameEn,
        nameAr: dto.nameAr,
        description: dto.description || null,
        displayOrder: dto.displayOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });

    this.logger.audit('Breed created', { breedId: breed.id, code: dto.code });
    return breed;
  }

  /**
   * Get all breeds with pagination, filters, search, and sorting
   * @param options - Query options
   * @returns Paginated breeds list
   */
  async findAll(options: FindAllOptions = {}): Promise<PaginatedResponse> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.BreedWhereInput = { deletedAt: null };

    if (options.speciesId) where.speciesId = options.speciesId;
    if (options.isActive !== undefined) where.isActive = options.isActive;

    // Search in 5 fields
    if (options.search) {
      const searchTerm = options.search;
      where.OR = [
        { code: { contains: searchTerm, mode: 'insensitive' } },
        { nameFr: { contains: searchTerm, mode: 'insensitive' } },
        { nameEn: { contains: searchTerm, mode: 'insensitive' } },
        { nameAr: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.buildOrderBy(options.orderBy, options.order);

    const [total, data] = await Promise.all([
      this.prisma.breed.count({ where }),
      this.prisma.breed.findMany({ where, orderBy, skip, take: limit }),
    ]);

    this.logger.debug(`Found ${total} breeds (page ${page}/${Math.ceil(total / limit)})`);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private buildOrderBy(
    field?: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ): Prisma.BreedOrderByWithRelationInput[] {
    const allowedFields = ['nameFr', 'nameEn', 'code', 'displayOrder', 'createdAt'];

    if (field && allowedFields.includes(field)) {
      return [{ [field]: order.toLowerCase() as Prisma.SortOrder }];
    }

    // Default: sort by displayOrder, then nameFr
    return [{ displayOrder: 'asc' }, { nameFr: 'asc' }];
  }

  /**
   * Get breeds by species (uses composite index for performance)
   * @param speciesId - Species ID
   * @param activeOnly - Filter only active breeds
   * @returns Breeds for the specified species
   */
  async findBySpecies(speciesId: string, activeOnly = true): Promise<BreedResponseDto[]> {
    const where: Prisma.BreedWhereInput = {
      speciesId,
      deletedAt: null,
    };

    if (activeOnly) {
      where.isActive = true;
    }

    return this.prisma.breed.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { nameFr: 'asc' }],
    });
  }

  /**
   * Get a single breed by ID
   * @param id - Breed ID
   * @returns Breed or throws NotFoundException
   */
  async findOne(id: string): Promise<BreedResponseDto> {
    const breed = await this.prisma.breed.findFirst({
      where: { id, deletedAt: null },
    });

    if (!breed) {
      this.logger.warn(`Breed not found: ${id}`);
      throw new NotFoundException(`Breed with ID \"${id}\" not found`);
    }

    return breed;
  }

  /**
   * Get a breed by code
   * @param code - Breed code
   * @returns Breed or throws NotFoundException
   */
  async findByCode(code: string): Promise<BreedResponseDto> {
    const breed = await this.prisma.breed.findFirst({
      where: { code, deletedAt: null },
    });

    if (!breed) {
      this.logger.warn(`Breed not found by code: ${code}`);
      throw new NotFoundException(`Breed with code \"${code}\" not found`);
    }

    return breed;
  }

  /**
   * Update a breed (with optimistic locking)
   * @param id - Breed ID
   * @param dto - Update data
   * @returns Updated breed
   */
  async update(id: string, dto: UpdateBreedDto): Promise<BreedResponseDto> {
    this.logger.debug(`Updating breed ${id}`);

    const existing = await this.findOne(id);

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException(
        `Version conflict: expected ${dto.version}, found ${existing.version}`,
      );
    }

    const breed = await this.prisma.breed.update({
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

    this.logger.audit('Breed updated', { breedId: id, newVersion: breed.version });
    return breed;
  }

  /**
   * Soft delete a breed
   * @param id - Breed ID
   * @returns Soft-deleted breed
   */
  async remove(id: string): Promise<BreedResponseDto> {
    this.logger.debug(`Soft deleting breed ${id}`);

    const existing = await this.findOne(id);

    // Check if used by active animals
    const usageCount = await this.prisma.animal.count({
      where: { breedId: id, deletedAt: null },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete breed \"${existing.code}\": ${usageCount} active animals depend on it`,
      );
    }

    const breed = await this.prisma.breed.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });

    this.logger.audit('Breed soft deleted', { breedId: id });
    return breed;
  }

  /**
   * Restore a soft-deleted breed
   * @param id - Breed ID
   * @returns Restored breed
   */
  async restore(id: string): Promise<BreedResponseDto> {
    this.logger.debug(`Restoring breed ${id}`);

    const breed = await this.prisma.breed.findUnique({
      where: { id },
    });

    if (!breed) {
      this.logger.warn(`Breed not found for restore: ${id}`);
      throw new NotFoundException(`Breed with ID \"${id}\" not found`);
    }

    if (!breed.deletedAt) {
      throw new ConflictException(`Breed \"${breed.code}\" is not deleted`);
    }

    const restored = await this.prisma.breed.update({
      where: { id },
      data: {
        deletedAt: null,
        version: breed.version + 1,
      },
    });

    this.logger.audit('Breed restored', { breedId: id });
    return restored;
  }
}
