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
exports.TreatmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TreatmentsService = class TreatmentsService {
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
        return this.prisma.treatment.create({
            data: {
                ...dto,
                farmId,
                treatmentDate: new Date(dto.treatmentDate),
                withdrawalEndDate: new Date(dto.withdrawalEndDate),
            },
            include: {
                animal: { select: { id: true, visualId: true, currentEid: true } },
                product: true,
                veterinarian: true,
                route: true,
            },
        });
    }
    async findAll(farmId, query) {
        const where = {
            animal: { farmId },
            deletedAt: null,
        };
        if (query.animalId)
            where.animalId = query.animalId;
        if (query.status)
            where.status = query.status;
        if (query.fromDate || query.toDate) {
            where.treatmentDate = {};
            if (query.fromDate)
                where.treatmentDate.gte = new Date(query.fromDate);
            if (query.toDate)
                where.treatmentDate.lte = new Date(query.toDate);
        }
        return this.prisma.treatment.findMany({
            where,
            include: {
                animal: { select: { id: true, visualId: true, currentEid: true } },
                product: { select: { id: true, name: true } },
                veterinarian: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { treatmentDate: 'desc' },
        });
    }
    async findOne(farmId, id) {
        const treatment = await this.prisma.treatment.findFirst({
            where: {
                id,
                animal: { farmId },
                deletedAt: null,
            },
            include: {
                animal: { select: { id: true, visualId: true, currentEid: true } },
                product: true,
                veterinarian: true,
                route: true,
            },
        });
        if (!treatment) {
            throw new common_1.NotFoundException(`Treatment ${id} not found`);
        }
        return treatment;
    }
    async update(farmId, id, dto) {
        const existing = await this.prisma.treatment.findFirst({
            where: {
                id,
                animal: { farmId },
                deletedAt: null,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Treatment ${id} not found`);
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
        if (dto.treatmentDate)
            updateData.treatmentDate = new Date(dto.treatmentDate);
        if (dto.withdrawalEndDate)
            updateData.withdrawalEndDate = new Date(dto.withdrawalEndDate);
        return this.prisma.treatment.update({
            where: { id },
            data: updateData,
            include: {
                animal: { select: { id: true, visualId: true, currentEid: true } },
                product: true,
                veterinarian: true,
                route: true,
            },
        });
    }
    async remove(farmId, id) {
        const existing = await this.prisma.treatment.findFirst({
            where: {
                id,
                animal: { farmId },
                deletedAt: null,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Treatment ${id} not found`);
        }
        return this.prisma.treatment.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                version: existing.version + 1,
            },
        });
    }
};
exports.TreatmentsService = TreatmentsService;
exports.TreatmentsService = TreatmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TreatmentsService);
//# sourceMappingURL=treatments.service.js.map