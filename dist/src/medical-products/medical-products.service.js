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
exports.MedicalProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MedicalProductsService = class MedicalProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(farmId, dto) {
        return this.prisma.medicalProduct.create({
            data: {
                ...dto,
                farmId,
            },
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
        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }
        return this.prisma.medicalProduct.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }
    async findOne(farmId, id) {
        const product = await this.prisma.medicalProduct.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Medical product ${id} not found`);
        }
        return product;
    }
    async update(farmId, id, dto) {
        const existing = await this.prisma.medicalProduct.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Medical product ${id} not found`);
        }
        return this.prisma.medicalProduct.update({
            where: { id },
            data: {
                ...dto,
                version: existing.version + 1,
            },
        });
    }
    async remove(farmId, id) {
        const existing = await this.prisma.medicalProduct.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Medical product ${id} not found`);
        }
        return this.prisma.medicalProduct.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                version: existing.version + 1,
            },
        });
    }
};
exports.MedicalProductsService = MedicalProductsService;
exports.MedicalProductsService = MedicalProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MedicalProductsService);
//# sourceMappingURL=medical-products.service.js.map