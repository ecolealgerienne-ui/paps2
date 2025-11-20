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
exports.LotsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LotsService = class LotsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(farmId, dto) {
        return this.prisma.lot.create({
            data: {
                ...dto,
                farmId,
            },
            include: {
                _count: { select: { lotAnimals: true } },
            },
        });
    }
    async findAll(farmId, query) {
        const where = {
            farmId,
            deletedAt: null,
        };
        if (query.type)
            where.type = query.type;
        if (query.isActive !== undefined)
            where.isActive = query.isActive;
        if (query.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }
        return this.prisma.lot.findMany({
            where,
            include: {
                _count: { select: { lotAnimals: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(farmId, id) {
        const lot = await this.prisma.lot.findFirst({
            where: { id, farmId, deletedAt: null },
            include: {
                lotAnimals: {
                    where: { leftAt: null },
                    include: {
                        animal: {
                            select: {
                                id: true,
                                visualId: true,
                                currentEid: true,
                                sex: true,
                                status: true,
                                birthDate: true,
                            },
                        },
                    },
                },
                _count: { select: { lotAnimals: true } },
            },
        });
        if (!lot) {
            throw new common_1.NotFoundException(`Lot ${id} not found`);
        }
        return lot;
    }
    async update(farmId, id, dto) {
        const existing = await this.prisma.lot.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Lot ${id} not found`);
        }
        if (dto.version && existing.version > dto.version) {
            throw new common_1.ConflictException({
                message: 'Version conflict',
                serverVersion: existing.version,
                serverData: existing,
            });
        }
        return this.prisma.lot.update({
            where: { id },
            data: {
                ...dto,
                version: existing.version + 1,
            },
            include: {
                _count: { select: { lotAnimals: true } },
            },
        });
    }
    async remove(farmId, id) {
        const existing = await this.prisma.lot.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Lot ${id} not found`);
        }
        return this.prisma.lot.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                version: existing.version + 1,
            },
        });
    }
    async addAnimals(farmId, lotId, dto) {
        const lot = await this.prisma.lot.findFirst({
            where: { id: lotId, farmId, deletedAt: null },
        });
        if (!lot) {
            throw new common_1.NotFoundException(`Lot ${lotId} not found`);
        }
        const creates = dto.animalIds.map(animalId => ({
            farmId,
            lotId,
            animalId,
            joinedAt: new Date(),
        }));
        await this.prisma.lotAnimal.createMany({
            data: creates,
            skipDuplicates: true,
        });
        return this.findOne(farmId, lotId);
    }
    async removeAnimals(farmId, lotId, animalIds) {
        const lot = await this.prisma.lot.findFirst({
            where: { id: lotId, farmId, deletedAt: null },
        });
        if (!lot) {
            throw new common_1.NotFoundException(`Lot ${lotId} not found`);
        }
        await this.prisma.lotAnimal.updateMany({
            where: {
                lotId,
                animalId: { in: animalIds },
                leftAt: null,
            },
            data: {
                leftAt: new Date(),
            },
        });
        return this.findOne(farmId, lotId);
    }
    async finalize(farmId, lotId) {
        const lot = await this.prisma.lot.findFirst({
            where: { id: lotId, farmId, deletedAt: null },
        });
        if (!lot) {
            throw new common_1.NotFoundException(`Lot ${lotId} not found`);
        }
        return this.prisma.lot.update({
            where: { id: lotId },
            data: {
                completed: true,
                status: 'closed',
                version: lot.version + 1,
            },
            include: {
                _count: { select: { lotAnimals: true } },
            },
        });
    }
};
exports.LotsService = LotsService;
exports.LotsService = LotsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LotsService);
//# sourceMappingURL=lots.service.js.map