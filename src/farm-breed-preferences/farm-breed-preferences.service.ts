import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/utils/logger.service';

/**
 * Service for managing Farm-Breed preferences
 * PHASE_20: FarmBreedPreferences
 */
@Injectable()
export class FarmBreedPreferencesService {
  private readonly logger = new AppLogger(FarmBreedPreferencesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all breed preferences for a farm
   * @param farmId - Farm UUID
   * @param includeInactive - Include inactive preferences
   * @returns List of breed preferences with details
   */
  async findByFarm(farmId: string, includeInactive = false) {
    this.logger.debug('Finding breed preferences for farm', { farmId, includeInactive });

    // Verify farm exists
    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, deletedAt: null },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID ${farmId} not found`);
    }

    const where: any = { farmId };
    if (!includeInactive) {
      where.isActive = true;
    }

    const preferences = await this.prisma.farmBreedPreference.findMany({
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
      orderBy: {
        displayOrder: 'asc',
      },
    });

    this.logger.debug('Found breed preferences for farm', {
      farmId,
      count: preferences.length,
    });

    return preferences;
  }

  /**
   * Add a breed preference to a farm
   * @param farmId - Farm UUID
   * @param breedId - Breed UUID
   * @returns Created preference
   */
  async add(farmId: string, breedId: string) {
    this.logger.debug('Adding breed preference to farm', { farmId, breedId });

    // Verify farm exists
    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, deletedAt: null },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID ${farmId} not found`);
    }

    // Verify breed exists
    const breed = await this.prisma.breed.findFirst({
      where: { id: breedId, deletedAt: null },
    });

    if (!breed) {
      throw new NotFoundException(`Breed with ID ${breedId} not found`);
    }

    // Check if preference already exists
    const existing = await this.prisma.farmBreedPreference.findFirst({
      where: { farmId, breedId },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException(
          `Breed ${breedId} is already in preferences for farm ${farmId}`,
        );
      } else {
        // Reactivate existing preference
        const reactivated = await this.prisma.farmBreedPreference.update({
          where: { id: existing.id },
          data: { isActive: true },
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

        this.logger.audit('Farm breed preference reactivated', { farmId, breedId });
        return reactivated;
      }
    }

    // Get max display order for this farm
    const maxOrder = await this.prisma.farmBreedPreference.findFirst({
      where: { farmId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });

    const displayOrder = maxOrder ? maxOrder.displayOrder + 1 : 0;

    // Create new preference
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

    this.logger.audit('Farm breed preference added', {
      farmId,
      breedId,
      preferenceId: preference.id,
    });

    return preference;
  }

  /**
   * Remove a breed preference from a farm (hard delete)
   * @param farmId - Farm UUID
   * @param breedId - Breed UUID
   */
  async remove(farmId: string, breedId: string) {
    this.logger.debug('Removing breed preference from farm', { farmId, breedId });

    const preference = await this.prisma.farmBreedPreference.findFirst({
      where: { farmId, breedId },
    });

    if (!preference) {
      throw new NotFoundException(
        `Preference for breed ${breedId} not found for farm ${farmId}`,
      );
    }

    // Hard delete
    await this.prisma.farmBreedPreference.delete({
      where: { id: preference.id },
    });

    this.logger.audit('Farm breed preference removed', {
      farmId,
      breedId,
      preferenceId: preference.id,
    });

    return { success: true };
  }

  /**
   * Reorder a breed preference for a farm
   * @param farmId - Farm UUID
   * @param breedId - Breed UUID
   * @param displayOrder - New display order
   * @returns Updated preference
   */
  async reorder(farmId: string, breedId: string, displayOrder: number) {
    this.logger.debug('Reordering breed preference', { farmId, breedId, displayOrder });

    const preference = await this.prisma.farmBreedPreference.findFirst({
      where: { farmId, breedId },
    });

    if (!preference) {
      throw new NotFoundException(
        `Preference for breed ${breedId} not found for farm ${farmId}`,
      );
    }

    const updated = await this.prisma.farmBreedPreference.update({
      where: { id: preference.id },
      data: { displayOrder },
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

    this.logger.audit('Farm breed preference reordered', {
      farmId,
      breedId,
      displayOrder,
    });

    return updated;
  }

  /**
   * Toggle active status of a breed preference
   * @param farmId - Farm UUID
   * @param breedId - Breed UUID
   * @param isActive - Active status
   * @returns Updated preference
   */
  async toggleActive(farmId: string, breedId: string, isActive: boolean) {
    this.logger.debug('Toggling breed preference active status', {
      farmId,
      breedId,
      isActive,
    });

    const preference = await this.prisma.farmBreedPreference.findFirst({
      where: { farmId, breedId },
    });

    if (!preference) {
      throw new NotFoundException(
        `Preference for breed ${breedId} not found for farm ${farmId}`,
      );
    }

    const updated = await this.prisma.farmBreedPreference.update({
      where: { id: preference.id },
      data: { isActive },
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

    this.logger.audit('Farm breed preference active status toggled', {
      farmId,
      breedId,
      isActive,
    });

    return updated;
  }
}
