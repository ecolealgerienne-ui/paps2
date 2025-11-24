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
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private prisma: PrismaService,
    private normalizer: PayloadNormalizerService,
  ) {}

  /**
   * Format error response with standardized ERROR_CODE
   * @param entityId Entity ID being processed
   * @param code Error code from ERROR_CODES enum
   * @param message Human-readable error message
   * @param context Additional context (optional)
   */
  private formatErrorResult(
    entityId: string,
    code: string,
    message: string,
    context?: Record<string, any>,
  ): SyncItemResultDto {
    return {
      entityId,
      success: false,
      error: {
        code,
        message,
        ...(context && { context }),
      },
    };
  }

  async pushChanges(dto: SyncPushDto): Promise<SyncPushResponseDto> {
    const results: SyncItemResultDto[] = [];
    const startTime = Date.now();

    this.logger.log(`📤 Push sync started: ${dto.items.length} items`);

    for (const item of dto.items) {
      try {
        const result = await this.processItem(item);
        results.push(result);
      } catch (error) {
        this.logger.error(
          `Failed to process sync item ${item.entityId}:`,
          error.stack,
        );
        results.push(
          this.formatErrorResult(
            item.entityId,
            ERROR_CODES.INTERNAL_SERVER_ERROR,
            `Sync processing failed: ${error.message}`,
            { action: item.action, entityType: item.entityType },
          ),
        );
      }
    }

    const summary = {
      total: results.length,
      synced: results.filter((r) => r.success && !r.error).length,
      conflicts: results.filter(
        (r) => r.error && typeof r.error === 'object' && r.error.code === ERROR_CODES.VERSION_CONFLICT,
      ).length,
      failed: results.filter((r) => !r.success).length,
    };

    // Log sync operation to database
    try {
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
    } catch (error) {
      this.logger.error('Failed to log sync operation', error.stack);
    }

    this.logger.log(
      `📤 Push sync completed: ${summary.synced}/${summary.total} synced, ` +
        `${summary.conflicts} conflicts, ${summary.failed} failed ` +
        `(${Date.now() - startTime}ms)`,
    );

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

      // === SPECIAL CASE: Lot with animalIds ===
      if (item.entityType === 'lot' && normalizedPayload._animalIds) {
        return this.handleLotCreateWithAnimals(item.entityId, normalizedPayload);
      }

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
      return this.formatErrorResult(
        item.entityId,
        ERROR_CODES.SYNC_CREATE_FAILED,
        `Failed to create ${item.entityType}: ${error.message}`,
        { entityType: item.entityType },
      );
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

      // === SPECIAL CASE: Lot with animalIds ===
      if (item.entityType === 'lot' && normalizedPayload._animalIds) {
        return this.handleLotUpdateWithAnimals(item.entityId, normalizedPayload, existing);
      }

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
      return this.formatErrorResult(
        item.entityId,
        ERROR_CODES.SYNC_UPDATE_FAILED,
        `Failed to update ${item.entityType}: ${error.message}`,
        { entityType: item.entityType },
      );
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
      return this.formatErrorResult(
        item.entityId,
        ERROR_CODES.SYNC_DELETE_FAILED,
        `Failed to delete ${item.entityType}: ${error.message}`,
        { entityType: item.entityType },
      );
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

  /**
   * Handle Lot creation with animalIds
   * Creates Lot + LotAnimal junction records
   * Based on BACKEND_DELTA.md section 6
   */
  /**
   * Create Lot with Animals - ATOMIC TRANSACTION
   * ✅ CRITICAL: Lot + LotAnimal must succeed or fail together
   */
  private async handleLotCreateWithAnimals(
    lotId: string,
    payload: any,
  ): Promise<SyncItemResultDto> {
    try {
      const { _animalIds, ...lotData } = payload;
      const animalIds = _animalIds as string[];

      this.logger.debug(
        `Creating lot ${lotId} with ${animalIds?.length || 0} animals`,
      );

      // ✅ TRANSACTION: Lot + LotAnimal atomique
      const lot = await this.prisma.$transaction(
        async (tx) => {
          // 1. Create the lot
          const createdLot = await tx.lot.create({
            data: {
              ...lotData,
              id: lotId,
              version: 1,
            },
          });

          // 2. Create LotAnimal relations (in same transaction)
          if (animalIds && animalIds.length > 0) {
            await tx.lotAnimal.createMany({
              data: animalIds.map((animalId) => ({
                lotId: createdLot.id,
                animalId,
                farmId: createdLot.farmId,
                joinedAt: new Date(),
              })),
              skipDuplicates: true,
            });
          }

          return createdLot;
        },
        {
          maxWait: 5000, // Wait max 5s to start transaction
          timeout: 10000, // Transaction max 10s
        },
      );

      this.logger.log(
        `Lot created: ${lotId} with ${animalIds?.length || 0} animals`,
      );

      return {
        entityId: lotId,
        success: true,
        serverVersion: lot.version,
        error: null,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create lot ${lotId}: ${error.message}`,
        error.stack,
      );

      return {
        entityId: lotId,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update Lot with Animals - ATOMIC TRANSACTION
   * ✅ CRITICAL: Update Lot + Resync LotAnimal must succeed or fail together
   */
  private async handleLotUpdateWithAnimals(
    lotId: string,
    payload: any,
    existing: any,
  ): Promise<SyncItemResultDto> {
    try {
      const { _animalIds, ...lotData } = payload;
      const animalIds = _animalIds as string[];

      this.logger.debug(
        `Updating lot ${lotId} (version ${existing.version})` +
          `${animalIds !== undefined ? ` with ${animalIds.length} animals` : ''}`,
      );

      // ✅ TRANSACTION: Update Lot + Resync LotAnimal atomique
      const lot = await this.prisma.$transaction(
        async (tx) => {
          // 1. Update the lot
          const updatedLot = await tx.lot.update({
            where: { id: lotId },
            data: {
              ...lotData,
              version: (existing.version || 1) + 1,
            },
          });

          // 2. Synchronize animalIds if provided
          if (animalIds !== undefined) {
            // 2a. Delete old relations
            await tx.lotAnimal.deleteMany({
              where: { lotId },
            });

            // 2b. Create new relations
            if (animalIds.length > 0) {
              await tx.lotAnimal.createMany({
                data: animalIds.map((animalId) => ({
                  lotId: updatedLot.id,
                  animalId,
                  farmId: updatedLot.farmId,
                  joinedAt: new Date(),
                })),
                skipDuplicates: true,
              });
            }
          }

          return updatedLot;
        },
        {
          maxWait: 5000,
          timeout: 10000,
        },
      );

      this.logger.log(
        `Lot updated: ${lotId} (version ${existing.version} → ${lot.version})` +
          `${animalIds !== undefined ? ` with ${animalIds.length} animals` : ''}`,
      );

      return {
        entityId: lotId,
        success: true,
        serverVersion: lot.version,
        error: null,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update lot ${lotId}: ${error.message}`,
        error.stack,
      );

      return {
        entityId: lotId,
        success: false,
        error: error.message,
      };
    }
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
