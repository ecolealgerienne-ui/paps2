import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmNationalCampaignPreferenceDto, UpdateFarmNationalCampaignPreferenceDto } from './dto';

@Injectable()
export class FarmNationalCampaignPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFarmNationalCampaignPreferenceDto) {
    return this.prisma.farmNationalCampaignPreference.create({
      data: {
        farmId: dto.farmId,
        campaignId: dto.campaignId,
        isEnrolled: dto.isEnrolled ?? false,
        enrolledAt: dto.enrolledAt ? new Date(dto.enrolledAt) : null,
      },
      include: {
        farm: true,
        campaign: true,
      },
    });
  }

  async findAll() {
    return this.prisma.farmNationalCampaignPreference.findMany({
      include: {
        farm: true,
        campaign: true,
      },
      orderBy: [{ farmId: 'asc' }, { campaignId: 'asc' }],
    });
  }

  async findByFarm(farmId: string) {
    return this.prisma.farmNationalCampaignPreference.findMany({
      where: { farmId },
      include: {
        farm: true,
        campaign: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findEnrolledCampaigns(farmId: string) {
    return this.prisma.farmNationalCampaignPreference.findMany({
      where: {
        farmId,
        isEnrolled: true,
      },
      include: {
        farm: true,
        campaign: true,
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const preference = await this.prisma.farmNationalCampaignPreference.findUnique({
      where: { id },
      include: {
        farm: true,
        campaign: true,
      },
    });

    if (!preference) {
      throw new NotFoundException(`FarmNationalCampaignPreference with ID ${id} not found`);
    }

    return preference;
  }

  async update(id: string, dto: UpdateFarmNationalCampaignPreferenceDto) {
    await this.findOne(id); // Check existence

    return this.prisma.farmNationalCampaignPreference.update({
      where: { id },
      data: {
        isEnrolled: dto.isEnrolled,
        enrolledAt: dto.enrolledAt ? new Date(dto.enrolledAt) : undefined,
      },
      include: {
        farm: true,
        campaign: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check existence

    return this.prisma.farmNationalCampaignPreference.delete({
      where: { id },
    });
  }

  /**
   * Enroll a farm to a national campaign (UPSERT pattern)
   * - If preference doesn't exist: CREATE with isEnrolled=true + enrolledAt=now()
   * - If preference exists: UPDATE with isEnrolled=true + enrolledAt=now()
   */
  async enroll(farmId: string, campaignId: string) {
    return this.prisma.farmNationalCampaignPreference.upsert({
      where: {
        farmId_campaignId: { farmId, campaignId },
      },
      create: {
        farmId,
        campaignId,
        isEnrolled: true,
        enrolledAt: new Date(),
      },
      update: {
        isEnrolled: true,
        enrolledAt: new Date(),
      },
      include: {
        farm: true,
        campaign: true,
      },
    });
  }

  /**
   * Unenroll a farm from a national campaign
   * - UPDATE isEnrolled=false (keep enrolledAt for history)
   */
  async unenroll(farmId: string, campaignId: string) {
    const preference = await this.prisma.farmNationalCampaignPreference.findUnique({
      where: {
        farmId_campaignId: { farmId, campaignId },
      },
    });

    if (!preference) {
      throw new NotFoundException(
        `No enrollment found for farm ${farmId} and campaign ${campaignId}`
      );
    }

    return this.prisma.farmNationalCampaignPreference.update({
      where: {
        farmId_campaignId: { farmId, campaignId },
      },
      data: {
        isEnrolled: false,
      },
      include: {
        farm: true,
        campaign: true,
      },
    });
  }
}
