import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateNationalCampaignDto, UpdateNationalCampaignDto, NationalCampaignResponseDto, CampaignType } from './dto';
import { AppLogger } from '../common/utils/logger.service';

export interface FindAllOptions {
  page?: number;
  limit?: number;
  type?: CampaignType;
  isActive?: boolean;
  search?: string;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse {
  data: NationalCampaignResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Service for managing National Campaigns
 * PHASE_07: NationalCampaigns - Migrated to /api/v1 with pagination and search
 */
@Injectable()
export class NationalCampaignsService {
  private readonly logger = new AppLogger(NationalCampaignsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new national campaign
   * @param dto - Campaign creation data
   * @returns Created campaign
   */
  async create(dto: CreateNationalCampaignDto): Promise<NationalCampaignResponseDto> {
    this.logger.debug(`Creating national campaign`, { code: dto.code, type: dto.type });

    // Validate dates
    this.validateDates(dto.startDate, dto.endDate);

    // Check for duplicate code
    const existing = await this.prisma.nationalCampaign.findUnique({
      where: { code: dto.code },
    });

    if (existing && !existing.deletedAt) {
      this.logger.warn('Campaign code already exists', { code: dto.code });
      throw new ConflictException(`Campaign with code "${dto.code}" already exists`);
    }

    if (existing && existing.deletedAt) {
      // Restore soft-deleted campaign with new data
      this.logger.debug(`Restoring soft-deleted campaign: ${dto.code}`);
      const restored = await this.prisma.nationalCampaign.update({
        where: { id: existing.id },
        data: {
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          description: dto.description || null,
          type: dto.type,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          isActive: dto.isActive ?? true,
          deletedAt: null,
          version: existing.version + 1,
        },
      });
      this.logger.audit('National campaign restored', { campaignId: restored.id, code: dto.code });
      return restored;
    }

    const campaign = await this.prisma.nationalCampaign.create({
      data: {
        code: dto.code,
        nameFr: dto.nameFr,
        nameEn: dto.nameEn,
        nameAr: dto.nameAr,
        description: dto.description || null,
        type: dto.type,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isActive: dto.isActive ?? true,
      },
    });

    this.logger.audit('National campaign created', { campaignId: campaign.id, code: campaign.code });
    return campaign;
  }

  /**
   * Get all campaigns with pagination, filters, search, and sorting
   * @param options - Query options
   * @returns Paginated campaigns list
   */
  async findAll(options: FindAllOptions = {}): Promise<PaginatedResponse> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.NationalCampaignWhereInput = { deletedAt: null };

    // Filters
    if (options.type) where.type = options.type;
    if (options.isActive !== undefined) where.isActive = options.isActive;

    // Search in code and names
    if (options.search) {
      const searchTerm = options.search;
      where.OR = [
        { code: { contains: searchTerm, mode: 'insensitive' } },
        { nameFr: { contains: searchTerm, mode: 'insensitive' } },
        { nameEn: { contains: searchTerm, mode: 'insensitive' } },
        { nameAr: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.buildOrderBy(options.orderBy, options.order);

    const [total, data] = await Promise.all([
      this.prisma.nationalCampaign.count({ where }),
      this.prisma.nationalCampaign.findMany({ where, orderBy, skip, take: limit }),
    ]);

    this.logger.debug(`Found ${total} national campaigns (page ${page}/${Math.ceil(total / limit)})`);

    return {
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  private buildOrderBy(
    field?: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ): Prisma.NationalCampaignOrderByWithRelationInput[] {
    const allowedFields = ['nameFr', 'nameEn', 'code', 'startDate', 'endDate', 'type', 'createdAt'];

    if (field && allowedFields.includes(field)) {
      return [{ [field]: order.toLowerCase() as Prisma.SortOrder }];
    }

    // Default: sort by start date descending, then code
    return [{ startDate: 'desc' }, { code: 'asc' }];
  }

  /**
   * Get current national campaigns
   * Campaigns where today is between startDate and endDate
   * @returns List of currently active campaigns
   */
  async findCurrent(): Promise<NationalCampaignResponseDto[]> {
    const now = new Date();

    const campaigns = await this.prisma.nationalCampaign.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
        isActive: true,
        deletedAt: null,
      },
      orderBy: [
        { endDate: 'asc' },
        { code: 'asc' },
      ],
    });

    this.logger.debug('Found current campaigns', { count: campaigns.length });
    return campaigns;
  }

  /**
   * Get a single campaign by ID
   * @param id - Campaign ID
   * @returns Campaign or throws NotFoundException
   */
  async findOne(id: string): Promise<NationalCampaignResponseDto> {
    const campaign = await this.prisma.nationalCampaign.findFirst({
      where: { id, deletedAt: null },
    });

    if (!campaign) {
      this.logger.warn(`National campaign not found: ${id}`);
      throw new NotFoundException(`National campaign with ID "${id}" not found`);
    }

    return campaign;
  }

  /**
   * Get a campaign by code
   * @param code - Campaign code
   * @returns Campaign or throws NotFoundException
   */
  async findByCode(code: string): Promise<NationalCampaignResponseDto> {
    const campaign = await this.prisma.nationalCampaign.findFirst({
      where: { code, deletedAt: null },
    });

    if (!campaign) {
      this.logger.warn(`National campaign not found by code: ${code}`);
      throw new NotFoundException(`National campaign with code "${code}" not found`);
    }

    return campaign;
  }

  /**
   * Update a campaign (with optimistic locking)
   * @param id - Campaign ID
   * @param dto - Update data
   * @returns Updated campaign
   */
  async update(id: string, dto: UpdateNationalCampaignDto): Promise<NationalCampaignResponseDto> {
    this.logger.debug(`Updating national campaign ${id}`);

    const existing = await this.findOne(id);

    // Validate dates if provided
    if (dto.startDate || dto.endDate) {
      const startDate = dto.startDate || existing.startDate.toISOString();
      const endDate = dto.endDate || existing.endDate.toISOString();
      this.validateDates(startDate, endDate);
    }

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      this.logger.warn('Version conflict detected', {
        campaignId: id,
        expected: existing.version,
        received: dto.version,
      });
      throw new ConflictException(
        `Version conflict: expected ${dto.version}, found ${existing.version}`,
      );
    }

    const campaign = await this.prisma.nationalCampaign.update({
      where: { id },
      data: {
        nameFr: dto.nameFr !== undefined ? dto.nameFr : existing.nameFr,
        nameEn: dto.nameEn !== undefined ? dto.nameEn : existing.nameEn,
        nameAr: dto.nameAr !== undefined ? dto.nameAr : existing.nameAr,
        description: dto.description !== undefined ? dto.description : existing.description,
        type: dto.type !== undefined ? dto.type : existing.type,
        startDate: dto.startDate !== undefined ? new Date(dto.startDate) : existing.startDate,
        endDate: dto.endDate !== undefined ? new Date(dto.endDate) : existing.endDate,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
        version: existing.version + 1,
      },
    });

    this.logger.audit('National campaign updated', { campaignId: id, code: campaign.code, newVersion: campaign.version });
    return campaign;
  }

  /**
   * Soft delete a campaign
   * @param id - Campaign ID
   * @returns Soft-deleted campaign
   */
  async remove(id: string): Promise<NationalCampaignResponseDto> {
    this.logger.debug(`Soft deleting national campaign ${id}`);

    const existing = await this.findOne(id);

    // Check dependencies
    const [countriesCount, preferencesCount] = await Promise.all([
      this.prisma.campaignCountry.count({
        where: { campaignId: id },
      }),
      this.prisma.farmNationalCampaignPreference.count({
        where: { campaignId: id },
      }),
    ]);

    if (countriesCount > 0 || preferencesCount > 0) {
      this.logger.warn(`Cannot delete campaign ${id}: has dependencies`, {
        countriesCount,
        preferencesCount,
      });
      throw new ConflictException(
        `Cannot delete campaign "${existing.code}": linked to ${countriesCount} country/countries and ${preferencesCount} farm preference(s)`,
      );
    }

    const campaign = await this.prisma.nationalCampaign.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        version: existing.version + 1,
      },
    });

    this.logger.audit('National campaign soft deleted', { campaignId: id, code: campaign.code });
    return campaign;
  }

  /**
   * Restore a soft-deleted campaign
   * @param id - Campaign ID
   * @returns Restored campaign
   */
  async restore(id: string): Promise<NationalCampaignResponseDto> {
    this.logger.debug(`Restoring national campaign ${id}`);

    const campaign = await this.prisma.nationalCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      this.logger.warn(`Campaign not found for restore: ${id}`);
      throw new NotFoundException(`National campaign with ID "${id}" not found`);
    }

    if (!campaign.deletedAt) {
      throw new ConflictException(`Campaign "${campaign.code}" is not deleted`);
    }

    const restored = await this.prisma.nationalCampaign.update({
      where: { id },
      data: {
        deletedAt: null,
        version: campaign.version + 1,
      },
    });

    this.logger.audit('National campaign restored', { campaignId: id, code: restored.code });
    return restored;
  }

  /**
   * Validate campaign dates
   * @param startDate - Start date string
   * @param endDate - End date string
   */
  private validateDates(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      throw new BadRequestException('Invalid start date format');
    }

    if (isNaN(end.getTime())) {
      throw new BadRequestException('Invalid end date format');
    }

    if (start >= end) {
      throw new BadRequestException('Start date must be before end date');
    }
  }
}
