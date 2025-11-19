import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTreatmentDto, UpdateTreatmentDto, QueryTreatmentDto } from './dto';

@Injectable()
export class TreatmentsService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateTreatmentDto) {
    // Verify animal belongs to farm
    const animal = await this.prisma.animal.findFirst({
      where: { id: dto.animalId, farmId, deletedAt: null },
    });

    if (!animal) {
      throw new NotFoundException(`Animal ${dto.animalId} not found`);
    }

    return this.prisma.treatment.create({
      data: {
        ...dto,
        farmId,
        treatmentDate: new Date(dto.treatmentDate),
        withdrawalEndDate: dto.withdrawalEndDate ? new Date(dto.withdrawalEndDate) : null,
      },
      include: {
        animal: { select: { id: true, visualId: true, currentEid: true } },
        product: true,
        veterinarian: true,
        route: true,
      },
    });
  }

  async findAll(farmId: string, query: QueryTreatmentDto) {
    const where: any = {
      animal: { farmId },
      deletedAt: null,
    };

    if (query.animalId) where.animalId = query.animalId;
    if (query.status) where.status = query.status;
    if (query.fromDate || query.toDate) {
      where.treatmentDate = {};
      if (query.fromDate) where.treatmentDate.gte = new Date(query.fromDate);
      if (query.toDate) where.treatmentDate.lte = new Date(query.toDate);
    }

    return this.prisma.treatment.findMany({
      where,
      include: {
        animal: { select: { id: true, visualId: true, currentEid: true } },
        product: { select: { id: true, name: true } },
        veterinarian: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { treatmentDate: 'desc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const treatment = await this.prisma.treatment.findFirst({
      where: {
        id,
        animal: { farmId },
        deletedAt: null,
      },
      include: {
        animal: { select: { id: true, visualId: true, currentEid: true } },
        product: true,
        veterinarian: true,
        route: true,
      },
    });

    if (!treatment) {
      throw new NotFoundException(`Treatment ${id} not found`);
    }

    return treatment;
  }

  async update(farmId: string, id: string, dto: UpdateTreatmentDto) {
    const existing = await this.prisma.treatment.findFirst({
      where: {
        id,
        animal: { farmId },
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Treatment ${id} not found`);
    }

    if (dto.version && existing.version > dto.version) {
      throw new ConflictException({
        message: 'Version conflict',
        serverVersion: existing.version,
        serverData: existing,
      });
    }

    const updateData: any = {
      ...dto,
      version: existing.version + 1,
    };

    if (dto.treatmentDate) updateData.treatmentDate = new Date(dto.treatmentDate);
    if (dto.withdrawalEndDate) updateData.withdrawalEndDate = new Date(dto.withdrawalEndDate);

    return this.prisma.treatment.update({
      where: { id },
      data: updateData,
      include: {
        animal: { select: { id: true, visualId: true, currentEid: true } },
        product: true,
        veterinarian: true,
        route: true,
      },
    });
  }

  async remove(farmId: string, id: string) {
    const existing = await this.prisma.treatment.findFirst({
      where: {
        id,
        animal: { farmId },
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Treatment ${id} not found`);
    }

    return this.prisma.treatment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }
}
