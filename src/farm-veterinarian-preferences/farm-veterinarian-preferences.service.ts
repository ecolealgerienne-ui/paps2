import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmVeterinarianPreferenceDto, UpdateFarmVeterinarianPreferenceDto } from './dto';

@Injectable()
export class FarmVeterinarianPreferencesService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateFarmVeterinarianPreferenceDto) {
    // Vérifier que la ferme existe
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    // Vérifier que le vétérinaire existe
    const veterinarian = await this.prisma.veterinarian.findUnique({
      where: { id: dto.veterinarianId },
    });

    if (!veterinarian) {
      throw new NotFoundException(`Veterinarian with ID "${dto.veterinarianId}" not found`);
    }

    // Vérifier si la préférence existe déjà (UNIQUE constraint)
    const existing = await this.prisma.farmVeterinarianPreference.findFirst({
      where: {
        farmId,
        veterinarianId: dto.veterinarianId,
      },
    });

    if (existing) {
      throw new ConflictException(`This veterinarian is already in the preferences for this farm`);
    }

    return this.prisma.farmVeterinarianPreference.create({
      data: {
        ...dto,
        farmId,
      },
      include: {
        veterinarian: true,
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.farmVeterinarianPreference.findMany({
      include: {
        veterinarian: true,
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  async findByFarm(farmId: string) {
    // Vérifier que la ferme existe
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    return this.prisma.farmVeterinarianPreference.findMany({
      where: { farmId },
      include: {
        veterinarian: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const preference = await this.prisma.farmVeterinarianPreference.findUnique({
      where: { id },
      include: {
        veterinarian: true,
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!preference) {
      throw new NotFoundException(`Farm veterinarian preference with ID "${id}" not found`);
    }

    return preference;
  }

  async update(id: string, dto: UpdateFarmVeterinarianPreferenceDto) {
    await this.findOne(id);

    return this.prisma.farmVeterinarianPreference.update({
      where: { id },
      data: dto,
      include: {
        veterinarian: true,
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.farmVeterinarianPreference.delete({
      where: { id },
    });
  }

  async toggleActive(id: string, isActive: boolean) {
    await this.findOne(id);

    return this.prisma.farmVeterinarianPreference.update({
      where: { id },
      data: { isActive },
      include: {
        veterinarian: true,
      },
    });
  }

  async reorder(farmId: string, orderedIds: string[]) {
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
      },
    });

    if (preferences.length !== orderedIds.length) {
      throw new BadRequestException('Some preference IDs are invalid or do not belong to this farm');
    }

    // Mettre à jour l'ordre
    const updates = orderedIds.map((id, index) =>
      this.prisma.farmVeterinarianPreference.update({
        where: { id },
        data: { displayOrder: index },
      })
    );

    await this.prisma.$transaction(updates);

    return this.findByFarm(farmId);
  }
}
