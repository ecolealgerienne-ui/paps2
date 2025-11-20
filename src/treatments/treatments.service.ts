import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTreatmentDto, UpdateTreatmentDto, QueryTreatmentDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class TreatmentsService {
  private readonly logger = new AppLogger(TreatmentsService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateTreatmentDto) {
    this.logger.debug(`Creating treatment for animal ${dto.animalId} in farm ${farmId}`);

    // Verify animal belongs to farm
    const animal = await this.prisma.animal.findFirst({
      where: { id: dto.animalId, farmId, deletedAt: null },
    });

    if (!animal) {
      this.logger.warn('Animal not found for treatment', { animalId: dto.animalId, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.TREATMENT_ANIMAL_NOT_FOUND,
        `Animal ${dto.animalId} not found`,
        { animalId: dto.animalId, farmId },
      );
    }

    try {
      const treatment = await this.prisma.treatment.create({
        data: {
          ...dto,
          farmId,
          treatmentDate: new Date(dto.treatmentDate),
          withdrawalEndDate: new Date(dto.withdrawalEndDate),
        },
        include: {
          animal: { select: { id: true, visualId: true, currentEid: true } },
          product: true,
          veterinarian: true,
          route: true,
        },
      });

      this.logger.audit('Treatment created', { treatmentId: treatment.id, animalId: dto.animalId, farmId });
      return treatment;
    } catch (error) {
      this.logger.error(`Failed to create treatment for animal ${dto.animalId}`, error.stack);
      throw error;
    }
  }

  async findAll(farmId: string, query: QueryTreatmentDto) {
    const where: any = {
      farmId,
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
        farmId,
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
      this.logger.warn('Treatment not found', { treatmentId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.TREATMENT_NOT_FOUND,
        `Treatment ${id} not found`,
        { treatmentId: id, farmId },
      );
    }

    return treatment;
  }

  async update(farmId: string, id: string, dto: UpdateTreatmentDto) {
    this.logger.debug(`Updating treatment ${id} (version ${dto.version})`);

    const existing = await this.prisma.treatment.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      this.logger.warn('Treatment not found', { treatmentId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.TREATMENT_NOT_FOUND,
        `Treatment ${id} not found`,
        { treatmentId: id, farmId },
      );
    }

    // Version conflict check
    if (dto.version && existing.version > dto.version) {
      this.logger.warn('Version conflict detected', {
        treatmentId: id,
        serverVersion: existing.version,
        clientVersion: dto.version,
      });

      throw new EntityConflictException(
        ERROR_CODES.VERSION_CONFLICT,
        'Version conflict detected',
        {
          treatmentId: id,
          serverVersion: existing.version,
          clientVersion: dto.version,
        },
      );
    }

    try {
      const updateData: any = {
        ...dto,
        version: existing.version + 1,
      };

      if (dto.treatmentDate) updateData.treatmentDate = new Date(dto.treatmentDate);
      if (dto.withdrawalEndDate) updateData.withdrawalEndDate = new Date(dto.withdrawalEndDate);

      const updated = await this.prisma.treatment.update({
        where: { id },
        data: updateData,
        include: {
          animal: { select: { id: true, visualId: true, currentEid: true } },
          product: true,
          veterinarian: true,
          route: true,
        },
      });

      this.logger.audit('Treatment updated', {
        treatmentId: id,
        farmId,
        version: `${existing.version} → ${updated.version}`,
      });

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update treatment ${id}`, error.stack);
      throw error;
    }
  }

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting treatment ${id}`);

    const existing = await this.prisma.treatment.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      this.logger.warn('Treatment not found', { treatmentId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.TREATMENT_NOT_FOUND,
        `Treatment ${id} not found`,
        { treatmentId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.treatment.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Treatment soft deleted', { treatmentId: id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete treatment ${id}`, error.stack);
      throw error;
    }
  }
}
