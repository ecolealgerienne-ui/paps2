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
exports.BreedingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BreedingsService = class BreedingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(farmId, dto) {
        const female = await this.prisma.animal.findFirst({
            where: { id: dto.femaleId, farmId, deletedAt: null },
        });
        if (!female) {
            throw new common_1.NotFoundException(`Female animal ${dto.femaleId} not found`);
        }
        if (female.sex !== 'female') {
            throw new common_1.BadRequestException('Animal must be female');
        }
        if (dto.maleId) {
            const male = await this.prisma.animal.findFirst({
                where: { id: dto.maleId, farmId, deletedAt: null },
            });
            if (!male) {
                throw new common_1.NotFoundException(`Male animal ${dto.maleId} not found`);
            }
            if (male.sex !== 'male') {
                throw new common_1.BadRequestException('Animal must be male');
            }
        }
        return this.prisma.breeding.create({
            data: {
                ...dto,
                breedingDate: new Date(dto.breedingDate),
                expectedDueDate: dto.expectedDueDate ? new Date(dto.expectedDueDate) : null,
            },
            include: {
                female: { select: { id: true, visualId: true, currentEid: true } },
                male: { select: { id: true, visualId: true, currentEid: true } },
            },
        });
    }
    async findAll(farmId, query) {
        const where = {
            female: { farmId },
            deletedAt: null,
        };
        if (query.femaleId)
            where.femaleId = query.femaleId;
        if (query.status)
            where.status = query.status;
        if (query.fromDate || query.toDate) {
            where.breedingDate = {};
            if (query.fromDate)
                where.breedingDate.gte = new Date(query.fromDate);
            if (query.toDate)
                where.breedingDate.lte = new Date(query.toDate);
        }
        return this.prisma.breeding.findMany({
            where,
            include: {
                female: { select: { id: true, visualId: true, currentEid: true } },
                male: { select: { id: true, visualId: true, currentEid: true } },
                offspring: { select: { id: true, visualId: true, currentEid: true } },
            },
            orderBy: { breedingDate: 'desc' },
        });
    }
    async findOne(farmId, id) {
        const breeding = await this.prisma.breeding.findFirst({
            where: {
                id,
                female: { farmId },
                deletedAt: null,
            },
            include: {
                female: { select: { id: true, visualId: true, currentEid: true, birthDate: true } },
                male: { select: { id: true, visualId: true, currentEid: true } },
                offspring: { select: { id: true, visualId: true, currentEid: true, birthDate: true } },
            },
        });
        if (!breeding) {
            throw new common_1.NotFoundException(`Breeding ${id} not found`);
        }
        return breeding;
    }
    async update(farmId, id, dto) {
        const existing = await this.prisma.breeding.findFirst({
            where: {
                id,
                female: { farmId },
                deletedAt: null,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Breeding ${id} not found`);
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
        if (dto.breedingDate)
            updateData.breedingDate = new Date(dto.breedingDate);
        if (dto.expectedDueDate)
            updateData.expectedDueDate = new Date(dto.expectedDueDate);
        if (dto.actualDueDate)
            updateData.actualDueDate = new Date(dto.actualDueDate);
        return this.prisma.breeding.update({
            where: { id },
            data: updateData,
            include: {
                female: { select: { id: true, visualId: true, currentEid: true } },
                male: { select: { id: true, visualId: true, currentEid: true } },
                offspring: { select: { id: true, visualId: true, currentEid: true } },
            },
        });
    }
    async remove(farmId, id) {
        const existing = await this.prisma.breeding.findFirst({
            where: {
                id,
                female: { farmId },
                deletedAt: null,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Breeding ${id} not found`);
        }
        return this.prisma.breeding.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                version: existing.version + 1,
            },
        });
    }
    async getUpcomingDueDates(farmId, days = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return this.prisma.breeding.findMany({
            where: {
                female: { farmId },
                deletedAt: null,
                status: { in: ['confirmed', 'in_progress'] },
                expectedDueDate: {
                    gte: new Date(),
                    lte: futureDate,
                },
            },
            include: {
                female: { select: { id: true, visualId: true, currentEid: true } },
            },
            orderBy: { expectedDueDate: 'asc' },
        });
    }
};
exports.BreedingsService = BreedingsService;
exports.BreedingsService = BreedingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BreedingsService);
//# sourceMappingURL=breedings.service.js.map