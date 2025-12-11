import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, AlertCategory, AlertPriority } from '@prisma/client';
import { CreateAlertTemplateDto, UpdateAlertTemplateDto, AlertTemplateResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

export interface FindAllOptions {
  page?: number;
  limit?: number;
  category?: AlertCategory;
  priority?: AlertPriority;
  isActive?: boolean;
  search?: string;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse {
  data: AlertTemplateResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class AlertTemplatesService {
  private readonly logger = new AppLogger(AlertTemplatesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAlertTemplateDto): Promise<AlertTemplateResponseDto> {
    this.logger.debug(`Creating alert template with code ${dto.code}`);

    const existing = await this.prisma.alertTemplate.findUnique({
      where: { code: dto.code.toLowerCase() },
    });

    if (existing && !existing.deletedAt) {
      this.logger.warn(`Duplicate code attempt: ${dto.code}`);
      throw new ConflictException(`Alert template with code "${dto.code}" already exists`);
    }

    if (existing && existing.deletedAt) {
      this.logger.debug(`Restoring soft-deleted template: ${dto.code}`);
      const restored = await this.prisma.alertTemplate.update({
        where: { id: existing.id },
        data: {
          code: dto.code.toLowerCase(),
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          descriptionFr: dto.descriptionFr || null,
          descriptionEn: dto.descriptionEn || null,
          descriptionAr: dto.descriptionAr || null,
          category: dto.category,
          priority: dto.priority ?? AlertPriority.medium,
          isActive: dto.isActive ?? true,
          deletedAt: null,
          version: existing.version + 1,
        },
      });
      this.logger.audit('Alert template restored', { templateId: restored.id, code: restored.code });
      return restored;
    }

    const template = await this.prisma.alertTemplate.create({
      data: {
        code: dto.code.toLowerCase(),
        nameFr: dto.nameFr,
        nameEn: dto.nameEn,
        nameAr: dto.nameAr,
        descriptionFr: dto.descriptionFr || null,
        descriptionEn: dto.descriptionEn || null,
        descriptionAr: dto.descriptionAr || null,
        category: dto.category,
        priority: dto.priority ?? AlertPriority.medium,
        isActive: dto.isActive ?? true,
      },
    });

    this.logger.audit('Alert template created', { templateId: template.id, code: template.code });
    return template;
  }

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResponse> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AlertTemplateWhereInput = { deletedAt: null };

    if (options.category) where.category = options.category;
    if (options.priority) where.priority = options.priority;
    if (options.isActive !== undefined) where.isActive = options.isActive;

    if (options.search) {
      const searchTerm = options.search;
      where.OR = [
        { nameFr: { contains: searchTerm, mode: 'insensitive' } },
        { nameEn: { contains: searchTerm, mode: 'insensitive' } },
        { nameAr: { contains: searchTerm, mode: 'insensitive' } },
        { code: { contains: searchTerm.toLowerCase(), mode: 'insensitive' } },
      ];
    }

    const orderBy = this.buildOrderBy(options.orderBy, options.order);

    const [total, data] = await Promise.all([
      this.prisma.alertTemplate.count({ where }),
      this.prisma.alertTemplate.findMany({ where, orderBy, skip, take: limit }),
    ]);

    this.logger.debug(`Found ${total} templates (page ${page}/${Math.ceil(total / limit)})`);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private buildOrderBy(
    field?: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ): Prisma.AlertTemplateOrderByWithRelationInput[] {
    const allowedFields = ['nameFr', 'nameEn', 'code', 'category', 'priority', 'createdAt'];

    if (field && allowedFields.includes(field)) {
      return [{ [field]: order.toLowerCase() as Prisma.SortOrder }];
    }

    return [{ category: 'asc' }, { priority: 'asc' }, { nameFr: 'asc' }];
  }

  async findOne(id: string): Promise<AlertTemplateResponseDto> {
    const template = await this.prisma.alertTemplate.findFirst({
      where: { id, deletedAt: null },
    });

    if (!template) {
      this.logger.warn(`Alert template not found: ${id}`);
      throw new NotFoundException(`Alert template with ID "${id}" not found`);
    }

    return template;
  }

  async findByCode(code: string): Promise<AlertTemplateResponseDto> {
    const template = await this.prisma.alertTemplate.findFirst({
      where: { code: code.toLowerCase(), deletedAt: null },
    });

    if (!template) {
      this.logger.warn(`Alert template not found by code: ${code}`);
      throw new NotFoundException(`Alert template with code "${code}" not found`);
    }

    return template;
  }

  async findByCategory(category: AlertCategory): Promise<AlertTemplateResponseDto[]> {
    return this.prisma.alertTemplate.findMany({
      where: { category, deletedAt: null, isActive: true },
      orderBy: [{ priority: 'desc' }, { nameFr: 'asc' }],
    });
  }

  async findByPriority(priority: AlertPriority): Promise<AlertTemplateResponseDto[]> {
    return this.prisma.alertTemplate.findMany({
      where: { priority, deletedAt: null, isActive: true },
      orderBy: [{ category: 'asc' }, { nameFr: 'asc' }],
    });
  }

  async update(id: string, dto: UpdateAlertTemplateDto): Promise<AlertTemplateResponseDto> {
    const existing = await this.findOne(id);

    const updated = await this.prisma.alertTemplate.update({
      where: { id },
      data: {
        nameFr: dto.nameFr,
        nameEn: dto.nameEn,
        nameAr: dto.nameAr,
        descriptionFr: dto.descriptionFr !== undefined ? dto.descriptionFr : existing.descriptionFr,
        descriptionEn: dto.descriptionEn !== undefined ? dto.descriptionEn : existing.descriptionEn,
        descriptionAr: dto.descriptionAr !== undefined ? dto.descriptionAr : existing.descriptionAr,
        category: dto.category !== undefined ? dto.category : existing.category,
        priority: dto.priority !== undefined ? dto.priority : existing.priority,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
        version: existing.version + 1,
      },
    });

    this.logger.audit('Alert template updated', { templateId: id });
    return updated;
  }

  async toggleActive(id: string, isActive: boolean): Promise<AlertTemplateResponseDto> {
    const existing = await this.findOne(id);

    const updated = await this.prisma.alertTemplate.update({
      where: { id },
      data: { isActive, version: existing.version + 1 },
    });

    this.logger.audit('Alert template active status toggled', { templateId: id, isActive });
    return updated;
  }

  async remove(id: string): Promise<AlertTemplateResponseDto> {
    const existing = await this.findOne(id);

    const deleted = await this.prisma.alertTemplate.update({
      where: { id },
      data: { deletedAt: new Date(), version: existing.version + 1 },
    });

    this.logger.audit('Alert template soft deleted', { templateId: id });
    return deleted;
  }

  async restore(id: string): Promise<AlertTemplateResponseDto> {
    const template = await this.prisma.alertTemplate.findUnique({ where: { id } });

    if (!template) {
      this.logger.warn(`Alert template not found for restore: ${id}`);
      throw new NotFoundException('Alert template not found');
    }

    if (!template.deletedAt) {
      throw new ConflictException('Alert template is not deleted');
    }

    const restored = await this.prisma.alertTemplate.update({
      where: { id },
      data: { deletedAt: null, version: template.version + 1 },
    });

    this.logger.audit('Alert template restored', { templateId: id });
    return restored;
  }
}
