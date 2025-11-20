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
const payload_normalizer_service_1 = require("./payload-normalizer.service");
let SyncService = SyncService_1 = class SyncService {
    prisma;
    normalizer;
    logger = new common_1.Logger(SyncService_1.name);
    constructor(prisma, normalizer) {
        this.prisma = prisma;
        this.normalizer = normalizer;
    }
    async pushChanges(dto) {
        const results = [];
        const startTime = Date.now();
        this.logger.log(`📤 Push sync started: ${dto.items.length} items`);
        for (const item of dto.items) {
            try {
                const result = await this.processItem(item);
                results.push(result);
            }
            catch (error) {
                this.logger.error(`Failed to process sync item ${item.entityId}:`, error.stack);
                results.push({
                    entityId: item.entityId,
                    success: false,
                    error: error.message,
                });
            }
        }
        const summary = {
            total: results.length,
            synced: results.filter((r) => r.success && !r.error).length,
            conflicts: results.filter((r) => r.error && r.error.includes('conflict')).length,
            failed: results.filter((r) => !r.success).length,
        };
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
        }
        catch (error) {
            this.logger.error('Failed to log sync operation', error.stack);
        }
        this.logger.log(`📤 Push sync completed: ${summary.synced}/${summary.total} synced, ` +
            `${summary.conflicts} conflicts, ${summary.failed} failed ` +
            `(${Date.now() - startTime}ms)`);
        return {
            success: true,
            results,
        };
    }
    async processItem(item) {
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
            case dto_1.SyncAction.CREATE:
                return this.handleCreate(item, model);
            case dto_1.SyncAction.UPDATE:
                return this.handleUpdate(item, model);
            case dto_1.SyncAction.DELETE:
                return this.handleDelete(item, model);
            default:
                return {
                    entityId: item.entityId,
                    success: false,
                    error: `Unknown action: ${item.action}`,
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
                    entityId: item.entityId,
                    success: false,
                    serverVersion: existing.version || 1,
                    error: `Entity already exists (conflict)`,
                    _internalStatus: 'conflict',
                    _internalServerData: existing,
                };
            }
            const normalizedPayload = this.normalizer.normalize(item.entityType, item.payload);
            if (item.entityType === 'lot' && normalizedPayload._animalIds) {
                return this.handleLotCreateWithAnimals(item.entityId, normalizedPayload);
            }
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
        }
        catch (error) {
            return {
                entityId: item.entityId,
                success: false,
                error: error.message,
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
                    entityId: item.entityId,
                    success: false,
                    error: 'Entity not found',
                };
            }
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
            const normalizedPayload = this.normalizer.normalize(item.entityType, item.payload);
            if (item.entityType === 'lot' && normalizedPayload._animalIds) {
                return this.handleLotUpdateWithAnimals(item.entityId, normalizedPayload, existing);
            }
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
        }
        catch (error) {
            return {
                entityId: item.entityId,
                success: false,
                error: error.message,
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
                    entityId: item.entityId,
                    success: true,
                    error: null,
                };
            }
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
        }
        catch (error) {
            return {
                entityId: item.entityId,
                success: false,
                error: error.message,
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
    async handleLotCreateWithAnimals(lotId, payload) {
        try {
            const { _animalIds, ...lotData } = payload;
            const animalIds = _animalIds;
            this.logger.debug(`Creating lot ${lotId} with ${animalIds?.length || 0} animals`);
            const lot = await this.prisma.$transaction(async (tx) => {
                const createdLot = await tx.lot.create({
                    data: {
                        ...lotData,
                        id: lotId,
                        version: 1,
                    },
                });
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
            }, {
                maxWait: 5000,
                timeout: 10000,
            });
            this.logger.log(`Lot created: ${lotId} with ${animalIds?.length || 0} animals`);
            return {
                entityId: lotId,
                success: true,
                serverVersion: lot.version,
                error: null,
            };
        }
        catch (error) {
            this.logger.error(`Failed to create lot ${lotId}: ${error.message}`, error.stack);
            return {
                entityId: lotId,
                success: false,
                error: error.message,
            };
        }
    }
    async handleLotUpdateWithAnimals(lotId, payload, existing) {
        try {
            const { _animalIds, ...lotData } = payload;
            const animalIds = _animalIds;
            this.logger.debug(`Updating lot ${lotId} (version ${existing.version})` +
                `${animalIds !== undefined ? ` with ${animalIds.length} animals` : ''}`);
            const lot = await this.prisma.$transaction(async (tx) => {
                const updatedLot = await tx.lot.update({
                    where: { id: lotId },
                    data: {
                        ...lotData,
                        version: (existing.version || 1) + 1,
                    },
                });
                if (animalIds !== undefined) {
                    await tx.lotAnimal.deleteMany({
                        where: { lotId },
                    });
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
            }, {
                maxWait: 5000,
                timeout: 10000,
            });
            this.logger.log(`Lot updated: ${lotId} (version ${existing.version} → ${lot.version})` +
                `${animalIds !== undefined ? ` with ${animalIds.length} animals` : ''}`);
            return {
                entityId: lotId,
                success: true,
                serverVersion: lot.version,
                error: null,
            };
        }
        catch (error) {
            this.logger.error(`Failed to update lot ${lotId}: ${error.message}`, error.stack);
            return {
                entityId: lotId,
                success: false,
                error: error.message,
            };
        }
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payload_normalizer_service_1.PayloadNormalizerService])
], SyncService);
//# sourceMappingURL=sync.service.js.map