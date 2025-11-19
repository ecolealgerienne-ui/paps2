import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto, QueryCampaignDto } from './dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateCampaignDto) {
    // Verify lot if provided
    if (dto.lotId) {
      const lot = await this.prisma.lot.findFirst({
        where: { id: dto.lotId, farmId, deletedAt: null },
      });

      if (!lot) {
        throw new NotFoundException(`Lot ${dto.lotId} not found`);
      }
    }

    return this.prisma.campaign.create({
      data: {
        ...dto,
        farmId,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
      include: {
        lot: { select: { id: true, name: true, type: true } },
      },
    });
  }

  async findAll(farmId: string, query: QueryCampaignDto) {
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

    return this.prisma.campaign.findMany({
      where,
      include: {
        lot: { select: { id: true, name: true, type: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
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
      throw new NotFoundException(`Campaign ${id} not found`);
    }

    return campaign;
  }

  async update(farmId: string, id: string, dto: UpdateCampaignDto) {
    const existing = await this.prisma.campaign.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }

    if (dto.version && existing.version > dto.version) {
      throw new ConflictException({
        message: 'Version conflict',
        serverVersion: existing.version,
        serverData: existing,
      });
    }

    const updateData: any = {
      ...dto,
      version: existing.version + 1,
    };

    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);

    return this.prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        lot: { select: { id: true, name: true, type: true } },
      },
    });
  }

  async remove(farmId: string, id: string) {
    const existing = await this.prisma.campaign.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }

    return this.prisma.campaign.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }

  // Get active campaigns
  async getActiveCampaigns(farmId: string) {
    return this.prisma.campaign.findMany({
      where: {
        farmId,
        deletedAt: null,
        status: 'in_progress',
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
}
