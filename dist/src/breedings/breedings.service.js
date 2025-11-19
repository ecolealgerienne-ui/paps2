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
        const mother = await this.prisma.animal.findFirst({
            where: { id: dto.motherId, farmId, deletedAt: null },
        });
        if (!mother) {
            throw new common_1.NotFoundException(`Mother animal ${dto.motherId} not found`);
        }
        if (mother.sex !== 'female') {
            throw new common_1.BadRequestException('Animal must be female');
        }
        if (dto.fatherId) {
            const father = await this.prisma.animal.findFirst({
                where: { id: dto.fatherId, farmId, deletedAt: null },
            });
            if (!father) {
                throw new common_1.NotFoundException(`Father animal ${dto.fatherId} not found`);
            }
            if (father.sex !== 'male') {
                throw new common_1.BadRequestException('Animal must be male');
            }
        }
        return this.prisma.breeding.create({
            data: {
                ...dto,
                farmId,
                breedingDate: new Date(dto.breedingDate),
                expectedBirthDate: dto.expectedBirthDate ? new Date(dto.expectedBirthDate) : null,
            },
            include: {
                mother: { select: { id: true, visualId: true, currentEid: true } },
                father: { select: { id: true, visualId: true, currentEid: true } },
            },
        });
    }
    async findAll(farmId, query) {
        const where = {
            farmId,
            deletedAt: null,
        };
        if (query.motherId)
            where.motherId = query.motherId;
        if (query.fatherId)
            where.fatherId = query.fatherId;
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
                mother: { select: { id: true, visualId: true, currentEid: true } },
                father: { select: { id: true, visualId: true, currentEid: true } },
            },
            orderBy: { breedingDate: 'desc' },
        });
    }
    async findOne(farmId, id) {
        const breeding = await this.prisma.breeding.findFirst({
            where: {
                id,
                farmId,
                deletedAt: null,
            },
            include: {
                mother: { select: { id: true, visualId: true, currentEid: true, birthDate: true } },
                father: { select: { id: true, visualId: true, currentEid: true } },
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
                farmId,
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
        if (dto.expectedBirthDate)
            updateData.expectedBirthDate = new Date(dto.expectedBirthDate);
        if (dto.actualBirthDate)
            updateData.actualBirthDate = new Date(dto.actualBirthDate);
        return this.prisma.breeding.update({
            where: { id },
            data: updateData,
            include: {
                mother: { select: { id: true, visualId: true, currentEid: true } },
                father: { select: { id: true, visualId: true, currentEid: true } },
            },
        });
    }
    async remove(farmId, id) {
        const existing = await this.prisma.breeding.findFirst({
            where: {
                id,
                farmId,
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
    async getUpcomingBirthDates(farmId, days = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return this.prisma.breeding.findMany({
            where: {
                farmId,
                deletedAt: null,
                status: { in: ['confirmed', 'in_progress'] },
                expectedBirthDate: {
                    gte: new Date(),
                    lte: futureDate,
                },
            },
            include: {
                mother: { select: { id: true, visualId: true, currentEid: true } },
            },
            orderBy: { expectedBirthDate: 'asc' },
        });
    }
};
exports.BreedingsService = BreedingsService;
exports.BreedingsService = BreedingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BreedingsService);
//# sourceMappingURL=breedings.service.js.map