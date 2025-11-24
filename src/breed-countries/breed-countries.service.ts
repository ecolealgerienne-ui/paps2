import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/utils/logger.service';

/**
 * Service for managing Breed-Country associations
 * PHASE_16: BreedCountries
 */
@Injectable()
export class BreedCountriesService {
  private readonly logger = new AppLogger(BreedCountriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all countries associated with a breed
   * @param breedId - Breed UUID
   * @returns List of countries with association details
   */
  async findCountriesByBreed(breedId: string) {
    this.logger.debug('Finding countries for breed', { breedId });

    // Verify breed exists
    const breed = await this.prisma.breed.findFirst({
      where: { id: breedId, deletedAt: null },
    });

    if (!breed) {
      throw new NotFoundException(`Breed with ID ${breedId} not found`);
    }

    const associations = await this.prisma.breedCountry.findMany({
      where: {
        breedId,
        isActive: true,
      },
      include: {
        country: true,
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
          },
        },
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
  async findBreedsByCountry(countryCode: string) {
    this.logger.debug('Finding breeds for country', { countryCode });

    // Verify country exists
    const country = await this.prisma.country.findUnique({
      where: { code: countryCode },
    });

    if (!country) {
      throw new NotFoundException(`Country with code ${countryCode} not found`);
    }

    const associations = await this.prisma.breedCountry.findMany({
      where: {
        countryCode,
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
            deletedAt: true,
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

    // Filter out deleted breeds
    const activeAssociations = associations.filter(a => !a.breed.deletedAt);

    this.logger.debug('Found breeds for country', {
      countryCode,
      count: activeAssociations.length,
    });

    return activeAssociations;
  }

  /**
   * Link a breed to a country
   * @param breedId - Breed UUID
   * @param countryCode - Country code (ISO 3166-1 alpha-2)
   * @returns Created association
   */
  async link(breedId: string, countryCode: string) {
    this.logger.debug('Linking breed to country', { breedId, countryCode });

    // Verify breed exists
    const breed = await this.prisma.breed.findFirst({
      where: { id: breedId, deletedAt: null },
    });

    if (!breed) {
      throw new NotFoundException(`Breed with ID ${breedId} not found`);
    }

    // Verify country exists
    const country = await this.prisma.country.findUnique({
      where: { code: countryCode },
    });

    if (!country) {
      throw new NotFoundException(`Country with code ${countryCode} not found`);
    }

    // Check if association already exists
    const existing = await this.prisma.breedCountry.findFirst({
      where: {
        breedId,
        countryCode,
      },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException(
          `Breed ${breedId} is already linked to country ${countryCode}`,
        );
      } else {
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
        });

        return reactivated;
      }
    }

    // Create new association
    try {
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
    } catch (error) {
      this.logger.error('Failed to link breed to country', error.stack);
      throw error;
    }
  }

  /**
   * Unlink a breed from a country
   * @param breedId - Breed UUID
   * @param countryCode - Country code (ISO 3166-1 alpha-2)
   * @returns Deleted/deactivated association
   */
  async unlink(breedId: string, countryCode: string) {
    this.logger.debug('Unlinking breed from country', { breedId, countryCode });

    const association = await this.prisma.breedCountry.findFirst({
      where: {
        breedId,
        countryCode,
        isActive: true,
      },
    });

    if (!association) {
      throw new NotFoundException(
        `Active association between breed ${breedId} and country ${countryCode} not found`,
      );
    }

    // Soft delete by setting isActive to false
    const updated = await this.prisma.breedCountry.update({
      where: { id: association.id },
      data: { isActive: false },
    });

    this.logger.audit('Breed-Country association deactivated', {
      breedId,
      countryCode,
      associationId: association.id,
    });

    return updated;
  }

  /**
   * Find all associations (for admin purposes)
   * @returns All breed-country associations
   */
  async findAll(includeInactive = false) {
    this.logger.debug('Finding all breed-country associations', {
      includeInactive,
    });

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const associations = await this.prisma.breedCountry.findMany({
      where,
      include: {
        breed: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            deletedAt: true,
          },
        },
        country: true,
      },
      orderBy: [
        { breed: { nameFr: 'asc' } },
        { country: { nameFr: 'asc' } },
      ],
    });

    // Filter out deleted breeds
    const activeAssociations = associations.filter(a => !a.breed.deletedAt);

    return activeAssociations;
  }
}
