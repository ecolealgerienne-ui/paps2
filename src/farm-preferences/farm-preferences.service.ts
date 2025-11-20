import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFarmPreferencesDto } from './dto';

@Injectable()
export class FarmPreferencesService {
  constructor(private prisma: PrismaService) {}

  async findOne(farmId: string) {
    const preferences = await this.prisma.farmPreferences.findFirst({
      where: { farmId, deletedAt: null },
    });

    if (!preferences) {
      // Return default preferences if none exist
      return {
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
      };
    }

    return preferences;
  }

  async update(farmId: string, dto: UpdateFarmPreferencesDto) {
    const existing = await this.prisma.farmPreferences.findFirst({
      where: { farmId, deletedAt: null },
    });

    if (!existing) {
      // Create preferences if they don't exist
      return this.prisma.farmPreferences.create({
        data: {
          farmId,
          defaultSpeciesId: dto.defaultSpeciesId || '',
          ...dto,
          version: 1,
        },
      });
    }

    if (dto.version && existing.version > dto.version) {
      throw new ConflictException({
        message: 'Version conflict',
        serverVersion: existing.version,
        serverData: existing,
      });
    }

    return this.prisma.farmPreferences.update({
      where: { id: existing.id },
      data: {
        ...dto,
        version: existing.version + 1,
      },
    });
  }
}
