import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmProductPreferenceDto, UpdateFarmProductPreferenceDto } from './dto';

@Injectable()
export class FarmProductPreferencesService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateFarmProductPreferenceDto) {
    // Double vérification XOR (backend)
    const hasGlobal = !!dto.globalProductId;
    const hasCustom = !!dto.customProductId;

    if (hasGlobal === hasCustom) {
      throw new BadRequestException('Must specify exactly one: globalProductId or customProductId');
    }

    // Vérifier que la ferme existe
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    // Vérifier que le produit existe
    if (dto.globalProductId) {
      const product = await this.prisma.globalMedicalProduct.findUnique({
        where: { id: dto.globalProductId },
      });

      if (!product) {
        throw new NotFoundException(`Global product with ID "${dto.globalProductId}" not found`);
      }
    }

    if (dto.customProductId) {
      const product = await this.prisma.customMedicalProduct.findFirst({
        where: {
          id: dto.customProductId,
          farmId, // Vérifier que le produit custom appartient à cette ferme
        },
      });

      if (!product) {
        throw new NotFoundException(`Custom product with ID "${dto.customProductId}" not found or does not belong to this farm`);
      }
    }

    return this.prisma.farmProductPreference.create({
      data: {
        ...dto,
        farmId,
      },
      include: {
        globalProduct: true,
        customProduct: true,
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
    return this.prisma.farmProductPreference.findMany({
      include: {
        globalProduct: true,
        customProduct: true,
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

    return this.prisma.farmProductPreference.findMany({
      where: { farmId },
      include: {
        globalProduct: true,
        customProduct: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const preference = await this.prisma.farmProductPreference.findUnique({
      where: { id },
      include: {
        globalProduct: true,
        customProduct: true,
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!preference) {
      throw new NotFoundException(`Farm product preference with ID "${id}" not found`);
    }

    return preference;
  }

  async update(id: string, dto: UpdateFarmProductPreferenceDto) {
    await this.findOne(id);

    return this.prisma.farmProductPreference.update({
      where: { id },
      data: dto,
      include: {
        globalProduct: true,
        customProduct: true,
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

    return this.prisma.farmProductPreference.delete({
      where: { id },
    });
  }

  async toggleActive(id: string, isActive: boolean) {
    await this.findOne(id);

    return this.prisma.farmProductPreference.update({
      where: { id },
      data: { isActive },
      include: {
        globalProduct: true,
        customProduct: true,
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
    const preferences = await this.prisma.farmProductPreference.findMany({
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
      this.prisma.farmProductPreference.update({
        where: { id },
        data: { displayOrder: index },
      })
    );

    await this.prisma.$transaction(updates);

    return this.findByFarm(farmId);
  }
}
