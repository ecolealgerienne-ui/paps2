import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNationalCampaignDto, UpdateNationalCampaignDto, QueryNationalCampaignDto, CampaignType } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class NationalCampaignsService {
  private readonly logger = new AppLogger(NationalCampaignsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Créer une nouvelle campagne nationale (PHASE_07)
   */
  async create(dto: CreateNationalCampaignDto) {
    this.logger.debug(`Creating national campaign`, { code: dto.code, type: dto.type });

    // Valider les dates
    this.validateDates(dto.startDate, dto.endDate);

    // Vérifier unicité du code
    const existing = await this.prisma.nationalCampaign.findUnique({
      where: { code: dto.code },
    });

    if (existing && !existing.deletedAt) {
      this.logger.warn('Campaign code already exists', { code: dto.code });
      throw new ConflictException(`Campaign with code '${dto.code}' already exists`);
    }

    try {
      const campaign = await this.prisma.nationalCampaign.create({
        data: {
          code: dto.code,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          description: dto.description,
          type: dto.type,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          isActive: dto.isActive ?? true,
        },
      });

      this.logger.audit('National campaign created', { campaignId: campaign.id, code: campaign.code });
      return campaign;
    } catch (error) {
      this.logger.error(`Failed to create national campaign`, error.stack);
      throw error;
    }
  }

  /**
   * Récupérer toutes les campagnes avec filtres (PHASE_07)
   */
  async findAll(query: QueryNationalCampaignDto) {
    const where: any = {};

    // Filtres
    if (query.type) where.type = query.type;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    // Soft delete filter
    if (!query.includeDeleted) {
      where.deletedAt = null;
    }

    // Recherche textuelle
    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' as const } },
        { nameFr: { contains: query.search, mode: 'insensitive' as const } },
        { nameEn: { contains: query.search, mode: 'insensitive' as const } },
        { nameAr: { contains: query.search, mode: 'insensitive' as const } },
      ];
    }

    return this.prisma.nationalCampaign.findMany({
      where,
      orderBy: [
        { startDate: 'desc' },
        { code: 'asc' },
      ],
    });
  }

  /**
   * Récupérer les campagnes en cours (PHASE_07)
   * Campagnes où la date actuelle est entre startDate et endDate
   */
  async findCurrent() {
    const now = new Date();

    return this.prisma.nationalCampaign.findMany({
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
  }

  /**
   * Récupérer une campagne par ID (PHASE_07)
   */
  async findOne(id: string) {
    this.logger.debug(`Finding national campaign ${id}`);

    const campaign = await this.prisma.nationalCampaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.deletedAt) {
      this.logger.warn('National campaign not found or deleted', { campaignId: id });
      throw new EntityNotFoundException(
        ERROR_CODES.ENTITY_NOT_FOUND,
        `National campaign ${id} not found`,
        { campaignId: id },
      );
    }

    return campaign;
  }

  /**
   * Récupérer une campagne par code (PHASE_07)
   */
  async findByCode(code: string) {
    this.logger.debug(`Finding national campaign by code ${code}`);

    const campaign = await this.prisma.nationalCampaign.findUnique({
      where: { code },
    });

    if (!campaign || campaign.deletedAt) {
      this.logger.warn('National campaign not found or deleted', { code });
      throw new NotFoundException(`National campaign with code '${code}' not found`);
    }

    return campaign;
  }

  /**
   * Mettre à jour une campagne (PHASE_07)
   */
  async update(id: string, dto: UpdateNationalCampaignDto) {
    this.logger.debug(`Updating national campaign ${id}`);

    // Vérifier que la campagne existe
    const existing = await this.findOne(id);

    // Valider les dates si fournies
    if (dto.startDate || dto.endDate) {
      const startDate = dto.startDate || existing.startDate.toISOString();
      const endDate = dto.endDate || existing.endDate.toISOString();
      this.validateDates(startDate, endDate);
    }

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      this.logger.warn('Version conflict detected', { campaignId: id, expected: existing.version, received: dto.version });
      throw new ConflictException('Version conflict: the campaign has been modified by another user');
    }

    // Vérifier unicité du code si modifié
    if (dto.code && dto.code !== existing.code) {
      const codeExists = await this.prisma.nationalCampaign.findUnique({
        where: { code: dto.code },
      });

      if (codeExists && !codeExists.deletedAt) {
        throw new ConflictException(`Campaign with code '${dto.code}' already exists`);
      }
    }

    try {
      const updated = await this.prisma.nationalCampaign.update({
        where: { id },
        data: {
          ...(dto.code !== undefined && { code: dto.code }),
          ...(dto.nameFr !== undefined && { nameFr: dto.nameFr }),
          ...(dto.nameEn !== undefined && { nameEn: dto.nameEn }),
          ...(dto.nameAr !== undefined && { nameAr: dto.nameAr }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.type !== undefined && { type: dto.type }),
          ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
          ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          version: existing.version + 1,
        },
      });

      this.logger.audit('National campaign updated', { campaignId: id, code: updated.code });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update national campaign ${id}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete d'une campagne (PHASE_07)
   */
  async remove(id: string) {
    this.logger.debug(`Soft deleting national campaign ${id}`);

    const existing = await this.findOne(id);

    try {
      const deleted = await this.prisma.nationalCampaign.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
          version: existing.version + 1,
        },
      });

      this.logger.audit('National campaign soft deleted', { campaignId: id, code: deleted.code });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete national campaign ${id}`, error.stack);
      throw error;
    }
  }

  /**
   * Validation des dates (PHASE_07)
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
