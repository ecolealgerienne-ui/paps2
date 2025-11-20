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
exports.WeightsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WeightsService = class WeightsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(farmId, dto) {
        const animal = await this.prisma.animal.findFirst({
            where: { id: dto.animalId, farmId, deletedAt: null },
        });
        if (!animal) {
            throw new common_1.NotFoundException(`Animal ${dto.animalId} not found`);
        }
        return this.prisma.weight.create({
            data: {
                ...dto,
                farmId,
                recordedAt: new Date(dto.recordedAt),
            },
            include: {
                animal: { select: { id: true, visualId: true, currentEid: true } },
            },
        });
    }
    async findAll(farmId, query) {
        const where = {
            farmId,
            deletedAt: null,
        };
        if (query.animalId)
            where.animalId = query.animalId;
        if (query.source)
            where.source = query.source;
        if (query.fromDate || query.toDate) {
            where.recordedAt = {};
            if (query.fromDate)
                where.recordedAt.gte = new Date(query.fromDate);
            if (query.toDate)
                where.recordedAt.lte = new Date(query.toDate);
        }
        return this.prisma.weight.findMany({
            where,
            include: {
                animal: { select: { id: true, visualId: true, currentEid: true } },
            },
            orderBy: { recordedAt: 'desc' },
        });
    }
    async findOne(farmId, id) {
        const weight = await this.prisma.weight.findFirst({
            where: {
                id,
                farmId,
                deletedAt: null,
            },
            include: {
                animal: { select: { id: true, visualId: true, currentEid: true } },
            },
        });
        if (!weight) {
            throw new common_1.NotFoundException(`Weight ${id} not found`);
        }
        return weight;
    }
    async update(farmId, id, dto) {
        const existing = await this.prisma.weight.findFirst({
            where: {
                id,
                farmId,
                deletedAt: null,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Weight ${id} not found`);
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
        if (dto.recordedAt)
            updateData.recordedAt = new Date(dto.recordedAt);
        return this.prisma.weight.update({
            where: { id },
            data: updateData,
            include: {
                animal: { select: { id: true, visualId: true, currentEid: true } },
            },
        });
    }
    async remove(farmId, id) {
        const existing = await this.prisma.weight.findFirst({
            where: {
                id,
                farmId,
                deletedAt: null,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Weight ${id} not found`);
        }
        return this.prisma.weight.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                version: existing.version + 1,
            },
        });
    }
    async getAnimalWeightHistory(farmId, animalId) {
        const weights = await this.prisma.weight.findMany({
            where: {
                animalId,
                farmId,
                deletedAt: null,
            },
            orderBy: { recordedAt: 'asc' },
        });
        const history = weights.map((w, i) => {
            let dailyGain = null;
            if (i > 0) {
                const prevWeight = weights[i - 1];
                const daysDiff = Math.ceil((w.recordedAt.getTime() - prevWeight.recordedAt.getTime()) / (1000 * 60 * 60 * 24));
                if (daysDiff > 0) {
                    dailyGain = (w.weight - prevWeight.weight) / daysDiff;
                }
            }
            return {
                ...w,
                dailyGain: dailyGain !== null ? Math.round(dailyGain * 1000) / 1000 : null,
            };
        });
        return history;
    }
};
exports.WeightsService = WeightsService;
exports.WeightsService = WeightsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WeightsService);
//# sourceMappingURL=weights.service.js.map