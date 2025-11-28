import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActiveSubstanceDto, UpdateActiveSubstanceDto, QueryActiveSubstanceDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

@Injectable()
export class ActiveSubstancesService {
  private readonly logger = new AppLogger(ActiveSubstancesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateActiveSubstanceDto) {
    this.logger.debug(`Creating active substance with code ${dto.code}`);

    const existing = await this.prisma.activeSubstance.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Active substance with code ${dto.code} already exists`);
    }

    try {
      const substance = await this.prisma.activeSubstance.create({
        data: {
          ...(dto.id && { id: dto.id }),
          code: dto.code,
          name: dto.name,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          atcCode: dto.atcCode,
          description: dto.description,
          isActive: dto.isActive ?? true,
        },
      });

      this.logger.audit('Active substance created', { substanceId: substance.id, code: dto.code });
      return substance;
    } catch (error) {
      this.logger.error(`Failed to create active substance ${dto.code}`, error.stack);
      throw error;
    }
  }

  async findAll(query: QueryActiveSubstanceDto) {
    const where: any = {
      deletedAt: null,
    };

    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { nameFr: { contains: query.search, mode: 'insensitive' } },
        { nameEn: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.activeSubstance.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const substance = await this.prisma.activeSubstance.findFirst({
      where: { id, deletedAt: null },
    });

    if (!substance) {
      throw new NotFoundException(`Active substance ${id} not found`);
    }

    return substance;
  }

  async findByCode(code: string) {
    const substance = await this.prisma.activeSubstance.findFirst({
      where: { code, deletedAt: null },
    });

    if (!substance) {
      throw new NotFoundException(`Active substance with code ${code} not found`);
    }

    return substance;
  }

  async update(id: string, dto: UpdateActiveSubstanceDto) {
    this.logger.debug(`Updating active substance ${id}`);

    const existing = await this.prisma.activeSubstance.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Active substance ${id} not found`);
    }

    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict');
    }

    try {
      const { version, ...updateData } = dto;

      const updated = await this.prisma.activeSubstance.update({
        where: { id },
        data: {
          ...updateData,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Active substance updated', { substanceId: id });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update active substance ${id}`, error.stack);
      throw error;
    }
  }

  async remove(id: string) {
    this.logger.debug(`Soft deleting active substance ${id}`);

    const existing = await this.prisma.activeSubstance.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Active substance ${id} not found`);
    }

    try {
      const deleted = await this.prisma.activeSubstance.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Active substance soft deleted', { substanceId: id });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete active substance ${id}`, error.stack);
      throw error;
    }
  }
}
