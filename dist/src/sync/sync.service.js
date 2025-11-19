"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const dto_1 = require("./dto");
let SyncService = SyncService_1 = class SyncService {
    prisma;
    logger = new common_1.Logger(SyncService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async pushChanges(dto) {
        const results = [];
        const startTime = Date.now();
        for (const item of dto.items) {
            try {
                const result = await this.processItem(item);
                results.push(result);
            }
            catch (error) {
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
    async processItem(item) {
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
            case dto_1.SyncAction.CREATE:
                return this.handleCreate(item, model);
            case dto_1.SyncAction.UPDATE:
                return this.handleUpdate(item, model);
            case dto_1.SyncAction.DELETE:
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
    async handleCreate(item, model) {
        try {
            const existing = await model.findUnique({
                where: { id: item.entityId },
            });
            if (existing) {
                return {
                    id: item.id,
                    entityId: item.entityId,
                    status: 'conflict',
                    serverData: existing,
                    serverVersion: existing.version || 1,
                };
            }
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
        }
        catch (error) {
            return {
                id: item.id,
                entityId: item.entityId,
                status: 'failed',
                errorMessage: error.message,
            };
        }
    }
    async handleUpdate(item, model) {
        try {
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
            if (item.clientVersion && existing.version > item.clientVersion) {
                return {
                    id: item.id,
                    entityId: item.entityId,
                    status: 'conflict',
                    serverData: existing,
                    serverVersion: existing.version,
                };
            }
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
        }
        catch (error) {
            return {
                id: item.id,
                entityId: item.entityId,
                status: 'failed',
                errorMessage: error.message,
            };
        }
    }
    async handleDelete(item, model) {
        try {
            const existing = await model.findUnique({
                where: { id: item.entityId },
            });
            if (!existing) {
                return {
                    id: item.id,
                    entityId: item.entityId,
                    status: 'synced',
                };
            }
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
        }
        catch (error) {
            return {
                id: item.id,
                entityId: item.entityId,
                status: 'failed',
                errorMessage: error.message,
            };
        }
    }
    async pullChanges(query) {
        const changes = [];
        const since = query.since ? new Date(query.since) : new Date(0);
        const entityTypes = query.entityTypes || Object.values(dto_1.EntityType);
        const limit = 1000;
        for (const entityType of entityTypes) {
            const modelName = this.getModelName(entityType);
            const model = this.prisma[modelName];
            if (!model)
                continue;
            try {
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
            }
            catch (error) {
                this.logger.error(`Failed to pull ${entityType}:`, error);
            }
        }
        changes.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        const hasMore = changes.length >= limit;
        return {
            changes: changes.slice(0, limit),
            serverTimestamp: new Date().toISOString(),
            hasMore,
        };
    }
    getModelName(entityType) {
        const mapping = {
            [dto_1.EntityType.ANIMAL]: 'animal',
            [dto_1.EntityType.LOT]: 'lot',
            [dto_1.EntityType.LOT_ANIMAL]: 'lotAnimal',
            [dto_1.EntityType.TREATMENT]: 'treatment',
            [dto_1.EntityType.VACCINATION]: 'vaccination',
            [dto_1.EntityType.MOVEMENT]: 'movement',
            [dto_1.EntityType.WEIGHT]: 'weight',
            [dto_1.EntityType.BREEDING]: 'breeding',
            [dto_1.EntityType.CAMPAIGN]: 'campaign',
            [dto_1.EntityType.DOCUMENT]: 'document',
        };
        return mapping[entityType];
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SyncService);
//# sourceMappingURL=sync.service.js.map