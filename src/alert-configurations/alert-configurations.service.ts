import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAlertConfigurationDto, QueryAlertConfigurationDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class AlertConfigurationsService {
  private readonly logger = new AppLogger(AlertConfigurationsService.name);

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
      this.logger.warn('Alert configuration not found', { configId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.ALERT_CONFIGURATION_NOT_FOUND,
        `Alert configuration ${id} not found`,
        { configId: id, farmId },
      );
    }

    return config;
  }

  async update(farmId: string, id: string, dto: UpdateAlertConfigurationDto) {
    this.logger.debug(`Updating alert configuration ${id} (version ${dto.version})`);

    const existing = await this.prisma.alertConfiguration.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Alert configuration not found', { configId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.ALERT_CONFIGURATION_NOT_FOUND,
        `Alert configuration ${id} not found`,
        { configId: id, farmId },
      );
    }

    // Version conflict check
    if (dto.version && existing.version > dto.version) {
      this.logger.warn('Version conflict detected', {
        configId: id,
        serverVersion: existing.version,
        clientVersion: dto.version,
      });

      throw new EntityConflictException(
        ERROR_CODES.VERSION_CONFLICT,
        'Version conflict detected',
        {
          configId: id,
          serverVersion: existing.version,
          clientVersion: dto.version,
        },
      );
    }

    try {
      const updated = await this.prisma.alertConfiguration.update({
        where: { id },
        data: {
          ...dto,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Alert configuration updated', {
        configId: id,
        farmId,
        version: `${existing.version} → ${updated.version}`,
      });

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update alert configuration ${id}`, error.stack);
      throw error;
    }
  }
}
