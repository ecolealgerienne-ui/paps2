import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertCategory } from './types/alert-category.enum';
import { AlertPriority } from './types/alert-priority.enum';
import { CreateAlertTemplateDto } from './dto/create-alert-template.dto';
import { UpdateAlertTemplateDto } from './dto/update-alert-template.dto';

@Injectable()
export class AlertTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAlertTemplateDto) {
    // Check if code already exists
    const existing = await this.prisma.alertTemplate.findUnique({
      where: { code: dto.code },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Alert template with code "${dto.code}" already exists`);
    }

    // If soft-deleted, restore
    if (existing && existing.deletedAt) {
      return this.prisma.alertTemplate.update({
        where: { id: existing.id },
        data: {
          ...dto,
          deletedAt: null,
          version: existing.version + 1,
        },
      });
    }

    return this.prisma.alertTemplate.create({ data: dto });
  }

  async findAll(filters?: { category?: AlertCategory; priority?: AlertPriority; includeDeleted?: boolean }) {
    const where: any = {};

    // Filter soft delete
    if (!filters?.includeDeleted) {
      where.deletedAt = null;
    }

    // Filter by category
    if (filters?.category) {
      where.category = filters.category;
    }

    // Filter by priority
    if (filters?.priority) {
      where.priority = filters.priority;
    }

    return this.prisma.alertTemplate.findMany({
      where,
      orderBy: { nameFr: 'asc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.alertTemplate.findUnique({
      where: { id },
    });

    if (!template || template.deletedAt) {
      throw new NotFoundException(`Alert template with id "${id}" not found`);
    }

    return template;
  }

  async findByCode(code: string) {
    const template = await this.prisma.alertTemplate.findUnique({
      where: { code },
    });

    if (!template || template.deletedAt) {
      throw new NotFoundException(`Alert template with code "${code}" not found`);
    }

    return template;
  }

  async findByCategory(category: AlertCategory) {
    return this.prisma.alertTemplate.findMany({
      where: { category, deletedAt: null },
      orderBy: { nameFr: 'asc' },
    });
  }

  async findByPriority(priority: AlertPriority) {
    return this.prisma.alertTemplate.findMany({
      where: { priority, deletedAt: null },
      orderBy: { nameFr: 'asc' },
    });
  }

  async update(id: string, dto: UpdateAlertTemplateDto) {
    const existing = await this.findOne(id);

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict: the resource has been modified by another user');
    }

    return this.prisma.alertTemplate.update({
      where: { id },
      data: {
        ...dto,
        version: existing.version + 1,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);

    return this.prisma.alertTemplate.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }

  async restore(id: string) {
    const template = await this.prisma.alertTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Alert template not found');
    }

    if (!template.deletedAt) {
      throw new ConflictException('Alert template is not deleted');
    }

    return this.prisma.alertTemplate.update({
      where: { id },
      data: {
        deletedAt: null,
        version: template.version + 1,
      },
    });
  }
}
