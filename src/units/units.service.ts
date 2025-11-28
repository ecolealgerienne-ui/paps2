import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto, UpdateUnitDto, QueryUnitDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

/**
 * Service for managing Units of measurement
 * Used by ProductPackaging, TherapeuticIndication, Treatment
 */
@Injectable()
export class UnitsService {
  private readonly logger = new AppLogger(UnitsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUnitDto) {
    this.logger.debug(`Creating unit with code ${dto.code}`);

    // Check for duplicate code
    const existing = await this.prisma.unit.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Unit with code ${dto.code} already exists`);
    }

    try {
      const unit = await this.prisma.unit.create({
        data: {
          ...(dto.id && { id: dto.id }),
          code: dto.code,
          symbol: dto.symbol,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          unitType: dto.unitType,
          description: dto.description,
          baseUnitCode: dto.baseUnitCode,
          conversionFactor: dto.conversionFactor,
          displayOrder: dto.displayOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
      });

      this.logger.audit('Unit created', { unitId: unit.id, code: dto.code });
      return unit;
    } catch (error) {
      this.logger.error(`Failed to create unit ${dto.code}`, error.stack);
      throw error;
    }
  }

  async findAll(query: QueryUnitDto) {
    const where: any = {
      deletedAt: null,
    };

    if (query.unitType) where.unitType = query.unitType;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    return this.prisma.unit.findMany({
      where,
      orderBy: [
        { unitType: 'asc' },
        { displayOrder: 'asc' },
        { code: 'asc' },
      ],
    });
  }

  async findByType(unitType: string) {
    return this.prisma.unit.findMany({
      where: {
        unitType: unitType as any,
        isActive: true,
        deletedAt: null,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, deletedAt: null },
    });

    if (!unit) {
      throw new NotFoundException(`Unit ${id} not found`);
    }

    return unit;
  }

  async findByCode(code: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { code, deletedAt: null },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with code ${code} not found`);
    }

    return unit;
  }

  async update(id: string, dto: UpdateUnitDto) {
    this.logger.debug(`Updating unit ${id}`);

    const existing = await this.prisma.unit.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Unit ${id} not found`);
    }

    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict');
    }

    try {
      const { version, ...updateData } = dto;

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

  async remove(id: string) {
    this.logger.debug(`Soft deleting unit ${id}`);

    const existing = await this.prisma.unit.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Unit ${id} not found`);
    }

    try {
      const deleted = await this.prisma.unit.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Unit soft deleted', { unitId: id });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete unit ${id}`, error.stack);
      throw error;
    }
  }

  /**
   * Convert a value from one unit to another
   */
  async convert(value: number, fromCode: string, toCode: string): Promise<number> {
    const fromUnit = await this.findByCode(fromCode);
    const toUnit = await this.findByCode(toCode);

    // Check if units are compatible (same type or same base)
    if (fromUnit.unitType !== toUnit.unitType) {
      throw new ConflictException(`Cannot convert between ${fromUnit.unitType} and ${toUnit.unitType}`);
    }

    // If same unit, return as is
    if (fromCode === toCode) {
      return value;
    }

    // Convert to base unit first, then to target unit
    const fromFactor = fromUnit.conversionFactor ?? 1;
    const toFactor = toUnit.conversionFactor ?? 1;

    return (value * fromFactor) / toFactor;
  }
}
