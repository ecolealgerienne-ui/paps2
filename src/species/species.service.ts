import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpeciesDto, UpdateSpeciesDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { createLangUpdateData } from '../common/utils/i18n.helper';

/**
 * Service for managing species reference data
 * Based on BACKEND_DELTA.md section 5.1
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
  async create(dto: CreateSpeciesDto) {
    this.logger.debug(`Creating species`, { id: dto.id, name: dto.name, lang: dto.lang });

    try {
      // Map language to correct column
      const langData = createLangUpdateData(dto.name, dto.lang);

      const species = await this.prisma.species.create({
        data: {
          id: dto.id,
          ...langData,
          // Initialize other languages as empty strings if not provided
          nameFr: langData.nameFr || '',
          nameEn: langData.nameEn || '',
          nameAr: langData.nameAr || '',
          icon: dto.icon || '',
          displayOrder: dto.displayOrder ?? 0,
        },
      });

      this.logger.audit('Species created', { speciesId: species.id, lang: dto.lang });
      return species;
    } catch (error) {
      this.logger.error(`Failed to create species`, error.stack);
      throw error;
    }
  }

  /**
   * Get all species ordered by displayOrder
   * Used for UI dropdowns
   * @returns All active species with i18n fields
   */
  async findAll() {
    return this.prisma.species.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
      select: {
        id: true,
        nameFr: true,
        nameEn: true,
        nameAr: true,
        icon: true,
        displayOrder: true,
      },
    });
  }

  /**
   * Get a single species by ID
   * @param id - Species ID
   * @returns Species or throws NotFoundException
   */
  async findOne(id: string) {
    const species = await this.prisma.species.findUnique({
      where: { id },
    });

    if (!species) {
      throw new NotFoundException(`Species with ID ${id} not found`);
    }

    return species;
  }

  /**
   * Update a species
   * @param id - Species ID
   * @param dto - Update data
   * @returns Updated species
   */
  async update(id: string, dto: UpdateSpeciesDto) {
    this.logger.debug(`Updating species`, { id });

    // Check if species exists
    await this.findOne(id);

    // Validate: if name is provided, lang must be provided too
    if (dto.name && !dto.lang) {
      throw new BadRequestException('Language code (lang) is required when updating name');
    }

    try {
      // Build update data
      const updateData: any = {};

      // Handle language-specific name update
      if (dto.name && dto.lang) {
        const langData = createLangUpdateData(dto.name, dto.lang);
        Object.assign(updateData, langData);
      }

      // Handle other fields
      if (dto.icon !== undefined) updateData.icon = dto.icon;
      if (dto.displayOrder !== undefined) updateData.displayOrder = dto.displayOrder;

      const species = await this.prisma.species.update({
        where: { id },
        data: updateData,
      });

      this.logger.audit('Species updated', { speciesId: species.id, lang: dto.lang });
      return species;
    } catch (error) {
      this.logger.error(`Failed to update species`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a species
   * @param id - Species ID
   */
  async remove(id: string) {
    this.logger.debug(`Deleting species`, { id });

    // Check if species exists
    await this.findOne(id);

    try {
      await this.prisma.species.delete({
        where: { id },
      });

      this.logger.audit('Species deleted', { speciesId: id });
    } catch (error) {
      this.logger.error(`Failed to delete species`, error.stack);
      throw error;
    }
  }
}
