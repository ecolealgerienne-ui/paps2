import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFarmSpeciesPreferenceDto, FarmSpeciesPreferenceResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

@Injectable()
export class FarmSpeciesPreferencesService {
  private readonly logger = new AppLogger(FarmSpeciesPreferencesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all species preferences for a farm
   */
  async findByFarm(farmId: string, includeInactive = false): Promise<FarmSpeciesPreferenceResponseDto[]> {
    this.logger.debug(`Finding species preferences for farm ${farmId}`);

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

    return this.prisma.farmSpeciesPreference.findMany({
      where,
      include: {
        species: {
          select: {
            id: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            icon: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Find a single species preference by ID
   */
  async findOne(id: string): Promise<FarmSpeciesPreferenceResponseDto> {
    const preference = await this.prisma.farmSpeciesPreference.findFirst({
      where: { id, deletedAt: null },
      include: {
        species: {
          select: {
            id: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            icon: true,
          },
        },
      },
    });

    if (!preference) {
      throw new NotFoundException(`Farm species preference with ID "${id}" not found`);
    }

    return preference;
  }

  /**
   * Add a species preference to a farm
   */
  async add(farmId: string, speciesId: string): Promise<FarmSpeciesPreferenceResponseDto> {
    this.logger.debug(`Adding species preference to farm ${farmId}`);

    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, deletedAt: null },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    const species = await this.prisma.species.findFirst({
      where: { id: speciesId, deletedAt: null },
    });

    if (!species) {
      throw new NotFoundException(`Species with ID "${speciesId}" not found`);
    }

    // Check if preference already exists (including soft-deleted)
    const existing = await this.prisma.farmSpeciesPreference.findUnique({
      where: { farmId_speciesId: { farmId, speciesId } },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Restore if soft-deleted
        const restored = await this.prisma.farmSpeciesPreference.update({
          where: { id: existing.id },
          data: {
            deletedAt: null,
            isActive: true,
            version: existing.version + 1,
          },
          include: {
            species: {
              select: {
                id: true,
                nameFr: true,
                nameEn: true,
                nameAr: true,
                icon: true,
              },
            },
          },
        });
        this.logger.audit('Farm species preference restored', { preferenceId: existing.id, farmId, speciesId });
        return restored;
      }
      throw new ConflictException(`Species preference already exists for this farm`);
    }

    // Auto-increment displayOrder
    const maxOrder = await this.prisma.farmSpeciesPreference.findFirst({
      where: { farmId, deletedAt: null },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });
    const displayOrder = (maxOrder?.displayOrder ?? -1) + 1;

    const preference = await this.prisma.farmSpeciesPreference.create({
      data: {
        farmId,
        speciesId,
        displayOrder,
      },
      include: {
        species: {
          select: {
            id: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            icon: true,
          },
        },
      },
    });

    this.logger.audit('Farm species preference created', { preferenceId: preference.id, farmId, speciesId });
    return preference;
  }

  /**
   * Update a species preference
   */
  async update(id: string, dto: UpdateFarmSpeciesPreferenceDto): Promise<FarmSpeciesPreferenceResponseDto> {
    this.logger.debug(`Updating species preference ${id}`);

    const existing = await this.prisma.farmSpeciesPreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm species preference with ID "${id}" not found`);
    }

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict: the preference has been modified by another user');
    }

    const updated = await this.prisma.farmSpeciesPreference.update({
      where: { id },
      data: {
        displayOrder: dto.displayOrder ?? existing.displayOrder,
        isActive: dto.isActive ?? existing.isActive,
        version: existing.version + 1,
      },
      include: {
        species: {
          select: {
            id: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            icon: true,
          },
        },
      },
    });

    this.logger.audit('Farm species preference updated', { preferenceId: id });
    return updated;
  }

  /**
   * Soft delete a species preference
   */
  async remove(id: string): Promise<FarmSpeciesPreferenceResponseDto> {
    this.logger.debug(`Soft deleting species preference ${id}`);

    const existing = await this.prisma.farmSpeciesPreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm species preference with ID "${id}" not found`);
    }

    const deleted = await this.prisma.farmSpeciesPreference.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
      include: {
        species: {
          select: {
            id: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            icon: true,
          },
        },
      },
    });

    this.logger.audit('Farm species preference soft deleted', { preferenceId: id });
    return deleted;
  }

  /**
   * Toggle active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<FarmSpeciesPreferenceResponseDto> {
    this.logger.debug(`Toggling active status for preference ${id} to ${isActive}`);

    const existing = await this.prisma.farmSpeciesPreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm species preference with ID "${id}" not found`);
    }

    const updated = await this.prisma.farmSpeciesPreference.update({
      where: { id },
      data: {
        isActive,
        version: existing.version + 1,
      },
      include: {
        species: {
          select: {
            id: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            icon: true,
          },
        },
      },
    });

    this.logger.audit('Farm species preference toggled', { preferenceId: id, isActive });
    return updated;
  }

  /**
   * Reorder preferences for a farm
   */
  async reorder(farmId: string, orderedIds: string[]): Promise<FarmSpeciesPreferenceResponseDto[]> {
    this.logger.debug(`Reordering species preferences for farm ${farmId}`);

    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, deletedAt: null },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    // Verify all preferences belong to this farm
    const preferences = await this.prisma.farmSpeciesPreference.findMany({
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
      this.prisma.farmSpeciesPreference.update({
        where: { id },
        data: { displayOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);

    this.logger.audit('Farm species preferences reordered', { farmId, count: orderedIds.length });
    return this.findByFarm(farmId, true);
  }

  /**
   * Restore a soft-deleted preference
   */
  async restore(id: string): Promise<FarmSpeciesPreferenceResponseDto> {
    this.logger.debug(`Restoring species preference ${id}`);

    const existing = await this.prisma.farmSpeciesPreference.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Farm species preference with ID "${id}" not found`);
    }

    if (!existing.deletedAt) {
      throw new ConflictException('This preference is not deleted');
    }

    const restored = await this.prisma.farmSpeciesPreference.update({
      where: { id },
      data: {
        deletedAt: null,
        version: existing.version + 1,
      },
      include: {
        species: {
          select: {
            id: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            icon: true,
          },
        },
      },
    });

    this.logger.audit('Farm species preference restored', { preferenceId: id });
    return restored;
  }
}
