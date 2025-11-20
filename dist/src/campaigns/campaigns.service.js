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
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CampaignsService = class CampaignsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(farmId, dto) {
        if (dto.lotId) {
            const lot = await this.prisma.lot.findFirst({
                where: { id: dto.lotId, farmId, deletedAt: null },
            });
            if (!lot) {
                throw new common_1.NotFoundException(`Lot ${dto.lotId} not found`);
            }
        }
        return this.prisma.campaign.create({
            data: {
                ...dto,
                farmId,
                campaignDate: new Date(dto.campaignDate),
                withdrawalEndDate: new Date(dto.withdrawalEndDate),
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                endDate: dto.endDate ? new Date(dto.endDate) : null,
            },
            include: {
                lot: { select: { id: true, name: true, type: true } },
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
        if (query.status)
            where.status = query.status;
        if (query.fromDate || query.toDate) {
            where.startDate = {};
            if (query.fromDate)
                where.startDate.gte = new Date(query.fromDate);
            if (query.toDate)
                where.startDate.lte = new Date(query.toDate);
        }
        return this.prisma.campaign.findMany({
            where,
            include: {
                lot: { select: { id: true, name: true, type: true } },
            },
            orderBy: { startDate: 'desc' },
        });
    }
    async findOne(farmId, id) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id, farmId, deletedAt: null },
            include: {
                lot: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        _count: { select: { lotAnimals: true } },
                    },
                },
            },
        });
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign ${id} not found`);
        }
        return campaign;
    }
    async update(farmId, id, dto) {
        const existing = await this.prisma.campaign.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Campaign ${id} not found`);
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
        if (dto.startDate)
            updateData.startDate = new Date(dto.startDate);
        if (dto.endDate)
            updateData.endDate = new Date(dto.endDate);
        return this.prisma.campaign.update({
            where: { id },
            data: updateData,
            include: {
                lot: { select: { id: true, name: true, type: true } },
            },
        });
    }
    async remove(farmId, id) {
        const existing = await this.prisma.campaign.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Campaign ${id} not found`);
        }
        return this.prisma.campaign.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                version: existing.version + 1,
            },
        });
    }
    async getActiveCampaigns(farmId) {
        return this.prisma.campaign.findMany({
            where: {
                farmId,
                deletedAt: null,
                status: 'in_progress',
            },
            include: {
                lot: { select: { id: true, name: true } },
            },
            orderBy: { startDate: 'asc' },
        });
    }
    async getCampaignProgress(farmId, id) {
        const campaign = await this.findOne(farmId, id);
        const progress = {
            targetCount: campaign.targetCount || 0,
            completedCount: campaign.completedCount,
            progressPercent: campaign.targetCount
                ? Math.round((campaign.completedCount / campaign.targetCount) * 100)
                : 0,
        };
        return { campaign, progress };
    }
    async complete(farmId, id) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign ${id} not found`);
        }
        return this.prisma.campaign.update({
            where: { id },
            data: {
                status: 'completed',
                endDate: new Date(),
                version: campaign.version + 1,
            },
            include: {
                lot: { select: { id: true, name: true, type: true } },
            },
        });
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map