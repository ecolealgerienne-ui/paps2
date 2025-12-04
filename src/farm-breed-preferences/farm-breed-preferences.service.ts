import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFarmBreedPreferenceDto, FarmBreedPreferenceResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

@Injectable()
export class FarmBreedPreferencesService {
  private readonly logger = new AppLogger(FarmBreedPreferencesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all breed preferences for a farm
   */
  async findByFarm(farmId: string, includeInactive = false): Promise<FarmBreedPreferenceResponseDto[]> {
    this.logger.debug(`Finding breed preferences for farm ${farmId}`);

    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, deletedAt: null },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    const where: any = { farmId, deletedAt: null };
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.prisma.farmBreedPreference.findMany({
      where,
      include: {
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            speciesId: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Find a single breed preference by ID
   */
  async findOne(id: string): Promise<FarmBreedPreferenceResponseDto> {
    const preference = await this.prisma.farmBreedPreference.findFirst({
      where: { id, deletedAt: null },
      include: {
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            speciesId: true,
          },
        },
      },
    });

    if (!preference) {
      throw new NotFoundException(`Farm breed preference with ID "${id}" not found`);
    }

    return preference;
  }

  /**
   * Add a breed preference to a farm
   */
  async add(farmId: string, breedId: string): Promise<FarmBreedPreferenceResponseDto> {
    this.logger.debug(`Adding breed preference to farm ${farmId}`);

    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, deletedAt: null },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    const breed = await this.prisma.breed.findFirst({
      where: { id: breedId, deletedAt: null },
    });

    if (!breed) {
      throw new NotFoundException(`Breed with ID "${breedId}" not found`);
    }

    // Check if preference already exists (including soft-deleted)
    const existing = await this.prisma.farmBreedPreference.findUnique({
      where: { farmId_breedId: { farmId, breedId } },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Restore if soft-deleted
        const restored = await this.prisma.farmBreedPreference.update({
          where: { id: existing.id },
          data: {
            deletedAt: null,
            isActive: true,
            version: existing.version + 1,
          },
          include: {
            breed: {
              select: {
                id: true,
                code: true,
                nameFr: true,
                nameEn: true,
                nameAr: true,
                speciesId: true,
              },
            },
          },
        });
        this.logger.audit('Farm breed preference restored', { preferenceId: existing.id, farmId, breedId });
        return restored;
      }
      throw new ConflictException(`Breed preference already exists for this farm`);
    }

    // Auto-increment displayOrder
    const maxOrder = await this.prisma.farmBreedPreference.findFirst({
      where: { farmId, deletedAt: null },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });
    const displayOrder = (maxOrder?.displayOrder ?? -1) + 1;

    const preference = await this.prisma.farmBreedPreference.create({
      data: {
        farmId,
        breedId,
        displayOrder,
      },
      include: {
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            speciesId: true,
          },
        },
      },
    });

    this.logger.audit('Farm breed preference created', { preferenceId: preference.id, farmId, breedId });
    return preference;
  }

  /**
   * Update a breed preference
   */
  async update(id: string, dto: UpdateFarmBreedPreferenceDto): Promise<FarmBreedPreferenceResponseDto> {
    this.logger.debug(`Updating breed preference ${id}`);

    const existing = await this.prisma.farmBreedPreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm breed preference with ID "${id}" not found`);
    }

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict: the preference has been modified by another user');
    }

    const updated = await this.prisma.farmBreedPreference.update({
      where: { id },
      data: {
        displayOrder: dto.displayOrder ?? existing.displayOrder,
        isActive: dto.isActive ?? existing.isActive,
        version: existing.version + 1,
      },
      include: {
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            speciesId: true,
          },
        },
      },
    });

    this.logger.audit('Farm breed preference updated', { preferenceId: id });
    return updated;
  }

  /**
   * Soft delete a breed preference
   */
  async remove(id: string): Promise<FarmBreedPreferenceResponseDto> {
    this.logger.debug(`Soft deleting breed preference ${id}`);

    const existing = await this.prisma.farmBreedPreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm breed preference with ID "${id}" not found`);
    }

    const deleted = await this.prisma.farmBreedPreference.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
      include: {
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            speciesId: true,
          },
        },
      },
    });

    this.logger.audit('Farm breed preference soft deleted', { preferenceId: id });
    return deleted;
  }

  /**
   * Toggle active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<FarmBreedPreferenceResponseDto> {
    this.logger.debug(`Toggling active status for preference ${id} to ${isActive}`);

    const existing = await this.prisma.farmBreedPreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm breed preference with ID "${id}" not found`);
    }

    const updated = await this.prisma.farmBreedPreference.update({
      where: { id },
      data: {
        isActive,
        version: existing.version + 1,
      },
      include: {
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            speciesId: true,
          },
        },
      },
    });

    this.logger.audit('Farm breed preference toggled', { preferenceId: id, isActive });
    return updated;
  }

  /**
   * Reorder preferences for a farm
   */
  async reorder(farmId: string, orderedIds: string[]): Promise<FarmBreedPreferenceResponseDto[]> {
    this.logger.debug(`Reordering breed preferences for farm ${farmId}`);

    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, deletedAt: null },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    // Verify all preferences belong to this farm
    const preferences = await this.prisma.farmBreedPreference.findMany({
      where: {
        id: { in: orderedIds },
        farmId,
        deletedAt: null,
      },
    });

    if (preferences.length !== orderedIds.length) {
      throw new ConflictException('Some preference IDs are invalid or do not belong to this farm');
    }

    // Update order in transaction
    const updates = orderedIds.map((id, index) =>
      this.prisma.farmBreedPreference.update({
        where: { id },
        data: { displayOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);

    this.logger.audit('Farm breed preferences reordered', { farmId, count: orderedIds.length });
    return this.findByFarm(farmId, true);
  }

  /**
   * Restore a soft-deleted preference
   */
  async restore(id: string): Promise<FarmBreedPreferenceResponseDto> {
    this.logger.debug(`Restoring breed preference ${id}`);

    const existing = await this.prisma.farmBreedPreference.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Farm breed preference with ID "${id}" not found`);
    }

    if (!existing.deletedAt) {
      throw new ConflictException('This preference is not deleted');
    }

    const restored = await this.prisma.farmBreedPreference.update({
      where: { id },
      data: {
        deletedAt: null,
        version: existing.version + 1,
      },
      include: {
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            speciesId: true,
          },
        },
      },
    });

    this.logger.audit('Farm breed preference restored', { preferenceId: id });
    return restored;
  }
}
