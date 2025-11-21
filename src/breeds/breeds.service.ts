import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBreedDto, UpdateBreedDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

/**
 * Service for managing breeds reference data
 * Based on BACKEND_DELTA.md section 5.2
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
    this.logger.debug(`Creating breed`, { id: dto.id, nameFr: dto.nameFr, speciesId: dto.speciesId });

    try {
      const breed = await this.prisma.breed.create({
        data: {
          id: dto.id,
          speciesId: dto.speciesId,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          description: dto.description,
          displayOrder: dto.displayOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
      });

      this.logger.audit('Breed created', { breedId: breed.id, nameFr: breed.nameFr });
      return breed;
    } catch (error) {
      this.logger.error(`Failed to create breed`, error.stack);
      throw error;
    }
  }

  /**
   * Get all breeds, optionally filtered by speciesId
   * Ordered by displayOrder
   * Used for UI dropdowns
   * @param speciesId - Optional filter by species ID
   * @returns All active breeds with i18n fields
   */
  async findAll(speciesId?: string) {
    const where: any = {
      isActive: true,
    };

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
        speciesId: true,
        nameFr: true,
        nameEn: true,
        nameAr: true,
        description: true,
        displayOrder: true,
        isActive: true,
      },
    });
  }

  /**
   * Get a single breed by ID
   * @param id - Breed ID
   * @returns Breed or throws NotFoundException
   */
  async findOne(id: string) {
    const breed = await this.prisma.breed.findUnique({
      where: { id },
    });

    if (!breed) {
      throw new NotFoundException(`Breed with ID ${id} not found`);
    }

    return breed;
  }

  /**
   * Update a breed
   * @param id - Breed ID
   * @param dto - Update data
   * @returns Updated breed
   */
  async update(id: string, dto: UpdateBreedDto) {
    this.logger.debug(`Updating breed`, { id });

    // Check if breed exists
    await this.findOne(id);

    try {
      const breed = await this.prisma.breed.update({
        where: { id },
        data: {
          speciesId: dto.speciesId,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          description: dto.description,
          displayOrder: dto.displayOrder,
          isActive: dto.isActive,
        },
      });

      this.logger.audit('Breed updated', { breedId: breed.id, nameFr: breed.nameFr });
      return breed;
    } catch (error) {
      this.logger.error(`Failed to update breed`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a breed
   * @param id - Breed ID
   */
  async remove(id: string) {
    this.logger.debug(`Deleting breed`, { id });

    // Check if breed exists
    await this.findOne(id);

    try {
      await this.prisma.breed.delete({
        where: { id },
      });

      this.logger.audit('Breed deleted', { breedId: id });
    } catch (error) {
      this.logger.error(`Failed to delete breed`, error.stack);
      throw error;
    }
  }
}
