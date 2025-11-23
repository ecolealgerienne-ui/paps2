import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBreedDto, UpdateBreedDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

/**
 * Service for managing breeds reference data
 * PHASE_12: Enhanced with soft delete, versioning, code field
 */
@Injectable()
export class BreedsService {
  private readonly logger = new AppLogger(BreedsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new breed
   * @param dto - Breed creation data
   * @returns Created breed
   */
  async create(dto: CreateBreedDto) {
    this.logger.debug(`Creating breed`, { code: dto.code, nameFr: dto.nameFr, speciesId: dto.speciesId });

    try {
      const breed = await this.prisma.breed.create({
        data: {
          code: dto.code,
          speciesId: dto.speciesId,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          description: dto.description,
          displayOrder: dto.displayOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
      });

      this.logger.audit('Breed created', { breedId: breed.id, code: breed.code, nameFr: breed.nameFr });
      return breed;
    } catch (error) {
      this.logger.error(`Failed to create breed`, error.stack);
      throw error;
    }
  }

  /**
   * Get all breeds, optionally filtered by speciesId
   * Ordered by displayOrder
   * Excludes soft deleted breeds (PHASE_12)
   * @param speciesId - Optional filter by species ID
   * @param includeDeleted - Include soft deleted breeds
   * @returns All active non-deleted breeds with i18n fields
   */
  async findAll(speciesId?: string, includeDeleted = false) {
    const where: any = {
      isActive: true,
    };

    // PHASE_12: Exclude soft deleted
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (speciesId) {
      where.speciesId = speciesId;
    }

    return this.prisma.breed.findMany({
      where,
      orderBy: {
        displayOrder: 'asc',
      },
      select: {
        id: true,
        code: true,
        speciesId: true,
        nameFr: true,
        nameEn: true,
        nameAr: true,
        description: true,
        displayOrder: true,
        isActive: true,
        version: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get breeds by species (uses composite index for performance)
   * PHASE_12: Uses idx_breeds_species_active index
   * @param speciesId - Species ID
   * @param activeOnly - Filter only active breeds
   * @returns Breeds for the specified species
   */
  async findBySpecies(speciesId: string, activeOnly = true) {
    const where: any = {
      speciesId,
      deletedAt: null,
    };

    if (activeOnly) {
      where.isActive = true;
    }

    // This query uses composite index: idx_breeds_species_active (speciesId, isActive, deletedAt)
    return this.prisma.breed.findMany({
      where,
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  /**
   * Get a single breed by ID
   * PHASE_12: Excludes soft deleted
   * @param id - Breed ID
   * @returns Breed or throws NotFoundException
   */
  async findOne(id: string) {
    const breed = await this.prisma.breed.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!breed) {
      throw new NotFoundException(`Breed with ID ${id} not found`);
    }

    return breed;
  }

  /**
   * Update a breed
   * PHASE_12: Implements versioning (optimistic locking)
   * @param id - Breed ID
   * @param dto - Update data
   * @param currentVersion - Current version for optimistic locking
   * @returns Updated breed
   */
  async update(id: string, dto: UpdateBreedDto, currentVersion?: number) {
    this.logger.debug(`Updating breed`, { id });

    // Check if breed exists and get current version
    const existing = await this.findOne(id);

    // PHASE_12: Versioning optimiste
    if (currentVersion !== undefined && existing.version !== currentVersion) {
      throw new ConflictException(
        `Version mismatch: expected ${currentVersion}, got ${existing.version}`,
      );
    }

    try {
      const breed = await this.prisma.breed.update({
        where: { id },
        data: {
          code: dto.code,
          speciesId: dto.speciesId,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          description: dto.description,
          displayOrder: dto.displayOrder,
          isActive: dto.isActive,
          version: { increment: 1 }, // PHASE_12: Auto-increment version
        },
      });

      this.logger.audit('Breed updated', { breedId: breed.id, code: breed.code, nameFr: breed.nameFr });
      return breed;
    } catch (error) {
      this.logger.error(`Failed to update breed`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete a breed
   * PHASE_12: Implements soft delete instead of hard delete
   * @param id - Breed ID
   * @returns Soft deleted breed
   */
  async remove(id: string) {
    this.logger.debug(`Soft deleting breed`, { id });

    // Check if breed exists
    const existing = await this.findOne(id);

    try {
      const breed = await this.prisma.breed.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: { increment: 1 },
        },
      });

      this.logger.audit('Breed soft deleted', { breedId: id, code: existing.code });
      return breed;
    } catch (error) {
      this.logger.error(`Failed to soft delete breed`, error.stack);
      throw error;
    }
  }
}
