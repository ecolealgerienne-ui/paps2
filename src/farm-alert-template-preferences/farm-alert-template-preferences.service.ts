import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFarmAlertTemplatePreferenceDto, FarmAlertTemplatePreferenceResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

@Injectable()
export class FarmAlertTemplatePreferencesService {
  private readonly logger = new AppLogger(FarmAlertTemplatePreferencesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all alert template preferences for a farm
   */
  async findByFarm(farmId: string, includeInactive = false): Promise<FarmAlertTemplatePreferenceResponseDto[]> {
    this.logger.debug(`Finding alert template preferences for farm ${farmId}`);

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

    return this.prisma.farmAlertTemplatePreference.findMany({
      where,
      include: {
        alertTemplate: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            descriptionFr: true,
            descriptionEn: true,
            descriptionAr: true,
            category: true,
            priority: true,
            isActive: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Find a single alert template preference by ID
   */
  async findOne(id: string): Promise<FarmAlertTemplatePreferenceResponseDto> {
    const preference = await this.prisma.farmAlertTemplatePreference.findFirst({
      where: { id, deletedAt: null },
      include: {
        alertTemplate: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            descriptionFr: true,
            descriptionEn: true,
            descriptionAr: true,
            category: true,
            priority: true,
            isActive: true,
          },
        },
      },
    });

    if (!preference) {
      throw new NotFoundException(`Farm alert template preference with ID "${id}" not found`);
    }

    return preference;
  }

  /**
   * Add an alert template preference to a farm
   */
  async add(farmId: string, alertTemplateId: string, reminderDays?: number): Promise<FarmAlertTemplatePreferenceResponseDto> {
    this.logger.debug(`Adding alert template preference to farm ${farmId}`);

    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, deletedAt: null },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    const alertTemplate = await this.prisma.alertTemplate.findFirst({
      where: { id: alertTemplateId, deletedAt: null },
    });

    if (!alertTemplate) {
      throw new NotFoundException(`Alert template with ID "${alertTemplateId}" not found`);
    }

    // Check if preference already exists (including soft-deleted)
    const existing = await this.prisma.farmAlertTemplatePreference.findUnique({
      where: { farmId_alertTemplateId: { farmId, alertTemplateId } },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Restore if soft-deleted
        const restored = await this.prisma.farmAlertTemplatePreference.update({
          where: { id: existing.id },
          data: {
            deletedAt: null,
            isActive: true,
            reminderDays: reminderDays ?? existing.reminderDays,
            version: existing.version + 1,
          },
          include: {
            alertTemplate: {
              select: {
                id: true,
                code: true,
                nameFr: true,
                nameEn: true,
                nameAr: true,
                descriptionFr: true,
                descriptionEn: true,
                descriptionAr: true,
                category: true,
                priority: true,
                isActive: true,
              },
            },
          },
        });
        this.logger.audit('Farm alert template preference restored', { preferenceId: existing.id, farmId, alertTemplateId });
        return restored;
      }
      throw new ConflictException(`Alert template preference already exists for this farm`);
    }

    // Auto-increment displayOrder
    const maxOrder = await this.prisma.farmAlertTemplatePreference.findFirst({
      where: { farmId, deletedAt: null },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });
    const displayOrder = (maxOrder?.displayOrder ?? -1) + 1;

    const preference = await this.prisma.farmAlertTemplatePreference.create({
      data: {
        farmId,
        alertTemplateId,
        displayOrder,
        reminderDays,
      },
      include: {
        alertTemplate: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            descriptionFr: true,
            descriptionEn: true,
            descriptionAr: true,
            category: true,
            priority: true,
            isActive: true,
          },
        },
      },
    });

    this.logger.audit('Farm alert template preference created', { preferenceId: preference.id, farmId, alertTemplateId });
    return preference;
  }

  /**
   * Update an alert template preference
   */
  async update(id: string, dto: UpdateFarmAlertTemplatePreferenceDto): Promise<FarmAlertTemplatePreferenceResponseDto> {
    this.logger.debug(`Updating alert template preference ${id}`);

    const existing = await this.prisma.farmAlertTemplatePreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm alert template preference with ID "${id}" not found`);
    }

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict: the preference has been modified by another user');
    }

    const updated = await this.prisma.farmAlertTemplatePreference.update({
      where: { id },
      data: {
        displayOrder: dto.displayOrder ?? existing.displayOrder,
        isActive: dto.isActive ?? existing.isActive,
        reminderDays: dto.reminderDays !== undefined ? dto.reminderDays : existing.reminderDays,
        version: existing.version + 1,
      },
      include: {
        alertTemplate: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            descriptionFr: true,
            descriptionEn: true,
            descriptionAr: true,
            category: true,
            priority: true,
            isActive: true,
          },
        },
      },
    });

    this.logger.audit('Farm alert template preference updated', { preferenceId: id });
    return updated;
  }

  /**
   * Soft delete an alert template preference
   */
  async remove(id: string): Promise<FarmAlertTemplatePreferenceResponseDto> {
    this.logger.debug(`Soft deleting alert template preference ${id}`);

    const existing = await this.prisma.farmAlertTemplatePreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm alert template preference with ID "${id}" not found`);
    }

    const deleted = await this.prisma.farmAlertTemplatePreference.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
      include: {
        alertTemplate: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            descriptionFr: true,
            descriptionEn: true,
            descriptionAr: true,
            category: true,
            priority: true,
            isActive: true,
          },
        },
      },
    });

    this.logger.audit('Farm alert template preference soft deleted', { preferenceId: id });
    return deleted;
  }

  /**
   * Toggle active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<FarmAlertTemplatePreferenceResponseDto> {
    this.logger.debug(`Toggling active status for preference ${id} to ${isActive}`);

    const existing = await this.prisma.farmAlertTemplatePreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm alert template preference with ID "${id}" not found`);
    }

    const updated = await this.prisma.farmAlertTemplatePreference.update({
      where: { id },
      data: {
        isActive,
        version: existing.version + 1,
      },
      include: {
        alertTemplate: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            descriptionFr: true,
            descriptionEn: true,
            descriptionAr: true,
            category: true,
            priority: true,
            isActive: true,
          },
        },
      },
    });

    this.logger.audit('Farm alert template preference toggled', { preferenceId: id, isActive });
    return updated;
  }

  /**
   * Reorder preferences for a farm
   */
  async reorder(farmId: string, orderedIds: string[]): Promise<FarmAlertTemplatePreferenceResponseDto[]> {
    this.logger.debug(`Reordering alert template preferences for farm ${farmId}`);

    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, deletedAt: null },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    // Verify all preferences belong to this farm
    const preferences = await this.prisma.farmAlertTemplatePreference.findMany({
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
      this.prisma.farmAlertTemplatePreference.update({
        where: { id },
        data: { displayOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);

    this.logger.audit('Farm alert template preferences reordered', { farmId, count: orderedIds.length });
    return this.findByFarm(farmId, true);
  }

  /**
   * Restore a soft-deleted preference
   */
  async restore(id: string): Promise<FarmAlertTemplatePreferenceResponseDto> {
    this.logger.debug(`Restoring alert template preference ${id}`);

    const existing = await this.prisma.farmAlertTemplatePreference.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Farm alert template preference with ID "${id}" not found`);
    }

    if (!existing.deletedAt) {
      throw new ConflictException('This preference is not deleted');
    }

    const restored = await this.prisma.farmAlertTemplatePreference.update({
      where: { id },
      data: {
        deletedAt: null,
        version: existing.version + 1,
      },
      include: {
        alertTemplate: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            descriptionFr: true,
            descriptionEn: true,
            descriptionAr: true,
            category: true,
            priority: true,
            isActive: true,
          },
        },
      },
    });

    this.logger.audit('Farm alert template preference restored', { preferenceId: id });
    return restored;
  }
}
