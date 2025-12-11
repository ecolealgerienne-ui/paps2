import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { BreedCountryResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

export interface FindAllOptions {
  page?: number;
  limit?: number;
  breedId?: string;
  countryCode?: string;
  isActive?: boolean;
  search?: string;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse {
  data: BreedCountryResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Service for managing Breed-Country associations
 * PHASE_16: BreedCountries - Migrated to /api/v1 with pagination and search
 */
@Injectable()
export class BreedCountriesService {
  private readonly logger = new AppLogger(BreedCountriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all breed-country associations with pagination, filters, search, and sorting
   * @param options - Query options
   * @returns Paginated associations list
   */
  async findAll(options: FindAllOptions = {}): Promise<PaginatedResponse> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 50));
    const skip = (page - 1) * limit;

    const where: Prisma.BreedCountryWhereInput = {};

    // Filters
    if (options.breedId) where.breedId = options.breedId;
    if (options.countryCode) where.countryCode = options.countryCode;
    if (options.isActive !== undefined) where.isActive = options.isActive;

    // Filter out deleted breeds
    where.breed = { deletedAt: null };

    // Search in breed code, breed names, country code, country names
    if (options.search) {
      const searchTerm = options.search;
      where.OR = [
        { breed: { code: { contains: searchTerm, mode: 'insensitive' } } },
        { breed: { nameFr: { contains: searchTerm, mode: 'insensitive' } } },
        { breed: { nameEn: { contains: searchTerm, mode: 'insensitive' } } },
        { breed: { nameAr: { contains: searchTerm, mode: 'insensitive' } } },
        { country: { code: { contains: searchTerm, mode: 'insensitive' } } },
        { country: { nameFr: { contains: searchTerm, mode: 'insensitive' } } },
        { country: { nameEn: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    const orderBy = this.buildOrderBy(options.orderBy, options.order);

    const [total, data] = await Promise.all([
      this.prisma.breedCountry.count({ where }),
      this.prisma.breedCountry.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          breed: {
            select: {
              id: true,
              code: true,
              nameFr: true,
              nameEn: true,
              nameAr: true,
            },
          },
          country: true,
        },
      }),
    ]);

    this.logger.debug(`Found ${total} breed-country associations (page ${page}/${Math.ceil(total / limit)})`);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private buildOrderBy(
    field?: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ): Prisma.BreedCountryOrderByWithRelationInput[] {
    const allowedFields = ['createdAt', 'updatedAt', 'isActive'];

    if (field && allowedFields.includes(field)) {
      return [{ [field]: order.toLowerCase() as Prisma.SortOrder }];
    }

    // Default: sort by breed name, then country name
    return [
      { breed: { nameFr: 'asc' } },
      { country: { nameFr: 'asc' } },
    ];
  }

  /**
   * Find all countries associated with a breed
   * @param breedId - Breed UUID
   * @returns List of countries with association details
   */
  async findCountriesByBreed(breedId: string): Promise<BreedCountryResponseDto[]> {
    this.logger.debug('Finding countries for breed', { breedId });

    // Verify breed exists
    const breed = await this.prisma.breed.findFirst({
      where: { id: breedId, deletedAt: null },
    });

    if (!breed) {
      this.logger.warn(`Breed not found: ${breedId}`);
      throw new NotFoundException(`Breed with ID "${breedId}" not found`);
    }

    const associations = await this.prisma.breedCountry.findMany({
      where: {
        breedId,
        isActive: true,
      },
      include: {
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
          },
        },
        country: true,
      },
      orderBy: {
        country: {
          nameFr: 'asc',
        },
      },
    });

    this.logger.debug('Found countries for breed', {
      breedId,
      count: associations.length,
    });

    return associations;
  }

  /**
   * Find all breeds associated with a country
   * @param countryCode - Country code (ISO 3166-1 alpha-2)
   * @returns List of breeds with association details
   */
  async findBreedsByCountry(countryCode: string): Promise<BreedCountryResponseDto[]> {
    this.logger.debug('Finding breeds for country', { countryCode });

    // Verify country exists
    const country = await this.prisma.country.findUnique({
      where: { code: countryCode },
    });

    if (!country) {
      this.logger.warn(`Country not found: ${countryCode}`);
      throw new NotFoundException(`Country with code "${countryCode}" not found`);
    }

    const associations = await this.prisma.breedCountry.findMany({
      where: {
        countryCode,
        isActive: true,
        breed: { deletedAt: null },
      },
      include: {
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
          },
        },
        country: true,
      },
      orderBy: {
        breed: {
          nameFr: 'asc',
        },
      },
    });

    this.logger.debug('Found breeds for country', {
      countryCode,
      count: associations.length,
    });

    return associations;
  }

  /**
   * Get a single association by ID
   * @param id - Association ID
   * @returns Association or throws NotFoundException
   */
  async findOne(id: string): Promise<BreedCountryResponseDto> {
    const association = await this.prisma.breedCountry.findFirst({
      where: { id, isActive: true },
      include: {
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
          },
        },
        country: true,
      },
    });

    if (!association) {
      this.logger.warn(`Association not found: ${id}`);
      throw new NotFoundException(`Breed-Country association with ID "${id}" not found`);
    }

    return association;
  }

  /**
   * Link a breed to a country
   * @param breedId - Breed UUID
   * @param countryCode - Country code (ISO 3166-1 alpha-2)
   * @returns Created or reactivated association
   */
  async link(breedId: string, countryCode: string): Promise<BreedCountryResponseDto> {
    this.logger.debug('Linking breed to country', { breedId, countryCode });

    // Verify breed exists
    const breed = await this.prisma.breed.findFirst({
      where: { id: breedId, deletedAt: null },
    });

    if (!breed) {
      this.logger.warn(`Breed not found: ${breedId}`);
      throw new NotFoundException(`Breed with ID "${breedId}" not found`);
    }

    // Verify country exists
    const country = await this.prisma.country.findUnique({
      where: { code: countryCode },
    });

    if (!country) {
      this.logger.warn(`Country not found: ${countryCode}`);
      throw new NotFoundException(`Country with code "${countryCode}" not found`);
    }

    // Check if association already exists
    const existing = await this.prisma.breedCountry.findUnique({
      where: {
        breedId_countryCode: { breedId, countryCode },
      },
    });

    if (existing && existing.isActive) {
      throw new ConflictException(
        `Breed "${breed.code}" is already linked to country "${countryCode}"`,
      );
    }

    if (existing && !existing.isActive) {
      // Reactivate existing association
      const reactivated = await this.prisma.breedCountry.update({
        where: { id: existing.id },
        data: { isActive: true },
        include: {
          breed: {
            select: {
              id: true,
              code: true,
              nameFr: true,
              nameEn: true,
              nameAr: true,
            },
          },
          country: true,
        },
      });

      this.logger.audit('Breed-Country association reactivated', {
        breedId,
        countryCode,
        associationId: reactivated.id,
      });

      return reactivated;
    }

    // Create new association
    const association = await this.prisma.breedCountry.create({
      data: {
        breedId,
        countryCode,
      },
      include: {
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
          },
        },
        country: true,
      },
    });

    this.logger.audit('Breed-Country association created', {
      breedId,
      countryCode,
      associationId: association.id,
    });

    return association;
  }

  /**
   * Unlink a breed from a country (deactivate)
   * @param breedId - Breed UUID
   * @param countryCode - Country code (ISO 3166-1 alpha-2)
   * @returns Deactivated association
   */
  async unlink(breedId: string, countryCode: string): Promise<BreedCountryResponseDto> {
    this.logger.debug('Unlinking breed from country', { breedId, countryCode });

    const association = await this.prisma.breedCountry.findFirst({
      where: {
        breedId,
        countryCode,
        isActive: true,
      },
    });

    if (!association) {
      this.logger.warn(`Active association not found: ${breedId} - ${countryCode}`);
      throw new NotFoundException(
        `Active association between breed "${breedId}" and country "${countryCode}" not found`,
      );
    }

    // Deactivate by setting isActive to false
    const updated = await this.prisma.breedCountry.update({
      where: { id: association.id },
      data: { isActive: false },
      include: {
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
          },
        },
        country: true,
      },
    });

    this.logger.audit('Breed-Country association deactivated', {
      breedId,
      countryCode,
      associationId: association.id,
    });

    return updated;
  }

  /**
   * Restore a deactivated association
   * @param id - Association ID
   * @returns Restored association
   */
  async restore(id: string): Promise<BreedCountryResponseDto> {
    this.logger.debug(`Restoring breed-country association ${id}`);

    const association = await this.prisma.breedCountry.findUnique({
      where: { id },
    });

    if (!association) {
      this.logger.warn(`Association not found for restore: ${id}`);
      throw new NotFoundException(`Breed-Country association with ID "${id}" not found`);
    }

    if (association.isActive) {
      throw new ConflictException(`Association "${id}" is not deactivated`);
    }

    const restored = await this.prisma.breedCountry.update({
      where: { id },
      data: { isActive: true },
      include: {
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
          },
        },
        country: true,
      },
    });

    this.logger.audit('Breed-Country association restored', { associationId: id });
    return restored;
  }
}
