import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CampaignCountryResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

export interface FindAllOptions {
  page?: number;
  limit?: number;
  campaignId?: string;
  countryCode?: string;
  isActive?: boolean;
  search?: string;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse {
  data: CampaignCountryResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Service for managing NationalCampaign-Country associations
 * PHASE_19: CampaignCountries - Migrated to /api/v1 with pagination and search
 */
@Injectable()
export class CampaignCountriesService {
  private readonly logger = new AppLogger(CampaignCountriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all campaign-country associations with pagination, filters, search, and sorting
   * @param options - Query options
   * @returns Paginated associations list
   */
  async findAll(options: FindAllOptions = {}): Promise<PaginatedResponse> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 50));
    const skip = (page - 1) * limit;

    const where: Prisma.CampaignCountryWhereInput = {};

    // Filters
    if (options.campaignId) where.campaignId = options.campaignId;
    if (options.countryCode) where.countryCode = options.countryCode;
    if (options.isActive !== undefined) where.isActive = options.isActive;

    // Filter out deleted campaigns
    where.campaign = { deletedAt: null };

    // Search in campaign code, campaign names, country code, country names
    if (options.search) {
      const searchTerm = options.search;
      where.OR = [
        { campaign: { code: { contains: searchTerm, mode: 'insensitive' } } },
        { campaign: { nameFr: { contains: searchTerm, mode: 'insensitive' } } },
        { campaign: { nameEn: { contains: searchTerm, mode: 'insensitive' } } },
        { campaign: { nameAr: { contains: searchTerm, mode: 'insensitive' } } },
        { country: { code: { contains: searchTerm, mode: 'insensitive' } } },
        { country: { nameFr: { contains: searchTerm, mode: 'insensitive' } } },
        { country: { nameEn: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    const orderBy = this.buildOrderBy(options.orderBy, options.order);

    const [total, data] = await Promise.all([
      this.prisma.campaignCountry.count({ where }),
      this.prisma.campaignCountry.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          campaign: {
            select: {
              id: true,
              code: true,
              nameFr: true,
              nameEn: true,
              nameAr: true,
              type: true,
            },
          },
          country: true,
        },
      }),
    ]);

    this.logger.debug(`Found ${total} campaign-country associations (page ${page}/${Math.ceil(total / limit)})`);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private buildOrderBy(
    field?: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ): Prisma.CampaignCountryOrderByWithRelationInput[] {
    const allowedFields = ['createdAt', 'updatedAt', 'isActive'];

    if (field && allowedFields.includes(field)) {
      return [{ [field]: order.toLowerCase() as Prisma.SortOrder }];
    }

    // Default: sort by campaign name, then country name
    return [
      { campaign: { nameFr: 'asc' } },
      { country: { nameFr: 'asc' } },
    ];
  }

  /**
   * Find all countries associated with a campaign
   * @param campaignId - Campaign UUID
   * @returns List of countries with association details
   */
  async findCountriesByCampaign(campaignId: string): Promise<CampaignCountryResponseDto[]> {
    this.logger.debug('Finding countries for campaign', { campaignId });

    // Verify campaign exists
    const campaign = await this.prisma.nationalCampaign.findFirst({
      where: { id: campaignId, deletedAt: null },
    });

    if (!campaign) {
      this.logger.warn(`Campaign not found: ${campaignId}`);
      throw new NotFoundException(`Campaign with ID "${campaignId}" not found`);
    }

    const associations = await this.prisma.campaignCountry.findMany({
      where: {
        campaignId,
        isActive: true,
      },
      include: {
        campaign: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            type: true,
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

    this.logger.debug('Found countries for campaign', {
      campaignId,
      count: associations.length,
    });

    return associations;
  }

  /**
   * Find all campaigns associated with a country
   * @param countryCode - Country code (ISO 3166-1 alpha-2)
   * @returns List of campaigns with association details
   */
  async findCampaignsByCountry(countryCode: string): Promise<CampaignCountryResponseDto[]> {
    this.logger.debug('Finding campaigns for country', { countryCode });

    // Verify country exists
    const country = await this.prisma.country.findUnique({
      where: { code: countryCode },
    });

    if (!country) {
      this.logger.warn(`Country not found: ${countryCode}`);
      throw new NotFoundException(`Country with code "${countryCode}" not found`);
    }

    const associations = await this.prisma.campaignCountry.findMany({
      where: {
        countryCode,
        isActive: true,
        campaign: { deletedAt: null },
      },
      include: {
        campaign: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            type: true,
          },
        },
        country: true,
      },
      orderBy: {
        campaign: {
          nameFr: 'asc',
        },
      },
    });

    this.logger.debug('Found campaigns for country', {
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
  async findOne(id: string): Promise<CampaignCountryResponseDto> {
    const association = await this.prisma.campaignCountry.findFirst({
      where: { id, isActive: true },
      include: {
        campaign: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            type: true,
          },
        },
        country: true,
      },
    });

    if (!association) {
      this.logger.warn(`Association not found: ${id}`);
      throw new NotFoundException(`Campaign-Country association with ID "${id}" not found`);
    }

    return association;
  }

  /**
   * Link a campaign to a country
   * @param campaignId - Campaign UUID
   * @param countryCode - Country code (ISO 3166-1 alpha-2)
   * @returns Created or reactivated association
   */
  async link(campaignId: string, countryCode: string): Promise<CampaignCountryResponseDto> {
    this.logger.debug('Linking campaign to country', { campaignId, countryCode });

    // Verify campaign exists
    const campaign = await this.prisma.nationalCampaign.findFirst({
      where: { id: campaignId, deletedAt: null },
    });

    if (!campaign) {
      this.logger.warn(`Campaign not found: ${campaignId}`);
      throw new NotFoundException(`Campaign with ID "${campaignId}" not found`);
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
    const existing = await this.prisma.campaignCountry.findUnique({
      where: {
        campaignId_countryCode: { campaignId, countryCode },
      },
    });

    if (existing && existing.isActive) {
      throw new ConflictException(
        `Campaign "${campaign.code}" is already linked to country "${countryCode}"`,
      );
    }

    if (existing && !existing.isActive) {
      // Reactivate existing association
      const reactivated = await this.prisma.campaignCountry.update({
        where: { id: existing.id },
        data: { isActive: true },
        include: {
          campaign: {
            select: {
              id: true,
              code: true,
              nameFr: true,
              nameEn: true,
              nameAr: true,
              type: true,
            },
          },
          country: true,
        },
      });

      this.logger.audit('Campaign-Country association reactivated', {
        campaignId,
        countryCode,
        associationId: reactivated.id,
      });

      return reactivated;
    }

    // Create new association
    const association = await this.prisma.campaignCountry.create({
      data: {
        campaignId,
        countryCode,
      },
      include: {
        campaign: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            type: true,
          },
        },
        country: true,
      },
    });

    this.logger.audit('Campaign-Country association created', {
      campaignId,
      countryCode,
      associationId: association.id,
    });

    return association;
  }

  /**
   * Unlink a campaign from a country (deactivate)
   * @param campaignId - Campaign UUID
   * @param countryCode - Country code (ISO 3166-1 alpha-2)
   * @returns Deactivated association
   */
  async unlink(campaignId: string, countryCode: string): Promise<CampaignCountryResponseDto> {
    this.logger.debug('Unlinking campaign from country', { campaignId, countryCode });

    const association = await this.prisma.campaignCountry.findFirst({
      where: {
        campaignId,
        countryCode,
        isActive: true,
      },
    });

    if (!association) {
      this.logger.warn(`Active association not found: ${campaignId} - ${countryCode}`);
      throw new NotFoundException(
        `Active association between campaign "${campaignId}" and country "${countryCode}" not found`,
      );
    }

    // Deactivate by setting isActive to false
    const updated = await this.prisma.campaignCountry.update({
      where: { id: association.id },
      data: { isActive: false },
      include: {
        campaign: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            type: true,
          },
        },
        country: true,
      },
    });

    this.logger.audit('Campaign-Country association deactivated', {
      campaignId,
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
  async restore(id: string): Promise<CampaignCountryResponseDto> {
    this.logger.debug(`Restoring campaign-country association ${id}`);

    const association = await this.prisma.campaignCountry.findUnique({
      where: { id },
    });

    if (!association) {
      this.logger.warn(`Association not found for restore: ${id}`);
      throw new NotFoundException(`Campaign-Country association with ID "${id}" not found`);
    }

    if (association.isActive) {
      throw new ConflictException(`Association "${id}" is not deactivated`);
    }

    const restored = await this.prisma.campaignCountry.update({
      where: { id },
      data: { isActive: true },
      include: {
        campaign: {
          select: {
            id: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameAr: true,
            type: true,
          },
        },
        country: true,
      },
    });

    this.logger.audit('Campaign-Country association restored', { associationId: id });
    return restored;
  }
}
