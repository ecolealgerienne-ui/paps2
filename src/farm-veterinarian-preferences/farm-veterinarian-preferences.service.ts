import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmVeterinarianPreferenceDto, UpdateFarmVeterinarianPreferenceDto, FarmVeterinarianPreferenceResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

@Injectable()
export class FarmVeterinarianPreferencesService {
  private readonly logger = new AppLogger(FarmVeterinarianPreferencesService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateFarmVeterinarianPreferenceDto): Promise<FarmVeterinarianPreferenceResponseDto> {
    this.logger.debug(`Creating veterinarian preference for farm ${farmId}`);

    // Vérifier que la ferme existe
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    // Vérifier que le vétérinaire existe
    const veterinarian = await this.prisma.veterinarian.findFirst({
      where: { id: dto.veterinarianId, deletedAt: null },
    });

    if (!veterinarian) {
      throw new NotFoundException(`Veterinarian with ID "${dto.veterinarianId}" not found`);
    }

    // Vérifier si la préférence existe déjà (incluant les soft-deleted)
    const existing = await this.prisma.farmVeterinarianPreference.findFirst({
      where: {
        farmId,
        veterinarianId: dto.veterinarianId,
      },
    });

    if (existing) {
      // Si soft-deleted, restaurer
      if (existing.deletedAt) {
        const restored = await this.prisma.farmVeterinarianPreference.update({
          where: { id: existing.id },
          data: {
            deletedAt: null,
            isActive: dto.isActive ?? true,
            displayOrder: dto.displayOrder ?? existing.displayOrder,
            version: existing.version + 1,
          },
          include: {
            veterinarian: true,
            farm: { select: { id: true, name: true } },
          },
        });
        this.logger.audit('Farm veterinarian preference restored', { preferenceId: existing.id, farmId });
        return restored;
      }
      throw new ConflictException(`This veterinarian is already in the preferences for this farm`);
    }

    // Auto-increment displayOrder si non fourni
    let displayOrder = dto.displayOrder;
    if (displayOrder === undefined) {
      const maxOrder = await this.prisma.farmVeterinarianPreference.findFirst({
        where: { farmId, deletedAt: null },
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });
      displayOrder = (maxOrder?.displayOrder ?? -1) + 1;
    }

    // Si isDefault=true, retirer le flag des autres préférences
    if (dto.isDefault) {
      await this.prisma.farmVeterinarianPreference.updateMany({
        where: { farmId, isDefault: true, deletedAt: null },
        data: { isDefault: false },
      });
    }

    const preference = await this.prisma.farmVeterinarianPreference.create({
      data: {
        ...dto,
        farmId,
        displayOrder,
      },
      include: {
        veterinarian: true,
        farm: { select: { id: true, name: true } },
      },
    });

    this.logger.audit('Farm veterinarian preference created', { preferenceId: preference.id, farmId, isDefault: dto.isDefault });
    return preference;
  }

  async findByFarm(farmId: string, includeInactive = false): Promise<FarmVeterinarianPreferenceResponseDto[]> {
    this.logger.debug(`Finding veterinarian preferences for farm ${farmId}`);

    // Vérifier que la ferme existe
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    const where: any = {
      farmId,
      deletedAt: null,
      veterinarian: { deletedAt: null }, // Exclure les vétérinaires soft-deleted
    };
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.prisma.farmVeterinarianPreference.findMany({
      where,
      include: {
        veterinarian: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<FarmVeterinarianPreferenceResponseDto> {
    const preference = await this.prisma.farmVeterinarianPreference.findFirst({
      where: {
        id,
        deletedAt: null,
        veterinarian: { deletedAt: null }, // Exclure les vétérinaires soft-deleted
      },
      include: {
        veterinarian: true,
        farm: { select: { id: true, name: true } },
      },
    });

    if (!preference) {
      throw new NotFoundException(`Farm veterinarian preference with ID "${id}" not found`);
    }

    return preference;
  }

  async update(id: string, dto: UpdateFarmVeterinarianPreferenceDto): Promise<FarmVeterinarianPreferenceResponseDto> {
    this.logger.debug(`Updating veterinarian preference ${id}`);

    const existing = await this.prisma.farmVeterinarianPreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm veterinarian preference with ID "${id}" not found`);
    }

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict: the preference has been modified by another user');
    }

    // Si isDefault=true, retirer le flag des autres préférences
    if (dto.isDefault) {
      await this.prisma.farmVeterinarianPreference.updateMany({
        where: { farmId: existing.farmId, isDefault: true, deletedAt: null, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.farmVeterinarianPreference.update({
      where: { id },
      data: {
        displayOrder: dto.displayOrder ?? existing.displayOrder,
        isActive: dto.isActive ?? existing.isActive,
        isDefault: dto.isDefault ?? existing.isDefault,
        version: existing.version + 1,
      },
      include: {
        veterinarian: true,
        farm: { select: { id: true, name: true } },
      },
    });

    this.logger.audit('Farm veterinarian preference updated', { preferenceId: id, isDefault: updated.isDefault });
    return updated;
  }

  async remove(id: string): Promise<FarmVeterinarianPreferenceResponseDto> {
    this.logger.debug(`Soft deleting veterinarian preference ${id}`);

    const existing = await this.prisma.farmVeterinarianPreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm veterinarian preference with ID "${id}" not found`);
    }

    const deleted = await this.prisma.farmVeterinarianPreference.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
      include: {
        veterinarian: true,
      },
    });

    this.logger.audit('Farm veterinarian preference soft deleted', { preferenceId: id });
    return deleted;
  }

  async toggleActive(id: string, isActive: boolean): Promise<FarmVeterinarianPreferenceResponseDto> {
    this.logger.debug(`Toggling active status for preference ${id} to ${isActive}`);

    const existing = await this.prisma.farmVeterinarianPreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm veterinarian preference with ID "${id}" not found`);
    }

    const updated = await this.prisma.farmVeterinarianPreference.update({
      where: { id },
      data: {
        isActive,
        version: existing.version + 1,
      },
      include: {
        veterinarian: true,
      },
    });

    this.logger.audit('Farm veterinarian preference toggled', { preferenceId: id, isActive });
    return updated;
  }

  async reorder(farmId: string, orderedIds: string[]): Promise<FarmVeterinarianPreferenceResponseDto[]> {
    this.logger.debug(`Reordering veterinarian preferences for farm ${farmId}`);

    // Vérifier que la ferme existe
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    // Vérifier que toutes les préférences appartiennent à cette ferme
    const preferences = await this.prisma.farmVeterinarianPreference.findMany({
      where: {
        id: { in: orderedIds },
        farmId,
        deletedAt: null,
      },
    });

    if (preferences.length !== orderedIds.length) {
      throw new BadRequestException('Some preference IDs are invalid or do not belong to this farm');
    }

    // Mettre à jour l'ordre dans une transaction
    const updates = orderedIds.map((id, index) =>
      this.prisma.farmVeterinarianPreference.update({
        where: { id },
        data: { displayOrder: index },
      })
    );

    await this.prisma.$transaction(updates);

    this.logger.audit('Farm veterinarian preferences reordered', { farmId, count: orderedIds.length });
    return this.findByFarm(farmId, true);
  }

  async restore(id: string): Promise<FarmVeterinarianPreferenceResponseDto> {
    this.logger.debug(`Restoring veterinarian preference ${id}`);

    const existing = await this.prisma.farmVeterinarianPreference.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Farm veterinarian preference with ID "${id}" not found`);
    }

    if (!existing.deletedAt) {
      throw new ConflictException('This preference is not deleted');
    }

    const restored = await this.prisma.farmVeterinarianPreference.update({
      where: { id },
      data: {
        deletedAt: null,
        version: existing.version + 1,
      },
      include: {
        veterinarian: true,
        farm: { select: { id: true, name: true } },
      },
    });

    this.logger.audit('Farm veterinarian preference restored', { preferenceId: id });
    return restored;
  }

  async findDefault(farmId: string): Promise<FarmVeterinarianPreferenceResponseDto | null> {
    this.logger.debug(`Finding default veterinarian preference for farm ${farmId}`);

    const preference = await this.prisma.farmVeterinarianPreference.findFirst({
      where: {
        farmId,
        isDefault: true,
        isActive: true,
        deletedAt: null,
        veterinarian: { deletedAt: null }, // Exclure les vétérinaires soft-deleted
      },
      include: {
        veterinarian: true,
        farm: { select: { id: true, name: true } },
      },
    });

    return preference;
  }

  async setDefault(farmId: string, id: string): Promise<FarmVeterinarianPreferenceResponseDto> {
    this.logger.debug(`Setting preference ${id} as default for farm ${farmId}`);

    const existing = await this.prisma.farmVeterinarianPreference.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Farm veterinarian preference with ID "${id}" not found for this farm`);
    }

    // Retirer le flag des autres préférences
    await this.prisma.farmVeterinarianPreference.updateMany({
      where: { farmId, isDefault: true, deletedAt: null, id: { not: id } },
      data: { isDefault: false },
    });

    const updated = await this.prisma.farmVeterinarianPreference.update({
      where: { id },
      data: {
        isDefault: true,
        version: existing.version + 1,
      },
      include: {
        veterinarian: true,
        farm: { select: { id: true, name: true } },
      },
    });

    this.logger.audit('Farm veterinarian preference set as default', { preferenceId: id, farmId });
    return updated;
  }
}
