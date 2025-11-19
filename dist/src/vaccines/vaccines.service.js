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
exports.VaccinesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VaccinesService = class VaccinesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(farmId, dto) {
        return this.prisma.vaccine.create({
            data: {
                ...dto,
                farmId,
            },
            include: { species: true },
        });
    }
    async findAll(farmId, query) {
        const where = {
            farmId,
            deletedAt: null,
        };
        if (query.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }
        if (query.speciesId) {
            where.speciesId = query.speciesId;
        }
        if (query.disease) {
            where.disease = { contains: query.disease, mode: 'insensitive' };
        }
        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }
        return this.prisma.vaccine.findMany({
            where,
            include: { species: true },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(farmId, id) {
        const vaccine = await this.prisma.vaccine.findFirst({
            where: { id, farmId, deletedAt: null },
            include: { species: true },
        });
        if (!vaccine) {
            throw new common_1.NotFoundException(`Vaccine ${id} not found`);
        }
        return vaccine;
    }
    async update(farmId, id, dto) {
        const existing = await this.prisma.vaccine.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Vaccine ${id} not found`);
        }
        return this.prisma.vaccine.update({
            where: { id },
            data: {
                ...dto,
                version: existing.version + 1,
            },
            include: { species: true },
        });
    }
    async remove(farmId, id) {
        const existing = await this.prisma.vaccine.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Vaccine ${id} not found`);
        }
        return this.prisma.vaccine.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                version: existing.version + 1,
            },
            include: { species: true },
        });
    }
};
exports.VaccinesService = VaccinesService;
exports.VaccinesService = VaccinesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VaccinesService);
//# sourceMappingURL=vaccines.service.js.map