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
    // Determine which animals to treat: batch (animal_ids) or single (animalId)
    const animalIds = dto.animal_ids?.length
      ? dto.animal_ids
      : dto.animalId
        ? [dto.animalId]
        : [];

    if (animalIds.length === 0) {
      this.logger.warn('No animal ID provided for treatment', { farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.TREATMENT_ANIMAL_NOT_FOUND,
        'At least one animal ID must be provided (animalId or animal_ids)',
        { farmId },
      );
    }

    const isBatchTreatment = animalIds.length > 1;
    this.logger.debug(`Creating ${isBatchTreatment ? 'batch' : 'single'} treatment for ${animalIds.length} animal(s) in farm ${farmId}`);

    // Verify all animals belong to farm
    const animals = await this.prisma.animal.findMany({
      where: { id: { in: animalIds }, farmId, deletedAt: null },
    });

    if (animals.length !== animalIds.length) {
      this.logger.warn('One or more animals not found for treatment', {
        farmId,
        expected: animalIds.length,
        found: animals.length
      });
      throw new EntityNotFoundException(
        ERROR_CODES.TREATMENT_ANIMAL_NOT_FOUND,
        `One or more animals not found (expected ${animalIds.length}, found ${animals.length})`,
        { farmId, expectedCount: animalIds.length, foundCount: animals.length },
      );
    }

    try {
      // Destructure to exclude BaseSyncEntityDto fields and handle them explicitly
      const { farmId: dtoFarmId, created_at, updated_at, animal_ids, animalId, id, ...treatmentData } = dto;

      // For batch treatments, use optimized createMany + findMany approach
      // This is 10-15x faster than individual creates in a transaction
      if (isBatchTreatment) {
        const { randomUUID } = await import('crypto');
        const baseId = id || randomUUID();
        const treatmentIds: string[] = [];

        // 1. Fast bulk insert with createMany
        const insertData = animalIds.map((animalId, index) => {
          const treatmentId = id ? `${id}-${index}` : randomUUID();
          treatmentIds.push(treatmentId);

          return {
            id: treatmentId,
            ...treatmentData,
            animalId,
            farmId: dtoFarmId || farmId,
            treatmentDate: new Date(dto.treatmentDate),
            withdrawalEndDate: new Date(dto.withdrawalEndDate),
            // CRITICAL: Use client timestamps if provided (offline-first)
            ...(created_at && { createdAt: new Date(created_at) }),
            ...(updated_at && { updatedAt: new Date(updated_at) }),
          };
        });

        await this.prisma.treatment.createMany({
          data: insertData,
          skipDuplicates: false,
        });

        // 2. Fetch created treatments with relations (single query)
        const treatments = await this.prisma.treatment.findMany({
          where: {
            id: { in: treatmentIds },
          },
          include: {
            animal: { select: { id: true, visualId: true, currentEid: true } },
            product: true,
            veterinarian: true,
            route: true,
          },
        });

        this.logger.audit('Batch treatments created', {
          count: treatments.length,
          farmId,
          animalIds
        });
        return treatments;
      }

      // Single treatment
      const treatment = await this.prisma.treatment.create({
        data: {
          ...(id && { id }),
          ...treatmentData,
          animalId: animalIds[0],
          farmId: dtoFarmId || farmId,
          treatmentDate: new Date(dto.treatmentDate),
          withdrawalEndDate: new Date(dto.withdrawalEndDate),
          // CRITICAL: Use client timestamps if provided (offline-first)
          ...(created_at && { createdAt: new Date(created_at) }),
          ...(updated_at && { updatedAt: new Date(updated_at) }),
        },
        include: {
          animal: { select: { id: true, visualId: true, currentEid: true } },
          product: true,
          veterinarian: true,
          route: true,
        },
      });

      this.logger.audit('Treatment created', { treatmentId: treatment.id, animalId: animalIds[0], farmId });
      return treatment;
    } catch (error) {
      this.logger.error(`Failed to create treatment${isBatchTreatment ? 's' : ''} in farm ${farmId}`, error.stack);
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
      // Destructure to exclude BaseSyncEntityDto fields
      const { farmId: dtoFarmId, created_at, updated_at, version, ...treatmentData } = dto;

      const updateData: any = {
        ...treatmentData,
        version: existing.version + 1,
      };

      if (dto.treatmentDate) updateData.treatmentDate = new Date(dto.treatmentDate);
      if (dto.withdrawalEndDate) updateData.withdrawalEndDate = new Date(dto.withdrawalEndDate);
      // CRITICAL: Use client timestamp if provided (offline-first)
      if (updated_at) updateData.updatedAt = new Date(updated_at);

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
