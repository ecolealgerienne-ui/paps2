import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateActiveSubstanceDto, UpdateActiveSubstanceDto } from './dto';
import { ActiveSubstanceResponseDto } from './dto/active-substance-response.dto';
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
  data: ActiveSubstanceResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Service for managing active substances reference data
 * PHASE_02: Added pagination, restore, dependency check, proper typing
 */
@Injectable()
export class ActiveSubstancesService {
  private readonly logger = new AppLogger(ActiveSubstancesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new active substance
   * @param dto - Substance creation data
   * @returns Created substance
   */
  async create(dto: CreateActiveSubstanceDto): Promise<ActiveSubstanceResponseDto> {
    this.logger.debug(`Creating active substance with code ${dto.code}`);

    const existing = await this.prisma.activeSubstance.findUnique({
      where: { code: dto.code },
    });

    if (existing && !existing.deletedAt) {
      this.logger.warn(`Duplicate code attempt: ${dto.code}`);
      throw new ConflictException(`Active substance with code "${dto.code}" already exists`);
    }

    if (existing && existing.deletedAt) {
      this.logger.debug(`Restoring soft-deleted substance: ${dto.code}`);
      const restored = await this.prisma.activeSubstance.update({
        where: { id: existing.id },
        data: {
          name: dto.name,
          nameFr: dto.nameFr || null,
          nameEn: dto.nameEn || null,
          nameAr: dto.nameAr || null,
          atcCode: dto.atcCode || null,
          description: dto.description || null,
          isActive: dto.isActive ?? true,
          deletedAt: null,
          version: existing.version + 1,
        },
      });
      this.logger.audit('Active substance restored', { substanceId: restored.id, code: dto.code });
      return restored;
    }

    const substance = await this.prisma.activeSubstance.create({
      data: {
        code: dto.code,
        name: dto.name,
        nameFr: dto.nameFr || null,
        nameEn: dto.nameEn || null,
        nameAr: dto.nameAr || null,
        atcCode: dto.atcCode || null,
        description: dto.description || null,
        isActive: dto.isActive ?? true,
      },
    });

    this.logger.audit('Active substance created', { substanceId: substance.id, code: dto.code });
    return substance;
  }

  /**
   * Get all active substances with pagination, search, and sorting
   * @param options - Query options
   * @returns Paginated substances list
   */
  async findAll(options: FindAllOptions = {}): Promise<PaginatedResponse> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ActiveSubstanceWhereInput = { deletedAt: null };

    if (options.isActive !== undefined) where.isActive = options.isActive;

    // Search in 5 fields
    if (options.search) {
      const searchTerm = options.search;
      where.OR = [
        { code: { contains: searchTerm, mode: 'insensitive' } },
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { nameFr: { contains: searchTerm, mode: 'insensitive' } },
        { nameEn: { contains: searchTerm, mode: 'insensitive' } },
        { nameAr: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.buildOrderBy(options.orderBy, options.order);

    const [total, data] = await Promise.all([
      this.prisma.activeSubstance.count({ where }),
      this.prisma.activeSubstance.findMany({ where, orderBy, skip, take: limit }),
    ]);

    this.logger.debug(`Found ${total} active substances (page ${page}/${Math.ceil(total / limit)})`);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private buildOrderBy(
    field?: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ): Prisma.ActiveSubstanceOrderByWithRelationInput[] {
    const allowedFields = ['name', 'code', 'atcCode', 'createdAt'];

    if (field && allowedFields.includes(field)) {
      return [{ [field]: order.toLowerCase() as Prisma.SortOrder }];
    }

    // Default: sort by name
    return [{ name: 'asc' }];
  }

  /**
   * Get a single active substance by ID
   * @param id - Substance ID
   * @returns Substance or throws NotFoundException
   */
  async findOne(id: string): Promise<ActiveSubstanceResponseDto> {
    const substance = await this.prisma.activeSubstance.findFirst({
      where: { id, deletedAt: null },
    });

    if (!substance) {
      this.logger.warn(`Active substance not found: ${id}`);
      throw new NotFoundException(`Active substance with ID "${id}" not found`);
    }

    return substance;
  }

  /**
   * Get a substance by code
   * @param code - Substance code
   * @returns Substance or throws NotFoundException
   */
  async findByCode(code: string): Promise<ActiveSubstanceResponseDto> {
    const substance = await this.prisma.activeSubstance.findFirst({
      where: { code, deletedAt: null },
    });

    if (!substance) {
      this.logger.warn(`Active substance not found by code: ${code}`);
      throw new NotFoundException(`Active substance with code "${code}" not found`);
    }

    return substance;
  }

  /**
   * Update an active substance (with optimistic locking)
   * @param id - Substance ID
   * @param dto - Update data
   * @returns Updated substance
   */
  async update(id: string, dto: UpdateActiveSubstanceDto): Promise<ActiveSubstanceResponseDto> {
    this.logger.debug(`Updating active substance ${id}`);

    const existing = await this.findOne(id);

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException(
        `Version conflict: expected ${dto.version}, found ${existing.version}`,
      );
    }

    const substance = await this.prisma.activeSubstance.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name : existing.name,
        nameFr: dto.nameFr !== undefined ? dto.nameFr : existing.nameFr,
        nameEn: dto.nameEn !== undefined ? dto.nameEn : existing.nameEn,
        nameAr: dto.nameAr !== undefined ? dto.nameAr : existing.nameAr,
        atcCode: dto.atcCode !== undefined ? dto.atcCode : existing.atcCode,
        description: dto.description !== undefined ? dto.description : existing.description,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
        version: existing.version + 1,
      },
    });

    this.logger.audit('Active substance updated', { substanceId: id, newVersion: substance.version });
    return substance;
  }

  /**
   * Soft delete an active substance
   * @param id - Substance ID
   * @returns Soft-deleted substance
   */
  async remove(id: string): Promise<ActiveSubstanceResponseDto> {
    this.logger.debug(`Soft deleting active substance ${id}`);

    const existing = await this.findOne(id);

    // Check if used by active products
    const usageCount = await this.prisma.product.count({
      where: { substanceId: id, deletedAt: null },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete active substance "${existing.code}": ${usageCount} active products depend on it`,
      );
    }

    const substance = await this.prisma.activeSubstance.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });

    this.logger.audit('Active substance soft deleted', { substanceId: id });
    return substance;
  }

  /**
   * Restore a soft-deleted active substance
   * @param id - Substance ID
   * @returns Restored substance
   */
  async restore(id: string): Promise<ActiveSubstanceResponseDto> {
    this.logger.debug(`Restoring active substance ${id}`);

    const substance = await this.prisma.activeSubstance.findUnique({
      where: { id },
    });

    if (!substance) {
      this.logger.warn(`Active substance not found for restore: ${id}`);
      throw new NotFoundException(`Active substance with ID "${id}" not found`);
    }

    if (!substance.deletedAt) {
      throw new ConflictException(`Active substance "${substance.code}" is not deleted`);
    }

    const restored = await this.prisma.activeSubstance.update({
      where: { id },
      data: {
        deletedAt: null,
        version: substance.version + 1,
      },
    });

    this.logger.audit('Active substance restored', { substanceId: id });
    return restored;
  }
}
