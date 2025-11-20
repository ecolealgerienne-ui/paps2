import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccinationDto, UpdateVaccinationDto, QueryVaccinationDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class VaccinationsService {
  private readonly logger = new AppLogger(VaccinationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateVaccinationDto) {
    // Determine which animals to vaccinate: batch (animal_ids) or single (animalId) or legacy (animalIds)
    const animalIds = dto.animal_ids?.length
      ? dto.animal_ids
      : dto.animalId
        ? [dto.animalId]
        : dto.animalIds
          ? JSON.parse(dto.animalIds)
          : [];

    if (animalIds.length === 0) {
      this.logger.warn('No animal ID provided for vaccination', { farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VACCINATION_ANIMAL_NOT_FOUND,
        'At least one animal ID must be provided (animalId, animal_ids, or animalIds)',
        { farmId },
      );
    }

    const isBatchVaccination = animalIds.length > 1;
    this.logger.debug(`Creating ${isBatchVaccination ? 'batch' : 'single'} vaccination for ${animalIds.length} animal(s) in farm ${farmId}`, {
      type: dto.type
    });

    // Verify all animals belong to farm
    const animals = await this.prisma.animal.findMany({
      where: { id: { in: animalIds }, farmId, deletedAt: null },
    });

    if (animals.length !== animalIds.length) {
      this.logger.warn('One or more animals not found for vaccination', {
        farmId,
        expected: animalIds.length,
        found: animals.length
      });
      throw new EntityNotFoundException(
        ERROR_CODES.VACCINATION_ANIMAL_NOT_FOUND,
        `One or more animals not found (expected ${animalIds.length}, found ${animals.length})`,
        { farmId, expectedCount: animalIds.length, foundCount: animals.length },
      );
    }

    try {
      // Destructure to exclude BaseSyncEntityDto fields and handle them explicitly
      const { farmId: dtoFarmId, created_at, updated_at, animal_ids, animalId, animalIds: legacyAnimalIds, id, ...vaccinationData } = dto;

      // For batch vaccinations, create one vaccination per animal in a transaction
      if (isBatchVaccination) {
        const vaccinations = await this.prisma.$transaction(
          animalIds.map((animalId, index) =>
            this.prisma.vaccination.create({
              data: {
                // Generate unique ID for each vaccination if base ID provided
                ...(id && { id: `${id}-${index}` }),
                ...vaccinationData,
                animalId,
                animalIds: JSON.stringify(animalIds), // Required field in Prisma schema
                farmId: dtoFarmId || farmId,
                vaccinationDate: new Date(dto.vaccinationDate),
                nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : null,
                expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
                // CRITICAL: Use client timestamps if provided (offline-first)
                ...(created_at && { createdAt: new Date(created_at) }),
                ...(updated_at && { updatedAt: new Date(updated_at) }),
              },
            })
          )
        );

        this.logger.audit('Batch vaccinations created', {
          count: vaccinations.length,
          farmId,
          type: dto.type,
          animalIds
        });
        return vaccinations;
      }

      // Single vaccination
      const vaccination = await this.prisma.vaccination.create({
        data: {
          ...(id && { id }),
          ...vaccinationData,
          animalId: animalIds[0],
          animalIds: dto.animalIds || animalIds[0], // Required field - use legacy or single ID
          farmId: dtoFarmId || farmId,
          vaccinationDate: new Date(dto.vaccinationDate),
          nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : null,
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
          // CRITICAL: Use client timestamps if provided (offline-first)
          ...(created_at && { createdAt: new Date(created_at) }),
          ...(updated_at && { updatedAt: new Date(updated_at) }),
        },
      });

      this.logger.audit('Vaccination created', {
        vaccinationId: vaccination.id,
        animalId: animalIds[0],
        farmId,
        type: dto.type
      });
      return vaccination;
    } catch (error) {
      this.logger.error(`Failed to create vaccination${isBatchVaccination ? 's' : ''} in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  async findAll(farmId: string, query: QueryVaccinationDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.animalId) where.animalId = query.animalId;
    if (query.type) where.type = query.type;
    if (query.fromDate || query.toDate) {
      where.vaccinationDate = {};
      if (query.fromDate) where.vaccinationDate.gte = new Date(query.fromDate);
      if (query.toDate) where.vaccinationDate.lte = new Date(query.toDate);
    }

    return this.prisma.vaccination.findMany({
      where,
      orderBy: { vaccinationDate: 'desc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const vaccination = await this.prisma.vaccination.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!vaccination) {
      this.logger.warn('Vaccination not found', { vaccinationId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VACCINATION_NOT_FOUND,
        `Vaccination ${id} not found`,
        { vaccinationId: id, farmId },
      );
    }

    return vaccination;
  }

  async update(farmId: string, id: string, dto: UpdateVaccinationDto) {
    this.logger.debug(`Updating vaccination ${id} (version ${dto.version})`);

    const existing = await this.prisma.vaccination.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      this.logger.warn('Vaccination not found', { vaccinationId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VACCINATION_NOT_FOUND,
        `Vaccination ${id} not found`,
        { vaccinationId: id, farmId },
      );
    }

    // Version conflict check
    if (dto.version && existing.version > dto.version) {
      this.logger.warn('Version conflict detected', {
        vaccinationId: id,
        serverVersion: existing.version,
        clientVersion: dto.version,
      });

      throw new EntityConflictException(
        ERROR_CODES.VERSION_CONFLICT,
        'Version conflict detected',
        {
          vaccinationId: id,
          serverVersion: existing.version,
          clientVersion: dto.version,
        },
      );
    }

    try {
      // Destructure to exclude BaseSyncEntityDto fields
      const { farmId: dtoFarmId, created_at, updated_at, version, ...vaccinationData } = dto;

      const updateData: any = {
        ...vaccinationData,
        version: existing.version + 1,
      };

      if (dto.vaccinationDate) updateData.vaccinationDate = new Date(dto.vaccinationDate);
      if (dto.nextDueDate) updateData.nextDueDate = new Date(dto.nextDueDate);
      if (dto.expiryDate) updateData.expiryDate = new Date(dto.expiryDate);
      // CRITICAL: Use client timestamp if provided (offline-first)
      if (updated_at) updateData.updatedAt = new Date(updated_at);

      const updated = await this.prisma.vaccination.update({
        where: { id },
        data: updateData,
      });

      this.logger.audit('Vaccination updated', {
        vaccinationId: id,
        farmId,
        version: `${existing.version} → ${updated.version}`,
      });

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update vaccination ${id}`, error.stack);
      throw error;
    }
  }

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting vaccination ${id}`);

    const existing = await this.prisma.vaccination.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      this.logger.warn('Vaccination not found', { vaccinationId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VACCINATION_NOT_FOUND,
        `Vaccination ${id} not found`,
        { vaccinationId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.vaccination.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Vaccination soft deleted', { vaccinationId: id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete vaccination ${id}`, error.stack);
      throw error;
    }
  }
}
