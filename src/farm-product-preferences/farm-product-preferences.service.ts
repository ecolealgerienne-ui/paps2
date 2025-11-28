import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmProductPreferenceDto, UpdateFarmProductPreferenceDto } from './dto';
import { DataScope } from '../common/types/prisma-types';

@Injectable()
export class FarmProductPreferencesService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateFarmProductPreferenceDto) {
    // Verify farm exists
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    // Verify product exists and is accessible to this farm
    // (global products are accessible to all, local products only to their farm)
    const product = await this.prisma.product.findFirst({
      where: {
        id: dto.productId,
        deletedAt: null,
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID "${dto.productId}" not found or not accessible to this farm`,
      );
    }

    // Check for duplicate preference
    const existing = await this.prisma.farmProductPreference.findUnique({
      where: {
        farmId_productId: { farmId, productId: dto.productId },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Product preference already exists for this farm`,
      );
    }

    return this.prisma.farmProductPreference.create({
      data: {
        farmId,
        productId: dto.productId,
        displayOrder: dto.displayOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: {
        product: true,
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
        product: true,
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
    // Verify farm exists
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    return this.prisma.farmProductPreference.findMany({
      where: { farmId },
      include: {
        product: true,
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
        product: true,
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!preference) {
      throw new NotFoundException(
        `Farm product preference with ID "${id}" not found`,
      );
    }

    return preference;
  }

  async update(id: string, dto: UpdateFarmProductPreferenceDto) {
    await this.findOne(id);

    return this.prisma.farmProductPreference.update({
      where: { id },
      data: dto,
      include: {
        product: true,
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
        product: true,
      },
    });
  }

  async reorder(farmId: string, orderedIds: string[]) {
    // Verify farm exists
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    // Verify all preferences belong to this farm
    const preferences = await this.prisma.farmProductPreference.findMany({
      where: {
        id: { in: orderedIds },
        farmId,
      },
    });

    if (preferences.length !== orderedIds.length) {
      throw new BadRequestException(
        'Some preference IDs are invalid or do not belong to this farm',
      );
    }

    // Update order
    const updates = orderedIds.map((id, index) =>
      this.prisma.farmProductPreference.update({
        where: { id },
        data: { displayOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return this.findByFarm(farmId);
  }
}
