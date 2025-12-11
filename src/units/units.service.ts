import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UnitType } from '@prisma/client';
import { CreateUnitDto, UpdateUnitDto, UnitResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

/**
 * Options for findAll pagination, filtering, search, and sorting
 */
export interface FindAllOptions {
  page?: number;
  limit?: number;
  unitType?: UnitType;
  isActive?: boolean;
  search?: string;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

/**
 * Paginated response with metadata
 */
export interface PaginatedResponse {
  data: UnitResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Service for managing Units of measurement
 * Used by ProductPackaging, TherapeuticIndication, Treatment
 */
@Injectable()
export class UnitsService {
  private readonly logger = new AppLogger(UnitsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUnitDto): Promise<UnitResponseDto> {
    this.logger.debug(`Creating unit with code ${dto.code}`);

    // Check for duplicate code
    const existing = await this.prisma.unit.findUnique({
      where: { code: dto.code.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(`Unit with code "${dto.code}" already exists`);
    }

    try {
      const unit = await this.prisma.unit.create({
        data: {
          code: dto.code.toLowerCase(),
          symbol: dto.symbol,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          unitType: dto.unitType,
          description: dto.description,
          baseUnitCode: dto.baseUnitCode?.toLowerCase(),
          conversionFactor: dto.conversionFactor,
          displayOrder: dto.displayOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
      });

      this.logger.audit('Unit created', { unitId: unit.id, code: unit.code });
      return unit;
    } catch (error) {
      this.logger.error(`Failed to create unit ${dto.code}`, error.stack);
      throw error;
    }
  }

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResponse> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    // Build WHERE clause
    const where: Prisma.UnitWhereInput = {
      deletedAt: null,
    };

    if (options.unitType) {
      where.unitType = options.unitType;
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    // Search in names, code, symbol, and description
    if (options.search) {
      const searchTerm = options.search;
      where.OR = [
        { nameFr: { contains: searchTerm, mode: 'insensitive' } },
        { nameEn: { contains: searchTerm, mode: 'insensitive' } },
        { nameAr: { contains: searchTerm, mode: 'insensitive' } },
        { code: { contains: searchTerm.toLowerCase(), mode: 'insensitive' } },
        { symbol: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Build ORDER BY clause
    const orderBy = this.buildOrderBy(options.orderBy, options.order);

    // Execute queries
    const [total, data] = await Promise.all([
      this.prisma.unit.count({ where }),
      this.prisma.unit.findMany({
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
  ): Prisma.UnitOrderByWithRelationInput[] {
    const allowedFields = ['nameFr', 'nameEn', 'code', 'symbol', 'unitType', 'displayOrder', 'createdAt'];

    if (field && allowedFields.includes(field)) {
      return [{ [field]: order.toLowerCase() as Prisma.SortOrder }];
    }

    // Default: sort by unitType, then displayOrder, then code
    return [
      { unitType: 'asc' },
      { displayOrder: 'asc' },
      { code: 'asc' },
    ];
  }

  async findByType(unitType: UnitType): Promise<UnitResponseDto[]> {
    return this.prisma.unit.findMany({
      where: {
        unitType,
        isActive: true,
        deletedAt: null,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string): Promise<UnitResponseDto> {
    const unit = await this.prisma.unit.findFirst({
      where: { id, deletedAt: null },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID "${id}" not found`);
    }

    return unit;
  }

  async findByCode(code: string): Promise<UnitResponseDto> {
    const unit = await this.prisma.unit.findFirst({
      where: { code: code.toLowerCase(), deletedAt: null },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with code "${code}" not found`);
    }

    return unit;
  }

  async update(id: string, dto: UpdateUnitDto): Promise<UnitResponseDto> {
    this.logger.debug(`Updating unit ${id}`);

    const existing = await this.prisma.unit.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Unit with ID "${id}" not found`);
    }

    try {
      // Normalize baseUnitCode if provided
      const updateData = {
        ...dto,
        ...(dto.baseUnitCode && { baseUnitCode: dto.baseUnitCode.toLowerCase() }),
      };

      const updated = await this.prisma.unit.update({
        where: { id },
        data: {
          ...updateData,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Unit updated', { unitId: id });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update unit ${id}`, error.stack);
      throw error;
    }
  }

  async toggleActive(id: string, isActive: boolean): Promise<UnitResponseDto> {
    this.logger.debug(`Toggling unit ${id} active status to ${isActive}`);

    const existing = await this.prisma.unit.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Unit with ID "${id}" not found`);
    }

    const updated = await this.prisma.unit.update({
      where: { id },
      data: {
        isActive,
        version: existing.version + 1,
      },
    });

    this.logger.audit('Unit active status toggled', { unitId: id, isActive });
    return updated;
  }

  async remove(id: string): Promise<void> {
    this.logger.debug(`Soft deleting unit ${id}`);

    const existing = await this.prisma.unit.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Unit with ID "${id}" not found`);
    }

    // Check dependencies
    const [packagingConcentrationCount, packagingVolumeCount, therapeuticIndicationsCount] = await Promise.all([
      this.prisma.productPackaging.count({
        where: { concentrationUnitId: id },
      }),
      this.prisma.productPackaging.count({
        where: { volumeUnitId: id },
      }),
      this.prisma.therapeuticIndication.count({
        where: { doseUnitId: id, deletedAt: null },
      }),
    ]);

    const totalUsage = packagingConcentrationCount + packagingVolumeCount + therapeuticIndicationsCount;

    if (totalUsage > 0) {
      this.logger.warn(`Cannot delete unit ${id}: has dependencies`, {
        packagingConcentrationCount,
        packagingVolumeCount,
        therapeuticIndicationsCount,
      });
      throw new ConflictException(
        `Cannot delete unit "${existing.code}": used in ${packagingConcentrationCount} packaging concentration(s), ${packagingVolumeCount} packaging volume(s), and ${therapeuticIndicationsCount} therapeutic indication(s)`,
      );
    }

    try {
      await this.prisma.unit.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Unit soft deleted', { unitId: id });
    } catch (error) {
      this.logger.error(`Failed to delete unit ${id}`, error.stack);
      throw error;
    }
  }

  /**
   * Convert a value from one unit to another
   * Units must be of the same type and have conversion factors defined
   */
  async convert(value: number, fromCode: string, toCode: string): Promise<number> {
    const fromUnit = await this.findByCode(fromCode);
    const toUnit = await this.findByCode(toCode);

    // Check if units are compatible (same type)
    if (fromUnit.unitType !== toUnit.unitType) {
      throw new ConflictException(
        `Cannot convert between ${fromUnit.unitType} and ${toUnit.unitType}`
      );
    }

    // If same unit, return as is
    if (fromCode.toLowerCase() === toCode.toLowerCase()) {
      return value;
    }

    // Convert to base unit first, then to target unit
    const fromFactor = fromUnit.conversionFactor ?? 1;
    const toFactor = toUnit.conversionFactor ?? 1;

    return (value * fromFactor) / toFactor;
  }
}
