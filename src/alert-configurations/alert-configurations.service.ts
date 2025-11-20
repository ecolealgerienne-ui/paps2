import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAlertConfigurationDto, QueryAlertConfigurationDto } from './dto';

@Injectable()
export class AlertConfigurationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(farmId: string, query: QueryAlertConfigurationDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.type) where.type = query.type;
    if (query.category) where.category = query.category;
    if (query.enabled !== undefined) where.enabled = query.enabled;

    return this.prisma.alertConfiguration.findMany({
      where,
      orderBy: [{ category: 'asc' }, { severity: 'desc' }],
    });
  }

  async findOne(farmId: string, id: string) {
    const config = await this.prisma.alertConfiguration.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!config) {
      throw new NotFoundException(`Alert configuration ${id} not found`);
    }

    return config;
  }

  async update(farmId: string, id: string, dto: UpdateAlertConfigurationDto) {
    const existing = await this.prisma.alertConfiguration.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Alert configuration ${id} not found`);
    }

    if (dto.version && existing.version > dto.version) {
      throw new ConflictException({
        message: 'Version conflict',
        serverVersion: existing.version,
        serverData: existing,
      });
    }

    return this.prisma.alertConfiguration.update({
      where: { id },
      data: {
        ...dto,
        version: existing.version + 1,
      },
    });
  }
}
