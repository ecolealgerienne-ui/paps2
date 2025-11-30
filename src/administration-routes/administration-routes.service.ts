import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateAdministrationRouteDto, UpdateAdministrationRouteDto, AdministrationRouteResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

/**
 * Options for findAll pagination, filtering, search, and sorting
 */
export interface FindAllOptions {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

/**
 * Paginated response with metadata
 */
export interface PaginatedResponse {
  data: AdministrationRouteResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Service for managing Administration Routes
 * Used by Treatment and TherapeuticIndication
 */
@Injectable()
export class AdministrationRoutesService {
  private readonly logger = new AppLogger(AdministrationRoutesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAdministrationRouteDto): Promise<AdministrationRouteResponseDto> {
    this.logger.debug(`Creating administration route with code ${dto.code}`);

    // Check for duplicate code
    const existing = await this.prisma.administrationRoute.findUnique({
      where: { code: dto.code.toLowerCase() },
    });

    if (existing && !existing.deletedAt) {
      this.logger.warn(`Duplicate code attempt: ${dto.code}`);
      throw new ConflictException(`Administration route with code "${dto.code}" already exists`);
    }

    // If soft-deleted, restore and update
    if (existing && existing.deletedAt) {
      this.logger.debug(`Restoring soft-deleted route: ${dto.code}`);
      const restored = await this.prisma.administrationRoute.update({
        where: { id: existing.id },
        data: {
          code: dto.code.toLowerCase(),
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          abbreviation: dto.abbreviation || null,
          description: dto.description || null,
          displayOrder: dto.displayOrder ?? 0,
          isActive: dto.isActive ?? true,
          deletedAt: null,
          version: existing.version + 1,
        },
      });
      this.logger.audit('Administration route restored', { routeId: restored.id, code: restored.code });
      return restored;
    }

    const route = await this.prisma.administrationRoute.create({
      data: {
        code: dto.code.toLowerCase(),
        nameFr: dto.nameFr,
        nameEn: dto.nameEn,
        nameAr: dto.nameAr,
        abbreviation: dto.abbreviation || null,
        description: dto.description || null,
        displayOrder: dto.displayOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });

    this.logger.audit('Administration route created', { routeId: route.id, code: route.code });
    return route;
  }

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResponse> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AdministrationRouteWhereInput = { deletedAt: null };

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    // Search in 5 fields: nameFr, nameEn, nameAr, code, abbreviation
    if (options.search) {
      const searchTerm = options.search;
      where.OR = [
        { nameFr: { contains: searchTerm, mode: 'insensitive' } },
        { nameEn: { contains: searchTerm, mode: 'insensitive' } },
        { nameAr: { contains: searchTerm, mode: 'insensitive' } },
        { code: { contains: searchTerm.toLowerCase(), mode: 'insensitive' } },
        { abbreviation: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.buildOrderBy(options.orderBy, options.order);

    const [total, data] = await Promise.all([
      this.prisma.administrationRoute.count({ where }),
      this.prisma.administrationRoute.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    this.logger.debug(`Found ${total} administration routes (page ${page}/${Math.ceil(total / limit)})`);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private buildOrderBy(
    field?: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ): Prisma.AdministrationRouteOrderByWithRelationInput[] {
    const allowedFields = ['nameFr', 'nameEn', 'code', 'abbreviation', 'displayOrder', 'createdAt'];

    if (field && allowedFields.includes(field)) {
      return [{ [field]: order.toLowerCase() as Prisma.SortOrder }];
    }

    // Default: sort by displayOrder, then code
    return [{ displayOrder: 'asc' }, { code: 'asc' }];
  }

  async findOne(id: string): Promise<AdministrationRouteResponseDto> {
    const route = await this.prisma.administrationRoute.findFirst({
      where: { id, deletedAt: null },
    });

    if (!route) {
      this.logger.warn(`Administration route not found: ${id}`);
      throw new NotFoundException(`Administration route with ID "${id}" not found`);
    }

    return route;
  }

  async findByCode(code: string): Promise<AdministrationRouteResponseDto> {
    const route = await this.prisma.administrationRoute.findFirst({
      where: { code: code.toLowerCase(), deletedAt: null },
    });

    if (!route) {
      this.logger.warn(`Administration route not found by code: ${code}`);
      throw new NotFoundException(`Administration route with code "${code}" not found`);
    }

    return route;
  }

  async update(id: string, dto: UpdateAdministrationRouteDto): Promise<AdministrationRouteResponseDto> {
    const existing = await this.findOne(id);

    const updated = await this.prisma.administrationRoute.update({
      where: { id },
      data: {
        nameFr: dto.nameFr,
        nameEn: dto.nameEn,
        nameAr: dto.nameAr,
        abbreviation: dto.abbreviation !== undefined ? dto.abbreviation : existing.abbreviation,
        description: dto.description !== undefined ? dto.description : existing.description,
        displayOrder: dto.displayOrder !== undefined ? dto.displayOrder : existing.displayOrder,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
        version: existing.version + 1,
      },
    });

    this.logger.audit('Administration route updated', { routeId: id });
    return updated;
  }

  async toggleActive(id: string, isActive: boolean): Promise<AdministrationRouteResponseDto> {
    const existing = await this.findOne(id);

    const updated = await this.prisma.administrationRoute.update({
      where: { id },
      data: {
        isActive,
        version: existing.version + 1,
      },
    });

    this.logger.audit('Administration route active status toggled', { routeId: id, isActive });
    return updated;
  }

  async remove(id: string): Promise<AdministrationRouteResponseDto> {
    const existing = await this.findOne(id);

    // Check usage in treatments
    const treatmentCount = await this.prisma.treatment.count({
      where: { routeId: id, deletedAt: null },
    });

    // Check usage in therapeutic indications
    const therapeuticCount = await this.prisma.therapeuticIndication.count({
      where: { routeId: id, deletedAt: null },
    });

    const totalUsage = treatmentCount + therapeuticCount;

    if (totalUsage > 0) {
      this.logger.warn(`Cannot delete route ${id}: ${totalUsage} active references`);
      throw new ConflictException(
        `Cannot delete: route is in use by ${treatmentCount} treatment(s) and ${therapeuticCount} therapeutic indication(s)`,
      );
    }

    const deleted = await this.prisma.administrationRoute.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });

    this.logger.audit('Administration route soft deleted', { routeId: id });
    return deleted;
  }

  async restore(id: string): Promise<AdministrationRouteResponseDto> {
    const route = await this.prisma.administrationRoute.findUnique({
      where: { id },
    });

    if (!route) {
      this.logger.warn(`Administration route not found for restore: ${id}`);
      throw new NotFoundException('Administration route not found');
    }

    if (!route.deletedAt) {
      throw new ConflictException('Administration route is not deleted');
    }

    const restored = await this.prisma.administrationRoute.update({
      where: { id },
      data: {
        deletedAt: null,
        version: route.version + 1,
      },
    });

    this.logger.audit('Administration route restored', { routeId: id });
    return restored;
  }
}
