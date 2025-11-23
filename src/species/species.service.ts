import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpeciesDto, UpdateSpeciesDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

// Type temporaire pour Species jusqu'à régénération du client Prisma
type Species = {
  id: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  displayOrder: number;
  description: string | null;
  version: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Service for managing species reference data
 * PHASE_01: Added soft delete, versioning, timestamps
 */
@Injectable()
export class SpeciesService {
  private readonly logger = new AppLogger(SpeciesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new species
   * @param dto - Species creation data
   * @returns Created species
   */
  async create(dto: CreateSpeciesDto): Promise<Species> {
    this.logger.debug(`Creating species`, { id: dto.id, nameFr: dto.nameFr });

    try {
      // Vérifier si l'ID existe déjà
      const existing = await this.prisma.species.findUnique({
        where: { id: dto.id },
      });

      if (existing && !existing.deletedAt) {
        throw new ConflictException(`Species with id "${dto.id}" already exists`);
      }

      // Si existait et était soft-deleted, le restaurer
      if (existing && existing.deletedAt) {
        this.logger.debug(`Restoring soft-deleted species`, { id: dto.id });
        const species = await this.prisma.species.update({
          where: { id: dto.id },
          data: {
            ...dto,
            deletedAt: null,
            version: existing.version + 1,
          },
        });
        this.logger.audit('Species restored on create', { speciesId: species.id, nameFr: species.nameFr });
        return species;
      }

      // Créer nouvelle espèce
      const species = await this.prisma.species.create({
        data: {
          id: dto.id,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          icon: dto.icon || '',
          displayOrder: dto.displayOrder ?? 0,
          description: dto.description,
        },
      });

      this.logger.audit('Species created', { speciesId: species.id, nameFr: species.nameFr });
      return species;
    } catch (error) {
      this.logger.error(`Failed to create species`, error.stack);
      throw error;
    }
  }

  /**
   * Get all species ordered by nameFr
   * @param includeDeleted - Include soft-deleted species
   * @returns All species (active or all if includeDeleted=true)
   */
  async findAll(includeDeleted = false): Promise<Species[]> {
    return this.prisma.species.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      orderBy: {
        nameFr: 'asc',
      },
    });
  }

  /**
   * Get a single species by ID
   * @param id - Species ID
   * @param includeDeleted - Include soft-deleted species
   * @returns Species or throws NotFoundException
   */
  async findOne(id: string, includeDeleted = false): Promise<Species> {
    const species = await this.prisma.species.findUnique({
      where: { id },
    });

    if (!species || (!includeDeleted && species.deletedAt)) {
      throw new NotFoundException(`Species with id "${id}" not found`);
    }

    return species;
  }

  /**
   * Update a species (with optimistic locking)
   * @param id - Species ID
   * @param dto - Update data
   * @returns Updated species
   */
  async update(id: string, dto: UpdateSpeciesDto): Promise<Species> {
    this.logger.debug(`Updating species`, { id });

    try {
      // Check if species exists
      const existing = await this.findOne(id);

      // Optimistic locking
      if (dto.version !== undefined && existing.version !== dto.version) {
        throw new ConflictException(
          `Version conflict: expected ${dto.version}, found ${existing.version}`
        );
      }

      const species = await this.prisma.species.update({
        where: { id },
        data: {
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          icon: dto.icon,
          displayOrder: dto.displayOrder,
          description: dto.description,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Species updated', { speciesId: species.id, nameFr: species.nameFr, newVersion: species.version });
      return species;
    } catch (error) {
      this.logger.error(`Failed to update species`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete a species
   * @param id - Species ID
   * @returns Soft-deleted species
   */
  async remove(id: string): Promise<Species> {
    this.logger.debug(`Soft deleting species`, { id });

    try {
      // Check if species exists
      const existing = await this.findOne(id);

      // Vérifier si utilisé par des breeds ou animals
      const usageCount = await this.prisma.breed.count({
        where: { speciesId: id, deletedAt: null },
      });

      if (usageCount > 0) {
        throw new ConflictException(
          `Cannot delete species "${id}": ${usageCount} active breeds depend on it`
        );
      }

      const species = await this.prisma.species.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Species soft deleted', { speciesId: id, newVersion: species.version });
      return species;
    } catch (error) {
      this.logger.error(`Failed to delete species`, error.stack);
      throw error;
    }
  }

  /**
   * Restore a soft-deleted species
   * @param id - Species ID
   * @returns Restored species
   */
  async restore(id: string): Promise<Species> {
    this.logger.debug(`Restoring species`, { id });

    try {
      const species = await this.prisma.species.findUnique({
        where: { id },
      });

      if (!species) {
        throw new NotFoundException(`Species with id "${id}" not found`);
      }

      if (!species.deletedAt) {
        throw new ConflictException(`Species "${id}" is not deleted`);
      }

      const restored = await this.prisma.species.update({
        where: { id },
        data: {
          deletedAt: null,
          version: species.version + 1,
        },
      });

      this.logger.audit('Species restored', { speciesId: id, newVersion: restored.version });
      return restored;
    } catch (error) {
      this.logger.error(`Failed to restore species`, error.stack);
      throw error;
    }
  }
}
