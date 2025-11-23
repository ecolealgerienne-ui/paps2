import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonalCampaignDto, UpdatePersonalCampaignDto, QueryPersonalCampaignDto } from './dto';
import { CampaignType } from './types/campaign-type.enum';
import { PersonalCampaignStatus } from './types/personal-campaign-status.enum';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class PersonalCampaignsService {
  private readonly logger = new AppLogger(PersonalCampaignsService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreatePersonalCampaignDto) {
    this.logger.debug(`Creating personal campaign in farm ${farmId}`, { type: dto.type });

    // Verify lot if provided
    if (dto.lotId) {
      const lot = await this.prisma.lot.findFirst({
        where: { id: dto.lotId, farmId, deletedAt: null },
      });

      if (!lot) {
        this.logger.warn('Lot not found for campaign', { lotId: dto.lotId, farmId });
        throw new EntityNotFoundException(
          ERROR_CODES.CAMPAIGN_LOT_NOT_FOUND,
          `Lot ${dto.lotId} not found`,
          { lotId: dto.lotId, farmId },
        );
      }
    }

    try {
      const campaign = await this.prisma.personalCampaign.create({
        data: {
          ...dto,
          farmId,
          campaignDate: new Date(dto.campaignDate),
          withdrawalEndDate: new Date(dto.withdrawalEndDate),
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        },
        include: {
          lot: { select: { id: true, name: true, type: true } },
        },
      });

      this.logger.audit('Personal campaign created', { campaignId: campaign.id, farmId, type: dto.type });
      return campaign;
    } catch (error) {
      this.logger.error(`Failed to create personal campaign in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  async findAll(farmId: string, query: QueryPersonalCampaignDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.fromDate || query.toDate) {
      where.startDate = {};
      if (query.fromDate) where.startDate.gte = new Date(query.fromDate);
      if (query.toDate) where.startDate.lte = new Date(query.toDate);
    }

    return this.prisma.personalCampaign.findMany({
      where,
      include: {
        lot: { select: { id: true, name: true, type: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const campaign = await this.prisma.personalCampaign.findFirst({
      where: { id, farmId, deletedAt: null },
      include: {
        lot: {
          select: {
            id: true,
            name: true,
            type: true,
            _count: { select: { lotAnimals: true } },
          },
        },
      },
    });

    if (!campaign) {
      this.logger.warn('Personal campaign not found', { campaignId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.CAMPAIGN_NOT_FOUND,
        `Personal campaign ${id} not found`,
        { campaignId: id, farmId },
      );
    }

    return campaign;
  }

  async update(farmId: string, id: string, dto: UpdatePersonalCampaignDto) {
    this.logger.debug(`Updating personal campaign ${id} (version ${dto.version})`);

    const existing = await this.prisma.personalCampaign.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Personal campaign not found', { campaignId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.CAMPAIGN_NOT_FOUND,
        `Personal campaign ${id} not found`,
        { campaignId: id, farmId },
      );
    }

    // Version conflict check
    if (dto.version && existing.version > dto.version) {
      this.logger.warn('Version conflict detected', {
        campaignId: id,
        serverVersion: existing.version,
        clientVersion: dto.version,
      });

      throw new EntityConflictException(
        ERROR_CODES.VERSION_CONFLICT,
        'Version conflict detected',
        {
          campaignId: id,
          serverVersion: existing.version,
          clientVersion: dto.version,
        },
      );
    }

    try {
      const updateData: any = {
        ...dto,
        version: existing.version + 1,
      };

      if (dto.startDate) updateData.startDate = new Date(dto.startDate);
      if (dto.endDate) updateData.endDate = new Date(dto.endDate);

      const updated = await this.prisma.personalCampaign.update({
        where: { id },
        data: updateData,
        include: {
          lot: { select: { id: true, name: true, type: true } },
        },
      });

      this.logger.audit('Personal campaign updated', {
        campaignId: id,
        farmId,
        version: `${existing.version} → ${updated.version}`,
      });

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update personal campaign ${id}`, error.stack);
      throw error;
    }
  }

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting personal campaign ${id}`);

    const existing = await this.prisma.personalCampaign.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Personal campaign not found', { campaignId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.CAMPAIGN_NOT_FOUND,
        `Personal campaign ${id} not found`,
        { campaignId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.personalCampaign.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Personal campaign soft deleted', { campaignId: id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete personal campaign ${id}`, error.stack);
      throw error;
    }
  }

  // Get active campaigns
  async getActiveCampaigns(farmId: string) {
    this.logger.debug(`Finding active campaigns for farm ${farmId}`);

    return this.prisma.personalCampaign.findMany({
      where: {
        farmId,
        deletedAt: null,
        status: PersonalCampaignStatus.in_progress,
      },
      include: {
        lot: { select: { id: true, name: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  // Get campaign progress
  async getCampaignProgress(farmId: string, id: string) {
    const campaign = await this.findOne(farmId, id);

    const progress = {
      targetCount: campaign.targetCount || 0,
      completedCount: campaign.completedCount,
      progressPercent: campaign.targetCount
        ? Math.round((campaign.completedCount / campaign.targetCount) * 100)
        : 0,
    };

    return { campaign, progress };
  }

  // Complete a campaign
  async complete(farmId: string, id: string) {
    this.logger.debug(`Completing personal campaign ${id}`);

    const campaign = await this.prisma.personalCampaign.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!campaign) {
      this.logger.warn('Personal campaign not found', { campaignId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.CAMPAIGN_NOT_FOUND,
        `Personal campaign ${id} not found`,
        { campaignId: id, farmId },
      );
    }

    try {
      const completed = await this.prisma.personalCampaign.update({
        where: { id },
        data: {
          status: PersonalCampaignStatus.completed,
          endDate: new Date(),
          version: campaign.version + 1,
        },
        include: {
          lot: { select: { id: true, name: true, type: true } },
        },
      });

      this.logger.audit('Personal campaign completed', { campaignId: id, farmId });
      return completed;
    } catch (error) {
      this.logger.error(`Failed to complete personal campaign ${id}`, error.stack);
      throw error;
    }
  }
}
