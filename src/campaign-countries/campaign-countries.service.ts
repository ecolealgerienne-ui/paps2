import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/utils/logger.service';

/**
 * Service for managing NationalCampaign-Country associations
 * PHASE_19: CampaignCountries
 */
@Injectable()
export class CampaignCountriesService {
  private readonly logger = new AppLogger(CampaignCountriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all countries associated with a campaign
   * @param campaignId - Campaign UUID
   * @returns List of countries with association details
   */
  async findCountriesByCampaign(campaignId: string) {
    this.logger.debug('Finding countries for campaign', { campaignId });

    // Verify campaign exists
    const campaign = await this.prisma.nationalCampaign.findFirst({
      where: { id: campaignId, deletedAt: null },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    const associations = await this.prisma.campaignCountry.findMany({
      where: {
        campaignId,
        isActive: true,
      },
      include: {
        country: true,
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
  async findCampaignsByCountry(countryCode: string) {
    this.logger.debug('Finding campaigns for country', { countryCode });

    // Verify country exists
    const country = await this.prisma.country.findUnique({
      where: { code: countryCode },
    });

    if (!country) {
      throw new NotFoundException(`Country with code ${countryCode} not found`);
    }

    const associations = await this.prisma.campaignCountry.findMany({
      where: {
        countryCode,
        isActive: true,
      },
      include: {
        campaign: {
          where: {
            deletedAt: null,
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
   * Link a campaign to a country
   * @param campaignId - Campaign UUID
   * @param countryCode - Country code (ISO 3166-1 alpha-2)
   * @returns Created association
   */
  async link(campaignId: string, countryCode: string) {
    this.logger.debug('Linking campaign to country', { campaignId, countryCode });

    // Verify campaign exists
    const campaign = await this.prisma.nationalCampaign.findFirst({
      where: { id: campaignId, deletedAt: null },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    // Verify country exists
    const country = await this.prisma.country.findUnique({
      where: { code: countryCode },
    });

    if (!country) {
      throw new NotFoundException(`Country with code ${countryCode} not found`);
    }

    // Check if association already exists
    const existing = await this.prisma.campaignCountry.findFirst({
      where: {
        campaignId,
        countryCode,
      },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException(
          `Campaign ${campaignId} is already linked to country ${countryCode}`,
        );
      } else {
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
        });

        return reactivated;
      }
    }

    // Create new association
    try {
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
    } catch (error) {
      this.logger.error('Failed to link campaign to country', error.stack);
      throw error;
    }
  }

  /**
   * Unlink a campaign from a country
   * @param campaignId - Campaign UUID
   * @param countryCode - Country code (ISO 3166-1 alpha-2)
   * @returns Deleted/deactivated association
   */
  async unlink(campaignId: string, countryCode: string) {
    this.logger.debug('Unlinking campaign from country', { campaignId, countryCode });

    const association = await this.prisma.campaignCountry.findFirst({
      where: {
        campaignId,
        countryCode,
        isActive: true,
      },
    });

    if (!association) {
      throw new NotFoundException(
        `Active association between campaign ${campaignId} and country ${countryCode} not found`,
      );
    }

    // Soft delete by setting isActive to false
    const updated = await this.prisma.campaignCountry.update({
      where: { id: association.id },
      data: { isActive: false },
    });

    this.logger.audit('Campaign-Country association deactivated', {
      campaignId,
      countryCode,
      associationId: association.id,
    });

    return updated;
  }

  /**
   * Find all associations (for admin purposes)
   * @returns All campaign-country associations
   */
  async findAll(includeInactive = false) {
    this.logger.debug('Finding all campaign-country associations', {
      includeInactive,
    });

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const associations = await this.prisma.campaignCountry.findMany({
      where,
      include: {
        campaign: {
          where: {
            deletedAt: null,
          },
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
      orderBy: [
        { campaign: { nameFr: 'asc' } },
        { country: { nameFr: 'asc' } },
      ],
    });

    return associations;
  }
}
