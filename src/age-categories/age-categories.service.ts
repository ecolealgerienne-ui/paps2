import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgeCategoryDto, UpdateAgeCategoryDto, QueryAgeCategoryDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

@Injectable()
export class AgeCategoriesService {
  private readonly logger = new AppLogger(AgeCategoriesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAgeCategoryDto) {
    this.logger.debug(`Creating age category ${dto.code} for species ${dto.speciesId}`);

    // Verify species exists
    const species = await this.prisma.species.findUnique({
      where: { id: dto.speciesId },
    });

    if (!species) {
      throw new NotFoundException(`Species ${dto.speciesId} not found`);
    }

    // Check for duplicate code within species
    const existing = await this.prisma.ageCategory.findFirst({
      where: { speciesId: dto.speciesId, code: dto.code, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException(`Age category ${dto.code} already exists for species ${dto.speciesId}`);
    }

    try {
      const category = await this.prisma.ageCategory.create({
        data: {
          ...(dto.id && { id: dto.id }),
          code: dto.code,
          speciesId: dto.speciesId,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          ageMinDays: dto.ageMinDays,
          ageMaxDays: dto.ageMaxDays,
          displayOrder: dto.displayOrder ?? 0,
          isDefault: dto.isDefault ?? false,
          isActive: dto.isActive ?? true,
        },
        include: {
          species: true,
        },
      });

      this.logger.audit('Age category created', { categoryId: category.id, code: dto.code, speciesId: dto.speciesId });
      return category;
    } catch (error) {
      this.logger.error(`Failed to create age category ${dto.code}`, error.stack);
      throw error;
    }
  }

  async findAll(query: QueryAgeCategoryDto) {
    const where: any = {
      deletedAt: null,
    };

    if (query.speciesId) where.speciesId = query.speciesId;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    return this.prisma.ageCategory.findMany({
      where,
      include: {
        species: true,
      },
      orderBy: [
        { species: { displayOrder: 'asc' } },
        { displayOrder: 'asc' },
      ],
    });
  }

  async findBySpecies(speciesId: string) {
    return this.prisma.ageCategory.findMany({
      where: {
        speciesId,
        deletedAt: null,
        isActive: true,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.ageCategory.findFirst({
      where: { id, deletedAt: null },
      include: {
        species: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Age category ${id} not found`);
    }

    return category;
  }

  /**
   * Find the appropriate age category for an animal based on age
   */
  async findForAnimalAge(speciesId: string, ageInDays: number) {
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

  async update(id: string, dto: UpdateAgeCategoryDto) {
    this.logger.debug(`Updating age category ${id}`);

    const existing = await this.prisma.ageCategory.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Age category ${id} not found`);
    }

    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict');
    }

    try {
      const { version, ...updateData } = dto;

      const updated = await this.prisma.ageCategory.update({
        where: { id },
        data: {
          ...updateData,
          version: existing.version + 1,
        },
        include: {
          species: true,
        },
      });

      this.logger.audit('Age category updated', { categoryId: id });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update age category ${id}`, error.stack);
      throw error;
    }
  }

  async remove(id: string) {
    this.logger.debug(`Soft deleting age category ${id}`);

    const existing = await this.prisma.ageCategory.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Age category ${id} not found`);
    }

    try {
      const deleted = await this.prisma.ageCategory.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Age category soft deleted', { categoryId: id });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete age category ${id}`, error.stack);
      throw error;
    }
  }
}
