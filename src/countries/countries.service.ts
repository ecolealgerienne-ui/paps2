import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCountryDto, UpdateCountryDto, CountryResponseDto } from './dto';

interface FindAllOptions {
  page?: number;
  limit?: number;
  region?: string;
  isActive?: boolean;
  search?: string;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

interface PaginatedResponse {
  data: CountryResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable()
export class CountriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCountryDto): Promise<CountryResponseDto> {
    // Vérifier code unique
    const existing = await this.prisma.country.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      // TODO I18n: Replace with i18n key 'errors.country_code_duplicate'
      throw new ConflictException(`Country with code "${dto.code}" already exists`);
    }

    return this.prisma.country.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(), // Force uppercase for ISO codes
      },
    });
  }

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResponse> {
    const {
      page = 1,
      limit = 20,
      region,
      isActive,
      search,
      orderBy = 'nameFr',
      order = 'ASC',
    } = options;

    // Build where clause
    const where: Prisma.CountryWhereInput = {};

    // Filter by active status (default: active only)
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Filter by region
    if (region) {
      where.region = region;
    }

    // Search in country names (fr, en, ar, code)
    if (search) {
      where.OR = [
        { nameFr: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { code: { contains: search.toUpperCase(), mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    const orderByClause = this.buildOrderBy(orderBy, order);

    // Get total count
    const total = await this.prisma.country.count({ where });

    // Get paginated data
    const skip = (page - 1) * limit;
    const data = await this.prisma.country.findMany({
      where,
      orderBy: orderByClause,
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findByRegion(region: string): Promise<CountryResponseDto[]> {
    return this.prisma.country.findMany({
      where: { region, isActive: true },
      orderBy: { nameFr: 'asc' },
    });
  }

  async findOne(code: string): Promise<CountryResponseDto> {
    const country = await this.prisma.country.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!country) {
      // TODO I18n: Replace with i18n key 'errors.country_not_found'
      throw new NotFoundException(`Country with code "${code}" not found`);
    }

    return country;
  }

  async update(code: string, dto: UpdateCountryDto): Promise<CountryResponseDto> {
    // Verify country exists
    await this.findOne(code);

    return this.prisma.country.update({
      where: { code: code.toUpperCase() },
      data: dto,
    });
  }

  async toggleActive(code: string, isActive: boolean): Promise<CountryResponseDto> {
    // Verify country exists
    await this.findOne(code);

    return this.prisma.country.update({
      where: { code: code.toUpperCase() },
      data: { isActive },
    });
  }

  async remove(code: string): Promise<CountryResponseDto> {
    const country = await this.findOne(code);

    // Vérifier utilisation dans les tables de liaison
    const usageCount = await this.checkUsage(code);

    if (usageCount > 0) {
      // TODO I18n: Replace with i18n key 'errors.country_in_use'
      throw new ConflictException(
        `Cannot delete country "${code}": used in ${usageCount} related entities (breeds, campaigns, products). Please deactivate instead.`
      );
    }

    // Hard delete (no soft delete in Country model)
    await this.prisma.country.delete({
      where: { code: code.toUpperCase() },
    });

    return country;
  }

  /**
   * Get list of distinct regions
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

  /**
   * Check if country is used in related entities
   * @private
   */
  private async checkUsage(code: string): Promise<number> {
    const upperCode = code.toUpperCase();

    // Count usage in ProductPackaging
    const packagings = await this.prisma.productPackaging.count({
      where: { countryCode: upperCode }
    });

    // Count usage in BreedCountry
    const breedCountries = await this.prisma.breedCountry.count({
      where: { countryCode: upperCode }
    });

    // Count usage in CampaignCountry
    const campaignCountries = await this.prisma.campaignCountry.count({
      where: { countryCode: upperCode }
    });

    // Count usage in TherapeuticIndication
    const therapeuticIndications = await this.prisma.therapeuticIndication.count({
      where: { countryCode: upperCode }
    });

    return packagings + breedCountries + campaignCountries + therapeuticIndications;
  }

  /**
   * Build Prisma orderBy clause
   * @private
   */
  private buildOrderBy(orderBy: string, order: 'ASC' | 'DESC'): Prisma.CountryOrderByWithRelationInput[] {
    const direction = order.toLowerCase() as 'asc' | 'desc';

    // Whitelist of allowed sort fields
    const allowedFields = ['nameFr', 'nameEn', 'nameAr', 'region', 'code', 'createdAt', 'updatedAt'];

    if (!allowedFields.includes(orderBy)) {
      orderBy = 'nameFr'; // Default fallback
    }

    return [{ [orderBy]: direction }];
  }
}
