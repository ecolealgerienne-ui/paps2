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
    this.logger.debug(`Creating vaccination in farm ${farmId}`, {
      animalId: dto.animalId,
      type: dto.type
    });

    // Verify single animal if provided
    if (dto.animalId) {
      const animal = await this.prisma.animal.findFirst({
        where: { id: dto.animalId, farmId, deletedAt: null },
      });

      if (!animal) {
        this.logger.warn('Animal not found for vaccination', { animalId: dto.animalId, farmId });
        throw new EntityNotFoundException(
          ERROR_CODES.VACCINATION_ANIMAL_NOT_FOUND,
          `Animal ${dto.animalId} not found`,
          { animalId: dto.animalId, farmId },
        );
      }
    }

    try {
      const vaccination = await this.prisma.vaccination.create({
        data: {
          ...dto,
          farmId,
          vaccinationDate: new Date(dto.vaccinationDate),
          nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : null,
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        },
      });

      this.logger.audit('Vaccination created', {
        vaccinationId: vaccination.id,
        animalId: dto.animalId,
        farmId
      });
      return vaccination;
    } catch (error) {
      this.logger.error(`Failed to create vaccination in farm ${farmId}`, error.stack);
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
      const updateData: any = {
        ...dto,
        version: existing.version + 1,
      };

      if (dto.vaccinationDate) updateData.vaccinationDate = new Date(dto.vaccinationDate);
      if (dto.nextDueDate) updateData.nextDueDate = new Date(dto.nextDueDate);
      if (dto.expiryDate) updateData.expiryDate = new Date(dto.expiryDate);

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
