import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBreedingDto, UpdateBreedingDto, QueryBreedingDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
  BusinessRuleException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class BreedingsService {
  private readonly logger = new AppLogger(BreedingsService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateBreedingDto) {
    this.logger.debug(`Creating breeding in farm ${farmId}`, {
      motherId: dto.motherId,
      fatherId: dto.fatherId
    });

    // Verify mother belongs to farm
    const mother = await this.prisma.animal.findFirst({
      where: { id: dto.motherId, farmId, deletedAt: null },
    });

    if (!mother) {
      this.logger.warn('Mother animal not found for breeding', { motherId: dto.motherId, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.MOTHER_NOT_FOUND,
        `Mother animal ${dto.motherId} not found`,
        { motherId: dto.motherId, farmId },
      );
    }

    if (mother.sex !== 'female') {
      this.logger.warn('Breeding mother must be female', { motherId: dto.motherId, sex: mother.sex });
      throw new BusinessRuleException(
        ERROR_CODES.ANIMAL_MUST_BE_FEMALE,
        'Animal must be female',
        { animalId: dto.motherId, sex: mother.sex },
      );
    }

    // Verify father if provided
    if (dto.fatherId) {
      const father = await this.prisma.animal.findFirst({
        where: { id: dto.fatherId, farmId, deletedAt: null },
      });

      if (!father) {
        this.logger.warn('Father animal not found for breeding', { fatherId: dto.fatherId, farmId });
        throw new EntityNotFoundException(
          ERROR_CODES.FATHER_NOT_FOUND,
          `Father animal ${dto.fatherId} not found`,
          { fatherId: dto.fatherId, farmId },
        );
      }

      if (father.sex !== 'male') {
        this.logger.warn('Breeding father must be male', { fatherId: dto.fatherId, sex: father.sex });
        throw new BusinessRuleException(
          ERROR_CODES.ANIMAL_MUST_BE_MALE,
          'Animal must be male',
          { animalId: dto.fatherId, sex: father.sex },
        );
      }
    }

    try {
      const breeding = await this.prisma.breeding.create({
        data: {
          ...dto,
          farmId,
          breedingDate: new Date(dto.breedingDate),
          expectedBirthDate: new Date(dto.expectedBirthDate),
        },
        include: {
          mother: { select: { id: true, visualId: true, currentEid: true } },
          father: { select: { id: true, visualId: true, currentEid: true } },
        },
      });

      this.logger.audit('Breeding created', {
        breedingId: breeding.id,
        motherId: dto.motherId,
        fatherId: dto.fatherId,
        farmId
      });
      return breeding;
    } catch (error) {
      this.logger.error(`Failed to create breeding in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  async findAll(farmId: string, query: QueryBreedingDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.motherId) where.motherId = query.motherId;
    if (query.fatherId) where.fatherId = query.fatherId;
    if (query.status) where.status = query.status;
    if (query.fromDate || query.toDate) {
      where.breedingDate = {};
      if (query.fromDate) where.breedingDate.gte = new Date(query.fromDate);
      if (query.toDate) where.breedingDate.lte = new Date(query.toDate);
    }

    return this.prisma.breeding.findMany({
      where,
      include: {
        mother: { select: { id: true, visualId: true, currentEid: true } },
        father: { select: { id: true, visualId: true, currentEid: true } },
      },
      orderBy: { breedingDate: 'desc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const breeding = await this.prisma.breeding.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
      include: {
        mother: { select: { id: true, visualId: true, currentEid: true, birthDate: true } },
        father: { select: { id: true, visualId: true, currentEid: true } },
      },
    });

    if (!breeding) {
      this.logger.warn('Breeding not found', { breedingId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.BREEDING_NOT_FOUND,
        `Breeding ${id} not found`,
        { breedingId: id, farmId },
      );
    }

    return breeding;
  }

  async update(farmId: string, id: string, dto: UpdateBreedingDto) {
    this.logger.debug(`Updating breeding ${id} (version ${dto.version})`);

    const existing = await this.prisma.breeding.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      this.logger.warn('Breeding not found', { breedingId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.BREEDING_NOT_FOUND,
        `Breeding ${id} not found`,
        { breedingId: id, farmId },
      );
    }

    // Version conflict check
    if (dto.version && existing.version > dto.version) {
      this.logger.warn('Version conflict detected', {
        breedingId: id,
        serverVersion: existing.version,
        clientVersion: dto.version,
      });

      throw new EntityConflictException(
        ERROR_CODES.VERSION_CONFLICT,
        'Version conflict detected',
        {
          breedingId: id,
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

      if (dto.breedingDate) updateData.breedingDate = new Date(dto.breedingDate);
      if (dto.expectedBirthDate) updateData.expectedBirthDate = new Date(dto.expectedBirthDate);
      if (dto.actualBirthDate) updateData.actualBirthDate = new Date(dto.actualBirthDate);

      const updated = await this.prisma.breeding.update({
        where: { id },
        data: updateData,
        include: {
          mother: { select: { id: true, visualId: true, currentEid: true } },
          father: { select: { id: true, visualId: true, currentEid: true } },
        },
      });

      this.logger.audit('Breeding updated', {
        breedingId: id,
        farmId,
        version: `${existing.version} → ${updated.version}`,
      });

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update breeding ${id}`, error.stack);
      throw error;
    }
  }

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting breeding ${id}`);

    const existing = await this.prisma.breeding.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      this.logger.warn('Breeding not found', { breedingId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.BREEDING_NOT_FOUND,
        `Breeding ${id} not found`,
        { breedingId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.breeding.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Breeding soft deleted', { breedingId: id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete breeding ${id}`, error.stack);
      throw error;
    }
  }

  // Get upcoming birth dates
  async getUpcomingBirthDates(farmId: string, days: number = 30) {
    this.logger.debug(`Finding upcoming birth dates for farm ${farmId} (${days} days)`);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.breeding.findMany({
      where: {
        farmId,
        deletedAt: null,
        status: { in: ['confirmed', 'in_progress'] },
        expectedBirthDate: {
          gte: new Date(),
          lte: futureDate,
        },
      },
      include: {
        mother: { select: { id: true, visualId: true, currentEid: true } },
      },
      orderBy: { expectedBirthDate: 'asc' },
    });
  }
}
