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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const enums_1 = require("../common/enums");
let MovementsService = class MovementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(farmId, dto) {
        const animals = await this.prisma.animal.findMany({
            where: {
                id: { in: dto.animalIds },
                farmId,
                deletedAt: null,
            },
        });
        if (animals.length !== dto.animalIds.length) {
            throw new common_1.BadRequestException('One or more animals not found');
        }
        return this.prisma.$transaction(async (tx) => {
            const movement = await tx.movement.create({
                data: {
                    id: dto.id,
                    farmId,
                    movementType: dto.movementType,
                    movementDate: new Date(dto.movementDate),
                    reason: dto.reason,
                    buyerName: dto.buyerName,
                    buyerType: dto.buyerType,
                    buyerContact: dto.buyerContact,
                    salePrice: dto.salePrice,
                    sellerName: dto.sellerName,
                    purchasePrice: dto.purchasePrice,
                    destinationFarmId: dto.destinationFarmId,
                    originFarmId: dto.originFarmId,
                    temporaryType: dto.temporaryType,
                    expectedReturnDate: dto.expectedReturnDate ? new Date(dto.expectedReturnDate) : null,
                    documentNumber: dto.documentNumber,
                    notes: dto.notes,
                },
            });
            await tx.movementAnimal.createMany({
                data: dto.animalIds.map(animalId => ({
                    movementId: movement.id,
                    animalId,
                })),
            });
            const statusUpdate = this.getStatusUpdate(dto.movementType);
            if (statusUpdate) {
                await tx.animal.updateMany({
                    where: { id: { in: dto.animalIds } },
                    data: { status: statusUpdate },
                });
            }
            return this.findOne(farmId, movement.id);
        });
    }
    getStatusUpdate(movementType) {
        switch (movementType) {
            case enums_1.MovementType.SALE:
                return 'sold';
            case enums_1.MovementType.DEATH:
                return 'dead';
            case enums_1.MovementType.EXIT:
                return 'sold';
            default:
                return null;
        }
    }
    async findAll(farmId, query) {
        const where = {
            farmId,
            deletedAt: null,
        };
        if (query.movementType)
            where.movementType = query.movementType;
        if (query.fromDate || query.toDate) {
            where.movementDate = {};
            if (query.fromDate)
                where.movementDate.gte = new Date(query.fromDate);
            if (query.toDate)
                where.movementDate.lte = new Date(query.toDate);
        }
        if (query.animalId) {
            where.movementAnimals = {
                some: { animalId: query.animalId },
            };
        }
        return this.prisma.movement.findMany({
            where,
            include: {
                movementAnimals: {
                    include: {
                        animal: {
                            select: {
                                id: true,
                                visualId: true,
                                currentEid: true,
                                sex: true,
                            },
                        },
                    },
                },
                _count: { select: { movementAnimals: true } },
            },
            orderBy: { movementDate: 'desc' },
        });
    }
    async findOne(farmId, id) {
        const movement = await this.prisma.movement.findFirst({
            where: { id, farmId, deletedAt: null },
            include: {
                movementAnimals: {
                    include: {
                        animal: {
                            select: {
                                id: true,
                                visualId: true,
                                currentEid: true,
                                sex: true,
                                birthDate: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });
        if (!movement) {
            throw new common_1.NotFoundException(`Movement ${id} not found`);
        }
        return movement;
    }
    async update(farmId, id, dto) {
        const existing = await this.prisma.movement.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Movement ${id} not found`);
        }
        if (dto.version && existing.version > dto.version) {
            throw new common_1.ConflictException({
                message: 'Version conflict',
                serverVersion: existing.version,
                serverData: existing,
            });
        }
        const updateData = {
            ...dto,
            version: existing.version + 1,
        };
        if (dto.movementDate)
            updateData.movementDate = new Date(dto.movementDate);
        return this.prisma.movement.update({
            where: { id },
            data: updateData,
            include: {
                movementAnimals: {
                    include: {
                        animal: {
                            select: {
                                id: true,
                                visualId: true,
                                currentEid: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async remove(farmId, id) {
        const existing = await this.prisma.movement.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Movement ${id} not found`);
        }
        return this.prisma.movement.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                version: existing.version + 1,
            },
        });
    }
    async getStatistics(farmId, fromDate, toDate) {
        const where = {
            farmId,
            deletedAt: null,
        };
        if (fromDate || toDate) {
            where.movementDate = {};
            if (fromDate)
                where.movementDate.gte = new Date(fromDate);
            if (toDate)
                where.movementDate.lte = new Date(toDate);
        }
        const movements = await this.prisma.movement.findMany({
            where,
            include: {
                _count: { select: { movementAnimals: true } },
            },
        });
        const stats = {
            totalMovements: movements.length,
            byType: {},
            totalSales: 0,
            totalPurchases: 0,
        };
        for (const m of movements) {
            if (!stats.byType[m.movementType]) {
                stats.byType[m.movementType] = { count: 0, animalCount: 0 };
            }
            stats.byType[m.movementType].count++;
            stats.byType[m.movementType].animalCount += m._count.movementAnimals;
            if (m.salePrice)
                stats.totalSales += m.salePrice;
            if (m.purchasePrice)
                stats.totalPurchases += m.purchasePrice;
        }
        return stats;
    }
};
exports.MovementsService = MovementsService;
exports.MovementsService = MovementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MovementsService);
//# sourceMappingURL=movements.service.js.map