import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SyncPushDto,
  SyncItemDto,
  EntityType,
  SyncAction,
  SyncPullQueryDto,
} from './dto';
import {
  SyncPushResponseDto,
  SyncItemResultDto,
  SyncPullResponseDto,
  SyncChangeDto,
} from './dto/sync-response.dto';
import { PayloadNormalizerService } from './payload-normalizer.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private prisma: PrismaService,
    private normalizer: PayloadNormalizerService,
  ) {}

  async pushChanges(dto: SyncPushDto): Promise<SyncPushResponseDto> {
    const results: SyncItemResultDto[] = [];
    const startTime = Date.now();

    for (const item of dto.items) {
      try {
        const result = await this.processItem(item);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to process sync item ${item.id}:`, error);
        results.push({
          entityId: item.entityId,
          success: false,
          error: error.message,
        });
      }
    }

    const summary = {
      total: results.length,
      synced: results.filter(r => r.success && !r.error).length,
      conflicts: results.filter(r => r.error && r.error.includes('conflict')).length,
      failed: results.filter(r => !r.success).length,
    };

    // Log sync operation
    await this.prisma.syncLog.create({
      data: {
        farmId: dto.items[0]?.farmId || 'unknown',
        syncType: 'push',
        itemsCount: summary.total,
        successCount: summary.synced,
        failureCount: summary.failed,
        conflictCount: summary.conflicts,
        duration: Date.now() - startTime,
      },
    });

    return {
      success: true,
      results,
    };
  }

  private async processItem(item: SyncItemDto): Promise<SyncItemResultDto> {
    const modelName = this.getModelName(item.entityType);
    const model = this.prisma[modelName];

    if (!model) {
      return {
        entityId: item.entityId,
        success: false,
        error: `Unknown entity type: ${item.entityType}`,
      };
    }

    switch (item.action) {
      case SyncAction.CREATE:
        return this.handleCreate(item, model);
      case SyncAction.UPDATE:
        return this.handleUpdate(item, model);
      case SyncAction.DELETE:
        return this.handleDelete(item, model);
      default:
        return {
          entityId: item.entityId,
          success: false,
          error: `Unknown action: ${item.action}`,
        };
    }
  }

  private async handleCreate(item: SyncItemDto, model: any): Promise<SyncItemResultDto> {
    try {
      // Check if entity already exists
      const existing = await model.findUnique({
        where: { id: item.entityId },
      });

      if (existing) {
        // Entity exists - this is a conflict
        return {
          entityId: item.entityId,
          success: false,
          serverVersion: existing.version || 1,
          error: `Entity already exists (conflict)`,
          _internalStatus: 'conflict',
          _internalServerData: existing,
        };
      }

      // Normalize payload from camelCase to snake_case
      const normalizedPayload = this.normalizer.normalize(item.entityType, item.payload);

      // Create the entity
      const created = await model.create({
        data: {
          ...normalizedPayload,
          id: item.entityId,
          version: 1,
        },
      });

      return {
        entityId: item.entityId,
        success: true,
        serverVersion: created.version || 1,
        error: null,
      };
    } catch (error) {
      return {
        entityId: item.entityId,
        success: false,
        error: error.message,
      };
    }
  }

  private async handleUpdate(item: SyncItemDto, model: any): Promise<SyncItemResultDto> {
    try {
      // Get current server version
      const existing = await model.findUnique({
        where: { id: item.entityId },
      });

      if (!existing) {
        return {
          entityId: item.entityId,
          success: false,
          error: 'Entity not found',
        };
      }

      // Check for version conflict
      if (item.clientVersion && existing.version > item.clientVersion) {
        return {
          entityId: item.entityId,
          success: false,
          serverVersion: existing.version,
          error: `Version conflict (server: ${existing.version}, client: ${item.clientVersion})`,
          _internalStatus: 'conflict',
          _internalServerData: existing,
        };
      }

      // Normalize payload from camelCase to snake_case
      const normalizedPayload = this.normalizer.normalize(item.entityType, item.payload);

      // Update with incremented version
      const updated = await model.update({
        where: { id: item.entityId },
        data: {
          ...normalizedPayload,
          version: (existing.version || 1) + 1,
        },
      });

      return {
        entityId: item.entityId,
        success: true,
        serverVersion: updated.version,
        error: null,
      };
    } catch (error) {
      return {
        entityId: item.entityId,
        success: false,
        error: error.message,
      };
    }
  }

  private async handleDelete(item: SyncItemDto, model: any): Promise<SyncItemResultDto> {
    try {
      const existing = await model.findUnique({
        where: { id: item.entityId },
      });

      if (!existing) {
        // Already deleted - consider it synced
        return {
          entityId: item.entityId,
          success: true,
          error: null,
        };
      }

      // Soft delete
      const deleted = await model.update({
        where: { id: item.entityId },
        data: {
          deletedAt: new Date(),
          version: (existing.version || 1) + 1,
        },
      });

      return {
        entityId: item.entityId,
        success: true,
        serverVersion: deleted.version,
        error: null,
      };
    } catch (error) {
      return {
        entityId: item.entityId,
        success: false,
        error: error.message,
      };
    }
  }

  async pullChanges(query: SyncPullQueryDto): Promise<SyncPullResponseDto> {
    const changes: SyncChangeDto[] = [];
    const since = query.since ? new Date(query.since) : new Date(0);
    const entityTypes = query.entityTypes || Object.values(EntityType);
    const limit = 1000; // Max items per pull

    for (const entityType of entityTypes) {
      const modelName = this.getModelName(entityType as EntityType);
      const model = this.prisma[modelName];

      if (!model) continue;

      try {
        // Get updated records - all models now have direct farmId
        const records = await model.findMany({
          where: {
            farmId: query.farmId,
            updatedAt: { gt: since },
          },
          orderBy: { updatedAt: 'asc' },
          take: limit,
        });

        for (const record of records) {
          changes.push({
            entityType,
            entityId: record.id,
            action: record.deletedAt ? 'delete' : 'update',
            data: record,
            version: record.version || 1,
            updatedAt: record.updatedAt?.toISOString() || new Date().toISOString(),
          });
        }
      } catch (error) {
        this.logger.error(`Failed to pull ${entityType}:`, error);
      }
    }

    // Sort by updatedAt
    changes.sort((a, b) =>
      new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );

    const hasMore = changes.length >= limit;

    return {
      changes: changes.slice(0, limit),
      serverTimestamp: new Date().toISOString(),
      hasMore,
    };
  }

  private getModelName(entityType: EntityType): string {
    const mapping: Record<EntityType, string> = {
      [EntityType.ANIMAL]: 'animal',
      [EntityType.LOT]: 'lot',
      [EntityType.LOT_ANIMAL]: 'lotAnimal',
      [EntityType.TREATMENT]: 'treatment',
      [EntityType.VACCINATION]: 'vaccination',
      [EntityType.MOVEMENT]: 'movement',
      [EntityType.WEIGHT]: 'weight',
      [EntityType.BREEDING]: 'breeding',
      [EntityType.CAMPAIGN]: 'campaign',
      [EntityType.DOCUMENT]: 'document',
    };
    return mapping[entityType];
  }
}
