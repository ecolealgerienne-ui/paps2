import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFarmPreferencesDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityConflictException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class FarmPreferencesService {
  private readonly logger = new AppLogger(FarmPreferencesService.name);

  constructor(private prisma: PrismaService) {}

  async findOne(farmId: string) {
    const preferences = await this.prisma.farmPreferences.findFirst({
      where: { farmId, deletedAt: null },
    });

    if (!preferences) {
      this.logger.debug(`No preferences found for farm ${farmId}, returning defaults`);
      // Return default preferences if none exist
      const now = new Date();
      return {
        id: '',
        farmId,
        defaultVeterinarianId: null,
        defaultSpeciesId: null,
        defaultBreedId: null,
        weightUnit: 'kg',
        currency: 'DZD',
        language: 'fr',
        dateFormat: 'DD/MM/YYYY',
        enableNotifications: true,
        version: 1,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
    }

    return preferences;
  }

  async update(farmId: string, dto: UpdateFarmPreferencesDto) {
    this.logger.debug(`Updating farm preferences for farm ${farmId} (version ${dto.version})`);

    const existing = await this.prisma.farmPreferences.findFirst({
      where: { farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.debug(`Creating new preferences for farm ${farmId}`);
      try {
        // Filter out undefined values to avoid Prisma validation issues
        const cleanData = Object.fromEntries(
          Object.entries(dto).filter(([_, value]) => value !== undefined)
        );

        const created = await this.prisma.farmPreferences.create({
          data: {
            farmId,
            ...cleanData,
            version: 1,
          } as any, // Type assertion needed until Prisma client is regenerated
        });

        this.logger.audit('Farm preferences created', { farmId });
        return created;
      } catch (error) {
        this.logger.error(`Failed to create farm preferences for farm ${farmId}`, error.stack);
        throw error;
      }
    }

    // Version conflict check
    if (dto.version && existing.version > dto.version) {
      this.logger.warn('Version conflict detected', {
        farmId,
        serverVersion: existing.version,
        clientVersion: dto.version,
      });

      throw new EntityConflictException(
        ERROR_CODES.VERSION_CONFLICT,
        'Version conflict detected',
        {
          farmId,
          serverVersion: existing.version,
          clientVersion: dto.version,
        },
      );
    }

    try {
      const updated = await this.prisma.farmPreferences.update({
        where: { id: existing.id },
        data: {
          ...dto,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Farm preferences updated', {
        farmId,
        version: `${existing.version} → ${updated.version}`,
      });

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update farm preferences for farm ${farmId}`, error.stack);
      throw error;
    }
  }
}
