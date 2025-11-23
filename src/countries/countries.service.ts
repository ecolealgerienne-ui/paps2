import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

// Type temporaire pour Country jusqu'à régénération du client Prisma
type Country = {
  code: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  region: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Service for managing countries reference data
 * PHASE_04: ISO 3166-1 countries with multi-language support
 */
@Injectable()
export class CountriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new country
   * @param dto - Country creation data
   * @returns Created country
   */
  async create(dto: CreateCountryDto): Promise<Country> {
    // Vérifier code unique
    const existing = await this.prisma.country.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`Country with code "${dto.code}" already exists`);
    }

    return this.prisma.country.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(), // Forcer majuscules
      },
    });
  }

  /**
   * Get all countries with optional filters
   * @param region - Filter by region
   * @param includeInactive - Include inactive countries
   * @returns List of countries
   */
  async findAll(region?: string, includeInactive = false): Promise<Country[]> {
    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (region) {
      where.region = region;
    }

    return this.prisma.country.findMany({
      where,
      orderBy: [
        { region: 'asc' },
        { nameFr: 'asc' },
      ],
    });
  }

  /**
   * Get countries by region
   * @param region - Region name
   * @returns Countries in the specified region
   */
  async findByRegion(region: string): Promise<Country[]> {
    return this.prisma.country.findMany({
      where: { region, isActive: true },
      orderBy: { nameFr: 'asc' },
    });
  }

  /**
   * Get a single country by code
   * @param code - ISO 3166-1 alpha-2 code
   * @returns Country or throws NotFoundException
   */
  async findOne(code: string): Promise<Country> {
    const country = await this.prisma.country.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!country) {
      throw new NotFoundException(`Country with code "${code}" not found`);
    }

    return country;
  }

  /**
   * Update a country
   * @param code - ISO 3166-1 alpha-2 code
   * @param dto - Update data
   * @returns Updated country
   */
  async update(code: string, dto: UpdateCountryDto): Promise<Country> {
    await this.findOne(code);

    return this.prisma.country.update({
      where: { code: code.toUpperCase() },
      data: dto,
    });
  }

  /**
   * Toggle active status of a country
   * @param code - ISO 3166-1 alpha-2 code
   * @param isActive - New active status
   * @returns Updated country
   */
  async toggleActive(code: string, isActive: boolean): Promise<Country> {
    await this.findOne(code);

    return this.prisma.country.update({
      where: { code: code.toUpperCase() },
      data: { isActive },
    });
  }

  /**
   * Delete a country (hard delete)
   * @param code - ISO 3166-1 alpha-2 code
   * @returns Deleted country
   */
  async remove(code: string): Promise<Country> {
    const country = await this.findOne(code);

    // Vérifier utilisation dans les tables de liaison
    const usageCount = await this.checkUsage(code);

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete country "${code}": used in ${usageCount} breed/product/vaccine/campaign liaisons. Deactivate instead.`
      );
    }

    return this.prisma.country.delete({
      where: { code: code.toUpperCase() },
    });
  }

  /**
   * Check if country is used in liaison tables
   * @param code - ISO 3166-1 alpha-2 code
   * @returns Total usage count
   */
  private async checkUsage(code: string): Promise<number> {
    // Note: Tables de liaison seront créées dans BLOC 3 (Phases 16-19)
    // Pour l'instant, on retourne 0
    // TODO: Activer ces vérifications après PHASE_16, 17, 18, 19

    // const [breeds, products, vaccines, campaigns] = await Promise.all([
    //   this.prisma.breedCountry.count({ where: { countryCode: code } }),
    //   this.prisma.productCountry.count({ where: { countryCode: code } }),
    //   this.prisma.vaccineCountry.count({ where: { countryCode: code } }),
    //   this.prisma.campaignCountry.count({ where: { countryCode: code } }),
    // ]);
    // return breeds + products + vaccines + campaigns;

    return 0; // Temporaire jusqu'à création des tables de liaison
  }

  /**
   * Get list of available regions
   * @returns Distinct list of regions
   */
  async getRegions(): Promise<string[]> {
    const regions = await this.prisma.country.findMany({
      where: { isActive: true },
      select: { region: true },
      distinct: ['region'],
      orderBy: { region: 'asc' },
    });

    return regions.map(r => r.region).filter(r => r !== null);
  }
}
