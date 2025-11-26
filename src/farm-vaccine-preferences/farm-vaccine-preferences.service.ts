import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmVaccinePreferenceDto, UpdateFarmVaccinePreferenceDto } from './dto';
import { DataScope } from '@prisma/client';

@Injectable()
export class FarmVaccinePreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(farmId: string, dto: CreateFarmVaccinePreferenceDto) {
    // Verify farm exists
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    // Verify vaccine exists and is accessible to this farm
    // (global vaccines are accessible to all, local vaccines only to their farm)
    const vaccine = await this.prisma.vaccine.findFirst({
      where: {
        id: dto.vaccineId,
        deletedAt: null,
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
      },
    });

    if (!vaccine) {
      throw new NotFoundException(
        `Vaccine with ID "${dto.vaccineId}" not found or not accessible to this farm`,
      );
    }

    // Check for duplicate preference
    const existing = await this.prisma.farmVaccinePreference.findUnique({
      where: {
        farmId_vaccineId: { farmId, vaccineId: dto.vaccineId },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Vaccine preference already exists for this farm`,
      );
    }

    return this.prisma.farmVaccinePreference.create({
      data: {
        farmId,
        vaccineId: dto.vaccineId,
        displayOrder: dto.displayOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: {
        farm: true,
        vaccine: true,
      },
    });
  }

  async findAll() {
    return this.prisma.farmVaccinePreference.findMany({
      include: {
        farm: true,
        vaccine: true,
      },
      orderBy: [{ farmId: 'asc' }, { displayOrder: 'asc' }],
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

    return this.prisma.farmVaccinePreference.findMany({
      where: { farmId },
      include: {
        farm: true,
        vaccine: true,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const preference = await this.prisma.farmVaccinePreference.findUnique({
      where: { id },
      include: {
        farm: true,
        vaccine: true,
      },
    });

    if (!preference) {
      throw new NotFoundException(`FarmVaccinePreference with ID ${id} not found`);
    }

    return preference;
  }

  async update(id: string, dto: UpdateFarmVaccinePreferenceDto) {
    await this.findOne(id); // Check existence

    return this.prisma.farmVaccinePreference.update({
      where: { id },
      data: {
        displayOrder: dto.displayOrder,
        isActive: dto.isActive,
      },
      include: {
        farm: true,
        vaccine: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check existence

    return this.prisma.farmVaccinePreference.delete({
      where: { id },
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
    const preferences = await this.prisma.farmVaccinePreference.findMany({
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
      this.prisma.farmVaccinePreference.update({
        where: { id },
        data: { displayOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return this.findByFarm(farmId);
  }
}
