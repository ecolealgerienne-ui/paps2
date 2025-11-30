import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateSpeciesDto, UpdateSpeciesDto } from './dto';
import { SpeciesResponseDto } from './dto/species-response.dto';
import { AppLogger } from '../common/utils/logger.service';

export interface FindAllOptions {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse {
  data: SpeciesResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Service for managing species reference data
 * PHASE_02: Added pagination, search, sort, scientificName
 */
@Injectable()
export class SpeciesService {
  private readonly logger = new AppLogger(SpeciesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new species
   * @param dto - Species creation data
   * @returns Created species
   */
  async create(dto: CreateSpeciesDto): Promise<SpeciesResponseDto> {
    this.logger.debug(`Creating species with id ${dto.id}`);

    const existing = await this.prisma.species.findUnique({
      where: { id: dto.id },
    });

    if (existing && !existing.deletedAt) {
      this.logger.warn(`Duplicate id attempt: ${dto.id}`);
      throw new ConflictException(`Species with id "${dto.id}" already exists`);
    }

    if (existing && existing.deletedAt) {
      this.logger.debug(`Restoring soft-deleted species: ${dto.id}`);
      const restored = await this.prisma.species.update({
        where: { id: dto.id },
        data: {
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          icon: dto.icon || '',
          displayOrder: dto.displayOrder ?? 0,
          description: dto.description || null,
          scientificName: dto.scientificName || null,
          deletedAt: null,
          version: existing.version + 1,
        },
      });
      this.logger.audit('Species restored', { speciesId: restored.id, nameFr: restored.nameFr });
      return restored;
    }

    const species = await this.prisma.species.create({
      data: {
        id: dto.id,
        nameFr: dto.nameFr,
        nameEn: dto.nameEn,
        nameAr: dto.nameAr,
        icon: dto.icon || '',
        displayOrder: dto.displayOrder ?? 0,
        description: dto.description || null,
        scientificName: dto.scientificName || null,
      },
    });

    this.logger.audit('Species created', { speciesId: species.id, nameFr: species.nameFr });
    return species;
  }

  /**
   * Get all species with pagination, search, and sorting
   * @param options - Query options
   * @returns Paginated species list
   */
  async findAll(options: FindAllOptions = {}): Promise<PaginatedResponse> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.SpeciesWhereInput = { deletedAt: null };

    // Search in 4 fields
    if (options.search) {
      const searchTerm = options.search;
      where.OR = [
        { nameFr: { contains: searchTerm, mode: 'insensitive' } },
        { nameEn: { contains: searchTerm, mode: 'insensitive' } },
        { nameAr: { contains: searchTerm, mode: 'insensitive' } },
        { scientificName: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.buildOrderBy(options.orderBy, options.order);

    const [total, data] = await Promise.all([
      this.prisma.species.count({ where }),
      this.prisma.species.findMany({ where, orderBy, skip, take: limit }),
    ]);

    this.logger.debug(`Found ${total} species (page ${page}/${Math.ceil(total / limit)})`);

    return {
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  private buildOrderBy(
    field?: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ): Prisma.SpeciesOrderByWithRelationInput[] {
    const allowedFields = ['nameFr', 'nameEn', 'id', 'displayOrder', 'createdAt'];

    if (field && allowedFields.includes(field)) {
      return [{ [field]: order.toLowerCase() as Prisma.SortOrder }];
    }

    // Default: sort by displayOrder, then nameFr
    return [{ displayOrder: 'asc' }, { nameFr: 'asc' }];
  }

  /**
   * Get a single species by ID
   * @param id - Species ID
   * @returns Species or throws NotFoundException
   */
  async findOne(id: string): Promise<SpeciesResponseDto> {
    const species = await this.prisma.species.findFirst({
      where: { id, deletedAt: null },
    });

    if (!species) {
      this.logger.warn(`Species not found: ${id}`);
      throw new NotFoundException(`Species with id "${id}" not found`);
    }

    return species;
  }

  /**
   * Update a species (with optimistic locking)
   * @param id - Species ID
   * @param dto - Update data
   * @returns Updated species
   */
  async update(id: string, dto: UpdateSpeciesDto): Promise<SpeciesResponseDto> {
    this.logger.debug(`Updating species ${id}`);

    const existing = await this.findOne(id);

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException(
        `Version conflict: expected ${dto.version}, found ${existing.version}`,
      );
    }

    const species = await this.prisma.species.update({
      where: { id },
      data: {
        nameFr: dto.nameFr !== undefined ? dto.nameFr : existing.nameFr,
        nameEn: dto.nameEn !== undefined ? dto.nameEn : existing.nameEn,
        nameAr: dto.nameAr !== undefined ? dto.nameAr : existing.nameAr,
        icon: dto.icon !== undefined ? dto.icon : existing.icon,
        displayOrder: dto.displayOrder !== undefined ? dto.displayOrder : existing.displayOrder,
        description: dto.description !== undefined ? dto.description : existing.description,
        scientificName: dto.scientificName !== undefined ? dto.scientificName : existing.scientificName,
        version: existing.version + 1,
      },
    });

    this.logger.audit('Species updated', { speciesId: id, newVersion: species.version });
    return species;
  }

  /**
   * Soft delete a species
   * @param id - Species ID
   * @returns Soft-deleted species
   */
  async remove(id: string): Promise<SpeciesResponseDto> {
    this.logger.debug(`Soft deleting species ${id}`);

    const existing = await this.findOne(id);

    // Check dependencies
    const [breedsCount, animalsCount, ageCategoriesCount] = await Promise.all([
      this.prisma.breed.count({
        where: { speciesId: id, deletedAt: null },
      }),
      this.prisma.animal.count({
        where: { speciesId: id, deletedAt: null },
      }),
      this.prisma.ageCategory.count({
        where: { speciesId: id, deletedAt: null },
      }),
    ]);

    const totalUsage = breedsCount + animalsCount + ageCategoriesCount;

    if (totalUsage > 0) {
      this.logger.warn(`Cannot delete species ${id}: has dependencies`, {
        breedsCount,
        animalsCount,
        ageCategoriesCount,
      });
      throw new ConflictException(
        `Cannot delete species "${id}": used in ${breedsCount} breed(s), ${animalsCount} animal(s), and ${ageCategoriesCount} age category/categories`,
      );
    }

    const species = await this.prisma.species.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });

    this.logger.audit('Species soft deleted', { speciesId: id });
    return species;
  }

  /**
   * Restore a soft-deleted species
   * @param id - Species ID
   * @returns Restored species
   */
  async restore(id: string): Promise<SpeciesResponseDto> {
    this.logger.debug(`Restoring species ${id}`);

    const species = await this.prisma.species.findUnique({
      where: { id },
    });

    if (!species) {
      this.logger.warn(`Species not found for restore: ${id}`);
      throw new NotFoundException(`Species with id "${id}" not found`);
    }

    if (!species.deletedAt) {
      throw new ConflictException(`Species "${id}" is not deleted`);
    }

    const restored = await this.prisma.species.update({
      where: { id },
      data: {
        deletedAt: null,
        version: species.version + 1,
      },
    });

    this.logger.audit('Species restored', { speciesId: id });
    return restored;
  }
}
