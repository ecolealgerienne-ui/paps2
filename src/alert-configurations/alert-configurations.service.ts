import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertConfigurationDto, UpdateAlertConfigurationDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

/**
 * Service for managing Alert Configurations (PHASE_14)
 * 1 configuration unique par ferme (farmId @unique)
 */
@Injectable()
export class AlertConfigurationsService {
  private readonly logger = new AppLogger(AlertConfigurationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create or return existing alert configuration for a farm
   * Since farmId is @unique, only 1 config per farm is allowed
   */
  async create(farmId: string, dto: CreateAlertConfigurationDto) {
    this.logger.debug(`Creating alert configuration for farm ${farmId}`);

    // Vérifier si une config existe déjà (soft delete check)
    const existing = await this.prisma.alertConfiguration.findFirst({
      where: { farmId, deletedAt: null },
    });

    if (existing) {
      this.logger.warn('Alert configuration already exists for this farm', { farmId, existingId: existing.id });
      throw new ConflictException(
        `Alert configuration already exists for farm ${farmId}. Use PUT to update.`
      );
    }

    try {
      const config = await this.prisma.alertConfiguration.create({
        data: {
          farmId,
          enableEmailAlerts: dto.enableEmailAlerts ?? true,
          enableSmsAlerts: dto.enableSmsAlerts ?? false,
          enablePushAlerts: dto.enablePushAlerts ?? true,
          vaccinationReminderDays: dto.vaccinationReminderDays ?? 7,
          treatmentReminderDays: dto.treatmentReminderDays ?? 3,
          healthCheckReminderDays: dto.healthCheckReminderDays ?? 30,
        },
        include: { farm: true },
      });

      this.logger.audit('Alert configuration created', { configId: config.id, farmId });
      return config;
    } catch (error) {
      this.logger.error(`Failed to create alert configuration for farm ${farmId}`, error.stack);
      throw error;
    }
  }

  /**
   * Get alert configuration for a farm
   */
  async findByFarm(farmId: string) {
    const config = await this.prisma.alertConfiguration.findFirst({
      where: { farmId, deletedAt: null },
      include: { farm: true },
    });

    if (!config) {
      this.logger.warn('Alert configuration not found for farm', { farmId });
      throw new NotFoundException(
        `No alert configuration found for farm ${farmId}`
      );
    }

    return config;
  }

  /**
   * Get or create alert configuration for a farm
   * Utile pour initialiser automatiquement avec valeurs par défaut
   */
  async findOrCreate(farmId: string) {
    this.logger.debug(`Finding or creating alert configuration for farm ${farmId}`);

    let config = await this.prisma.alertConfiguration.findFirst({
      where: { farmId, deletedAt: null },
      include: { farm: true },
    });

    if (!config) {
      this.logger.debug(`No config found, creating default for farm ${farmId}`);
      config = await this.prisma.alertConfiguration.create({
        data: {
          farmId,
          enableEmailAlerts: true,
          enableSmsAlerts: false,
          enablePushAlerts: true,
          vaccinationReminderDays: 7,
          treatmentReminderDays: 3,
          healthCheckReminderDays: 30,
        },
        include: { farm: true },
      });

      this.logger.audit('Alert configuration auto-created', { configId: config.id, farmId });
    }

    return config;
  }

  /**
   * Update alert configuration for a farm
   * Optimistic locking avec version
   */
  async update(farmId: string, dto: UpdateAlertConfigurationDto) {
    this.logger.debug(`Updating alert configuration for farm ${farmId}`);

    const existing = await this.prisma.alertConfiguration.findFirst({
      where: { farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Alert configuration not found for farm', { farmId });
      throw new NotFoundException(
        `No alert configuration found for farm ${farmId}`
      );
    }

    // Optimistic locking (PHASE_14)
    if (dto.version !== undefined && existing.version !== dto.version) {
      this.logger.warn('Version conflict', {
        farmId,
        expectedVersion: dto.version,
        actualVersion: existing.version,
      });

      throw new ConflictException(
        'Version conflict: the configuration has been modified by another user'
      );
    }

    try {
      const { version, ...updateData } = dto;

      const updated = await this.prisma.alertConfiguration.update({
        where: { id: existing.id },
        data: {
          ...updateData,
          version: existing.version + 1,
        },
        include: { farm: true },
      });

      this.logger.audit('Alert configuration updated', {
        configId: updated.id,
        farmId,
        version: `${existing.version} → ${updated.version}`,
      });

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update alert configuration for farm ${farmId}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete alert configuration for a farm
   */
  async remove(farmId: string) {
    this.logger.debug(`Soft deleting alert configuration for farm ${farmId}`);

    const existing = await this.prisma.alertConfiguration.findFirst({
      where: { farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Alert configuration not found for farm', { farmId });
      throw new NotFoundException(
        `No alert configuration found for farm ${farmId}`
      );
    }

    try {
      const deleted = await this.prisma.alertConfiguration.update({
        where: { id: existing.id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Alert configuration soft deleted', { configId: deleted.id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete alert configuration for farm ${farmId}`, error.stack);
      throw error;
    }
  }

  /**
   * Restore a soft-deleted alert configuration
   */
  async restore(farmId: string) {
    this.logger.debug(`Restoring alert configuration for farm ${farmId}`);

    const existing = await this.prisma.alertConfiguration.findFirst({
      where: { farmId },
    });

    if (!existing) {
      throw new NotFoundException(
        `No alert configuration found for farm ${farmId}`
      );
    }

    if (!existing.deletedAt) {
      throw new ConflictException('This configuration is not deleted');
    }

    try {
      const restored = await this.prisma.alertConfiguration.update({
        where: { id: existing.id },
        data: {
          deletedAt: null,
          version: existing.version + 1,
        },
        include: { farm: true },
      });

      this.logger.audit('Alert configuration restored', { configId: restored.id, farmId });
      return restored;
    } catch (error) {
      this.logger.error(`Failed to restore alert configuration for farm ${farmId}`, error.stack);
      throw error;
    }
  }
}
