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

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private prisma: PrismaService) {}

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
          id: item.id,
          entityId: item.entityId,
          status: 'failed',
          errorMessage: error.message,
        });
      }
    }

    const summary = {
      total: results.length,
      synced: results.filter(r => r.status === 'synced').length,
      conflicts: results.filter(r => r.status === 'conflict').length,
      failed: results.filter(r => r.status === 'failed').length,
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
      results,
      serverTimestamp: new Date().toISOString(),
      summary,
    };
  }

  private async processItem(item: SyncItemDto): Promise<SyncItemResultDto> {
    const modelName = this.getModelName(item.entityType);
    const model = this.prisma[modelName];

    if (!model) {
      return {
        id: item.id,
        entityId: item.entityId,
        status: 'failed',
        errorMessage: `Unknown entity type: ${item.entityType}`,
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
          id: item.id,
          entityId: item.entityId,
          status: 'failed',
          errorMessage: `Unknown action: ${item.action}`,
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
          id: item.id,
          entityId: item.entityId,
          status: 'conflict',
          serverData: existing,
          serverVersion: existing.version || 1,
        };
      }

      // Create the entity
      const created = await model.create({
        data: {
          ...item.payload,
          id: item.entityId,
          version: 1,
        },
      });

      return {
        id: item.id,
        entityId: item.entityId,
        status: 'synced',
        newVersion: created.version || 1,
      };
    } catch (error) {
      return {
        id: item.id,
        entityId: item.entityId,
        status: 'failed',
        errorMessage: error.message,
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
          id: item.id,
          entityId: item.entityId,
          status: 'failed',
          errorMessage: 'Entity not found',
        };
      }

      // Check for version conflict
      if (item.clientVersion && existing.version > item.clientVersion) {
        return {
          id: item.id,
          entityId: item.entityId,
          status: 'conflict',
          serverData: existing,
          serverVersion: existing.version,
        };
      }

      // Update with incremented version
      const updated = await model.update({
        where: { id: item.entityId },
        data: {
          ...item.payload,
          version: (existing.version || 1) + 1,
        },
      });

      return {
        id: item.id,
        entityId: item.entityId,
        status: 'synced',
        newVersion: updated.version,
      };
    } catch (error) {
      return {
        id: item.id,
        entityId: item.entityId,
        status: 'failed',
        errorMessage: error.message,
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
          id: item.id,
          entityId: item.entityId,
          status: 'synced',
        };
      }

      // Soft delete
      await model.update({
        where: { id: item.entityId },
        data: {
          deletedAt: new Date(),
          version: (existing.version || 1) + 1,
        },
      });

      return {
        id: item.id,
        entityId: item.entityId,
        status: 'synced',
      };
    } catch (error) {
      return {
        id: item.id,
        entityId: item.entityId,
        status: 'failed',
        errorMessage: error.message,
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
        // Get updated records
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
