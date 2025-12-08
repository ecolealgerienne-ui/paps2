import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnimalDto, QueryAnimalDto, UpdateAnimalDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class AnimalsService {
  private readonly logger = new AppLogger(AnimalsService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateAnimalDto) {
    this.logger.debug(`Creating animal in farm ${farmId}`, {
      eid: dto.currentEid,
      species: dto.speciesId,
    });

    try {
      const animal = await this.prisma.animal.create({
        data: {
          id: dto.id,
          farmId: dto.farmId || farmId,
          currentLocationFarmId: dto.currentLocationFarmId,
          currentEid: dto.currentEid,
          officialNumber: dto.officialNumber,
          visualId: dto.visualId,
          eidHistory: dto.eidHistory ? JSON.stringify(dto.eidHistory) : null,
          birthDate: new Date(dto.birthDate),
          sex: dto.sex,
          motherId: dto.motherId,
          fatherId: dto.fatherId,
          speciesId: dto.speciesId,
          breedId: dto.breedId,
          status: dto.status || 'alive',
          validatedAt: dto.validatedAt ? new Date(dto.validatedAt) : null,
          photoUrl: dto.photoUrl,
          notes: dto.notes,
          days: dto.days,
          // CRITICAL: Use client timestamps if provided (offline-first)
          ...(dto.created_at && { createdAt: new Date(dto.created_at) }),
          ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
        },
        include: {
          species: true,
          breed: true,
          mother: true,
        },
      });

      this.logger.audit('Animal created', {
        animalId: animal.id,
        farmId,
        species: dto.speciesId,
        eid: dto.currentEid,
      });

      return animal;
    } catch (error) {
      this.logger.error(
        `Failed to create animal in farm ${farmId}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(farmId: string, query: QueryAnimalDto) {
    const { status, speciesId, breedId, sex, search, page, limit, sort, order } =
      query;

    const where = {
      farmId,
      deletedAt: null,
      ...(status && { status }),
      ...(speciesId && { speciesId }),
      ...(breedId && { breedId }),
      ...(sex && { sex }),
      ...(search && {
        OR: [
          { currentEid: { contains: search, mode: 'insensitive' as const } },
          {
            officialNumber: { contains: search, mode: 'insensitive' as const },
          },
          { visualId: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [animals, total] = await Promise.all([
      this.prisma.animal.findMany({
        where,
        include: {
          species: true,
          breed: true,
        },
        orderBy: { [sort || 'createdAt']: order || 'desc' },
        skip: ((page || 1) - 1) * (limit || 50),
        take: limit || 50,
      }),
      this.prisma.animal.count({ where }),
    ]);

    return {
      data: animals,
      meta: {
        page: page || 1,
        limit: limit || 50,
        total,
        totalPages: Math.ceil(total / (limit || 50)),
      },
    };
  }

  async findOne(farmId: string, id: string) {
    this.logger.debug(`Finding animal ${id} in farm ${farmId}`);

    const animal = await this.prisma.animal.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
      include: {
        species: true,
        breed: true,
        mother: true,
        children: true,
      },
    });

    if (!animal) {
      this.logger.warn('Animal not found', { animalId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.ANIMAL_NOT_FOUND,
        `Animal ${id} not found`,
        { animalId: id, farmId },
      );
    }

    return animal;
  }

  async update(farmId: string, id: string, dto: UpdateAnimalDto) {
    this.logger.debug(`Updating animal ${id} (version ${dto.version})`);

    const existing = await this.findOne(farmId, id);

    // Version conflict check
    if (dto.version && existing.version > dto.version) {
      this.logger.warn('Version conflict detected', {
        animalId: id,
        serverVersion: existing.version,
        clientVersion: dto.version,
      });

      throw new EntityConflictException(
        ERROR_CODES.VERSION_CONFLICT,
        'Version conflict detected',
        {
          animalId: id,
          serverVersion: existing.version,
          clientVersion: dto.version,
        },
      );
    }

    try {
      const updated = await this.prisma.animal.update({
        where: { id },
        data: {
          ...(dto.currentLocationFarmId !== undefined && { currentLocationFarmId: dto.currentLocationFarmId }),
          ...(dto.currentEid !== undefined && { currentEid: dto.currentEid }),
          ...(dto.officialNumber !== undefined && { officialNumber: dto.officialNumber }),
          ...(dto.visualId !== undefined && { visualId: dto.visualId }),
          ...(dto.eidHistory !== undefined && { eidHistory: dto.eidHistory ? JSON.stringify(dto.eidHistory) : null }),
          ...(dto.birthDate && { birthDate: new Date(dto.birthDate) }),
          ...(dto.sex && { sex: dto.sex }),
          ...(dto.motherId !== undefined && { motherId: dto.motherId }),
          ...(dto.fatherId !== undefined && { fatherId: dto.fatherId }),
          ...(dto.speciesId !== undefined && { speciesId: dto.speciesId }),
          ...(dto.breedId !== undefined && { breedId: dto.breedId }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.validatedAt !== undefined && { validatedAt: dto.validatedAt ? new Date(dto.validatedAt) : null }),
          ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          ...(dto.days !== undefined && { days: dto.days }),
          // CRITICAL: Use client timestamp if provided (offline-first)
          ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
          version: { increment: 1 },
        },
        include: {
          species: true,
          breed: true,
          mother: true,
        },
      });

      this.logger.audit('Animal updated', {
        animalId: id,
        farmId,
        version: `${existing.version} → ${updated.version}`,
      });

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update animal ${id}`, error.stack);
      throw error;
    }
  }

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting animal ${id}`);

    await this.findOne(farmId, id);

    try {
      const deleted = await this.prisma.animal.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      this.logger.audit('Animal soft deleted', {
        animalId: id,
        farmId,
      });

      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete animal ${id}`, error.stack);
      throw error;
    }
  }
}
