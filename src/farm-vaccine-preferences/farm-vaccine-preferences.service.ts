import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmVaccinePreferenceDto, UpdateFarmVaccinePreferenceDto } from './dto';

@Injectable()
export class FarmVaccinePreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFarmVaccinePreferenceDto) {
    // Validate XOR constraint
    this.validateXOR(dto.globalVaccineId, dto.customVaccineId);

    return this.prisma.farmVaccinePreference.create({
      data: {
        farmId: dto.farmId,
        globalVaccineId: dto.globalVaccineId,
        customVaccineId: dto.customVaccineId,
        displayOrder: dto.displayOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: {
        farm: true,
        globalVaccine: true,
        customVaccine: true,
      },
    });
  }

  async findAll() {
    return this.prisma.farmVaccinePreference.findMany({
      include: {
        farm: true,
        globalVaccine: true,
        customVaccine: true,
      },
      orderBy: [{ farmId: 'asc' }, { displayOrder: 'asc' }],
    });
  }

  async findByFarm(farmId: string) {
    return this.prisma.farmVaccinePreference.findMany({
      where: { farmId },
      include: {
        farm: true,
        globalVaccine: true,
        customVaccine: true,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const preference = await this.prisma.farmVaccinePreference.findUnique({
      where: { id },
      include: {
        farm: true,
        globalVaccine: true,
        customVaccine: true,
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
        globalVaccine: true,
        customVaccine: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check existence

    return this.prisma.farmVaccinePreference.delete({
      where: { id },
    });
  }

  /**
   * Validate XOR constraint: exactly one of globalVaccineId or customVaccineId must be provided
   */
  private validateXOR(globalVaccineId?: string, customVaccineId?: string): void {
    const hasGlobal = !!globalVaccineId;
    const hasCustom = !!customVaccineId;

    if (!hasGlobal && !hasCustom) {
      throw new BadRequestException(
        'Either globalVaccineId or customVaccineId must be provided'
      );
    }

    if (hasGlobal && hasCustom) {
      throw new BadRequestException(
        'Cannot provide both globalVaccineId and customVaccineId (XOR constraint)'
      );
    }
  }
}
