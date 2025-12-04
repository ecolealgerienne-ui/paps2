import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmNationalCampaignPreferenceDto, UpdateFarmNationalCampaignPreferenceDto, FarmNationalCampaignPreferenceResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

@Injectable()
export class FarmNationalCampaignPreferencesService {
  private readonly logger = new AppLogger(FarmNationalCampaignPreferencesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFarmNationalCampaignPreferenceDto): Promise<FarmNationalCampaignPreferenceResponseDto> {
    this.logger.debug(`Creating campaign preference for farm ${dto.farmId}`);

    // Vérifier que la ferme existe
    const farm = await this.prisma.farm.findUnique({ where: { id: dto.farmId } });
    if (!farm) {
      throw new NotFoundException(`Farm with ID "${dto.farmId}" not found`);
    }

    // Vérifier que la campagne existe
    const campaign = await this.prisma.nationalCampaign.findFirst({
      where: { id: dto.campaignId, deletedAt: null },
    });
    if (!campaign) {
      throw new NotFoundException(`National campaign with ID "${dto.campaignId}" not found`);
    }

    // Vérifier si existe déjà (incluant soft-deleted)
    const existing = await this.prisma.farmNationalCampaignPreference.findUnique({
      where: { farmId_campaignId: { farmId: dto.farmId, campaignId: dto.campaignId } },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Restaurer si soft-deleted
        const restored = await this.prisma.farmNationalCampaignPreference.update({
          where: { id: existing.id },
          data: {
            deletedAt: null,
            isEnrolled: dto.isEnrolled ?? false,
            enrolledAt: dto.enrolledAt ? new Date(dto.enrolledAt) : null,
            version: existing.version + 1,
          },
          include: { farm: true, campaign: true },
        });
        this.logger.audit('Campaign preference restored', { preferenceId: existing.id, farmId: dto.farmId });
        return restored;
      }
      throw new ConflictException(`Preference already exists for farm ${dto.farmId} and campaign ${dto.campaignId}`);
    }

    const preference = await this.prisma.farmNationalCampaignPreference.create({
      data: {
        farmId: dto.farmId,
        campaignId: dto.campaignId,
        isEnrolled: dto.isEnrolled ?? false,
        enrolledAt: dto.enrolledAt ? new Date(dto.enrolledAt) : null,
      },
      include: { farm: true, campaign: true },
    });

    this.logger.audit('Campaign preference created', { preferenceId: preference.id, farmId: dto.farmId });
    return preference;
  }

  async findByFarm(farmId: string, includeUnenrolled = true): Promise<FarmNationalCampaignPreferenceResponseDto[]> {
    this.logger.debug(`Finding campaign preferences for farm ${farmId}`);

    // Vérifier que la ferme existe
    const farm = await this.prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    const where: any = { farmId, deletedAt: null };
    if (!includeUnenrolled) {
      where.isEnrolled = true;
    }

    return this.prisma.farmNationalCampaignPreference.findMany({
      where,
      include: { farm: true, campaign: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findEnrolledCampaigns(farmId: string): Promise<FarmNationalCampaignPreferenceResponseDto[]> {
    this.logger.debug(`Finding enrolled campaigns for farm ${farmId}`);

    const farm = await this.prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    return this.prisma.farmNationalCampaignPreference.findMany({
      where: { farmId, isEnrolled: true, deletedAt: null },
      include: { farm: true, campaign: true },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<FarmNationalCampaignPreferenceResponseDto> {
    const preference = await this.prisma.farmNationalCampaignPreference.findFirst({
      where: { id, deletedAt: null },
      include: { farm: true, campaign: true },
    });

    if (!preference) {
      throw new NotFoundException(`Campaign preference with ID "${id}" not found`);
    }

    return preference;
  }

  async findOneByCampaign(farmId: string, campaignId: string): Promise<FarmNationalCampaignPreferenceResponseDto> {
    const preference = await this.prisma.farmNationalCampaignPreference.findFirst({
      where: { farmId, campaignId, deletedAt: null },
      include: { farm: true, campaign: true },
    });

    if (!preference) {
      throw new NotFoundException(`No preference found for farm ${farmId} and campaign ${campaignId}`);
    }

    return preference;
  }

  async update(id: string, dto: UpdateFarmNationalCampaignPreferenceDto): Promise<FarmNationalCampaignPreferenceResponseDto> {
    this.logger.debug(`Updating campaign preference ${id}`);

    const existing = await this.prisma.farmNationalCampaignPreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Campaign preference with ID "${id}" not found`);
    }

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict: the preference has been modified by another user');
    }

    const updated = await this.prisma.farmNationalCampaignPreference.update({
      where: { id },
      data: {
        isEnrolled: dto.isEnrolled ?? existing.isEnrolled,
        enrolledAt: dto.enrolledAt ? new Date(dto.enrolledAt) : existing.enrolledAt,
        version: existing.version + 1,
      },
      include: { farm: true, campaign: true },
    });

    this.logger.audit('Campaign preference updated', { preferenceId: id });
    return updated;
  }

  async updateByCampaign(farmId: string, campaignId: string, dto: UpdateFarmNationalCampaignPreferenceDto): Promise<FarmNationalCampaignPreferenceResponseDto> {
    this.logger.debug(`Updating campaign preference for farm ${farmId}, campaign ${campaignId}`);

    const existing = await this.prisma.farmNationalCampaignPreference.findFirst({
      where: { farmId, campaignId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`No preference found for farm ${farmId} and campaign ${campaignId}`);
    }

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict: the preference has been modified by another user');
    }

    const updated = await this.prisma.farmNationalCampaignPreference.update({
      where: { id: existing.id },
      data: {
        isEnrolled: dto.isEnrolled ?? existing.isEnrolled,
        enrolledAt: dto.enrolledAt ? new Date(dto.enrolledAt) : existing.enrolledAt,
        version: existing.version + 1,
      },
      include: { farm: true, campaign: true },
    });

    this.logger.audit('Campaign preference updated', { preferenceId: existing.id, farmId, campaignId });
    return updated;
  }

  async remove(id: string): Promise<FarmNationalCampaignPreferenceResponseDto> {
    this.logger.debug(`Soft deleting campaign preference ${id}`);

    const existing = await this.prisma.farmNationalCampaignPreference.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Campaign preference with ID "${id}" not found`);
    }

    const deleted = await this.prisma.farmNationalCampaignPreference.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
      include: { farm: true, campaign: true },
    });

    this.logger.audit('Campaign preference soft deleted', { preferenceId: id });
    return deleted;
  }

  /**
   * Enroll a farm to a national campaign (UPSERT pattern)
   * - If preference doesn't exist: CREATE with isEnrolled=true + enrolledAt=now()
   * - If preference exists (including soft-deleted): UPDATE with isEnrolled=true + enrolledAt=now()
   */
  async enroll(farmId: string, campaignId: string): Promise<FarmNationalCampaignPreferenceResponseDto> {
    this.logger.debug(`Enrolling farm ${farmId} to campaign ${campaignId}`);

    // Vérifier que la ferme existe
    const farm = await this.prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      throw new NotFoundException(`Farm with ID "${farmId}" not found`);
    }

    // Vérifier que la campagne existe et est active
    const campaign = await this.prisma.nationalCampaign.findFirst({
      where: { id: campaignId, deletedAt: null, isActive: true },
    });
    if (!campaign) {
      throw new NotFoundException(`National campaign with ID "${campaignId}" not found or not active`);
    }

    // Vérifier si existe déjà
    const existing = await this.prisma.farmNationalCampaignPreference.findUnique({
      where: { farmId_campaignId: { farmId, campaignId } },
    });

    if (existing) {
      const updated = await this.prisma.farmNationalCampaignPreference.update({
        where: { id: existing.id },
        data: {
          isEnrolled: true,
          enrolledAt: new Date(),
          deletedAt: null, // Restore if soft-deleted
          version: existing.version + 1,
        },
        include: { farm: true, campaign: true },
      });
      this.logger.audit('Farm enrolled to campaign', { farmId, campaignId, preferenceId: existing.id });
      return updated;
    }

    const created = await this.prisma.farmNationalCampaignPreference.create({
      data: {
        farmId,
        campaignId,
        isEnrolled: true,
        enrolledAt: new Date(),
      },
      include: { farm: true, campaign: true },
    });

    this.logger.audit('Farm enrolled to campaign (new)', { farmId, campaignId, preferenceId: created.id });
    return created;
  }

  /**
   * Unenroll a farm from a national campaign
   * - UPDATE isEnrolled=false (keep enrolledAt for history)
   */
  async unenroll(farmId: string, campaignId: string): Promise<FarmNationalCampaignPreferenceResponseDto> {
    this.logger.debug(`Unenrolling farm ${farmId} from campaign ${campaignId}`);

    const existing = await this.prisma.farmNationalCampaignPreference.findFirst({
      where: { farmId, campaignId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`No enrollment found for farm ${farmId} and campaign ${campaignId}`);
    }

    const updated = await this.prisma.farmNationalCampaignPreference.update({
      where: { id: existing.id },
      data: {
        isEnrolled: false,
        version: existing.version + 1,
      },
      include: { farm: true, campaign: true },
    });

    this.logger.audit('Farm unenrolled from campaign', { farmId, campaignId, preferenceId: existing.id });
    return updated;
  }

  /**
   * Restore a soft-deleted preference
   */
  async restore(id: string): Promise<FarmNationalCampaignPreferenceResponseDto> {
    this.logger.debug(`Restoring campaign preference ${id}`);

    const existing = await this.prisma.farmNationalCampaignPreference.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Campaign preference with ID "${id}" not found`);
    }

    if (!existing.deletedAt) {
      throw new ConflictException('This preference is not deleted');
    }

    const restored = await this.prisma.farmNationalCampaignPreference.update({
      where: { id },
      data: {
        deletedAt: null,
        version: existing.version + 1,
      },
      include: { farm: true, campaign: true },
    });

    this.logger.audit('Campaign preference restored', { preferenceId: id });
    return restored;
  }
}
